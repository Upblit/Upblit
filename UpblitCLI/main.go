package main

import (
	"bytes"
	"encoding/json"
	"encoding/base64"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// simple CLI focused only on the user-requested commands

func printHelp() {
	fmt.Println(`upblit CLI

Usage:
  upblit help                 Show all commands
  upblit login                Login via browser
  upblit logout               Logout and remove saved tokens

  upblit org list             List all organizations for the user
  upblit org switch <orgId>   Switch current organization

  upblit project list         List projects for the selected org
  upblit project switch <id>  Switch current project

  upblit app list             List applications for the selected project
  upblit app switch <id>      Switch current application
  upblit app create <name> --env <env> -d "description"

  upblit generate apikey      Generate an API key for the selected application

  upblit log                 Last 10 logs
  upblit trace               Last 10 traces
  upblit uptime              Last 10 uptime entries
  upblit metrices            Last 10 metrics
`)
}

// token storage helpers
func dirPath() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".upblit")
}

func ensureDir() error {
	d := dirPath()
	return os.MkdirAll(d, 0700)
}

func tokenFile() string { return filepath.Join(dirPath(), "token") }
func refreshFile() string { return filepath.Join(dirPath(), "refresh") }
func selFile(kind string) string { return filepath.Join(dirPath(), kind) }

func saveToken(token string) error {
	if err := ensureDir(); err != nil {
		return err
	}
	return os.WriteFile(tokenFile(), []byte(token), 0600)
}

func loadToken() (string, error) {
	b, err := os.ReadFile(tokenFile())
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(b)), nil
}

func deleteToken() error {
	_ = os.Remove(tokenFile())
	_ = os.Remove(refreshFile())
	return nil
}

// open browser helper
func openBrowser(u string) error {
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", u}
	case "darwin":
		cmd = "open"
		args = []string{u}
	default:
		cmd = "xdg-open"
		args = []string{u}
	}
	return exec.Command(cmd, args...).Start()
}

// startCliLogin opens browser and waits for callback with token
func startCliLogin() {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("failed to start local listener: %v", err)
	}
	defer ln.Close()
	port := ln.Addr().(*net.TCPAddr).Port
	redirect := fmt.Sprintf("http://127.0.0.1:%d/callback", port)

	backend := os.Getenv("UPBLIT_API_URL")
	if backend == "" {
		backend = "http://localhost:8080"
	}
	startUrl := backend + "/auth/cli/start?provider=github&redirectUri=" + url.QueryEscape(redirect)

	go func() { _ = openBrowser(startUrl) }()

	srv := &http.Server{}
	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		refresh := r.URL.Query().Get("refresh")
		if token == "" {
			http.Error(w, "no token returned", http.StatusBadRequest)
			return
		}
		if err := saveToken(token); err != nil {
			http.Error(w, "failed to save token", http.StatusInternalServerError)
			return
		}
		_ = os.WriteFile(refreshFile(), []byte(refresh), 0600)
		fmt.Fprint(w, "Authentication successful. You can close this window.")
		go func() { _ = srv.Close() }()
	})
	srv.Handler = mux
	srv.Addr = fmt.Sprintf("127.0.0.1:%d", port)
	_ = srv.Serve(ln)
}

// simple API helpers
func apiURL(path string) string {
	base := os.Getenv("UPBLIT_API_URL")
	if base == "" {
		base = "http://localhost:8080"
	}
	return strings.TrimRight(base, "/") + path
}

func apiGet(path string, params map[string]string) ([]byte, error) {
	token, err := loadToken()
	if err != nil {
		return nil, fmt.Errorf("not logged in")
	}
	u, _ := url.Parse(apiURL(path))
	q := u.Query()
	for k, v := range params {
		q.Set(k, v)
	}
	u.RawQuery = q.Encode()
	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", u.String(), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	if resp.StatusCode == 401 {
		// try to refresh once
		if err := attemptRefresh(); err != nil {
			return nil, fmt.Errorf("api error: %s", string(b))
		}
		// retry with new token
		token, err = loadToken()
		if err != nil {
			return nil, fmt.Errorf("not logged in")
		}
		req, _ = http.NewRequest("GET", u.String(), nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, err = client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		b, _ = io.ReadAll(resp.Body)
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("api error: %s", string(b))
	}
	return b, nil
}

func apiPostJSON(path string, body any) ([]byte, error) {
	token, err := loadToken()
	if err != nil {
		return nil, fmt.Errorf("not logged in")
	}
	buf := new(bytes.Buffer)
	if body != nil {
		if err := json.NewEncoder(buf).Encode(body); err != nil {
			return nil, err
		}
	}
	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("POST", apiURL(path), buf)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	if resp.StatusCode == 401 {
		// try refresh and retry once
		if err := attemptRefresh(); err != nil {
			return nil, fmt.Errorf("api error: %s", string(b))
		}
		token, err = loadToken()
		if err != nil {
			return nil, fmt.Errorf("not logged in")
		}
		// rebuild request with new token
		req, _ = http.NewRequest("POST", apiURL(path), bytes.NewReader(buf.Bytes()))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		resp, err = client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		b, _ = io.ReadAll(resp.Body)
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("api error: %s", string(b))
	}
	return b, nil
}

// attemptRefresh tries to use the saved refresh token to obtain a new JWT
func attemptRefresh() error {
	rb, err := os.ReadFile(refreshFile())
	if err != nil {
		return err
	}
	refresh := strings.TrimSpace(string(rb))
	if refresh == "" {
		return fmt.Errorf("no refresh token available")
	}
	client := &http.Client{Timeout: 10 * time.Second}
	u := apiURL("/auth/refresh") + "?refreshToken=" + url.QueryEscape(refresh)
	req, _ := http.NewRequest("GET", u, nil)
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return fmt.Errorf("refresh failed: %s", string(b))
	}
	newToken := strings.TrimSpace(string(b))
	if newToken == "" {
		return fmt.Errorf("empty token from refresh")
	}
	return saveToken(newToken)
}

func prettyPrintJSON(b []byte) {
	var out bytes.Buffer
	if err := json.Indent(&out, b, "", "  "); err != nil {
		fmt.Println(string(b))
		return
	}
	fmt.Println(out.String())
}

// safePrintList prints a concise, non-sensitive summary for lists returned by the API.
func safePrintList(b []byte, kind string) {
	var data interface{}
	if err := json.Unmarshal(b, &data); err != nil {
		fmt.Println(string(b))
		return
	}

	var items []interface{}
	switch v := data.(type) {
	case []interface{}:
		items = v
	case map[string]interface{}:
		// try common array holders
		if a, ok := v["items"].([]interface{}); ok {
			items = a
		} else if a, ok := v["data"].([]interface{}); ok {
			items = a
		} else {
			// single object -> treat as single-item list
			items = []interface{}{v}
		}
	default:
		fmt.Println(string(b))
		return
	}

	// allowed fields per kind
	allowed := map[string][]string{
		"org":      {"id", "organizationId", "name", "slug", "displayName"},
		"project":  {"id", "projectId", "name", "slug"},
		"app":      {"id", "applicationId", "name", "environment"},
		"default":  {"id", "name"},
	}

	keys := allowed[kind]
	if keys == nil {
		keys = allowed["default"]
	}

	for _, it := range items {
		if m, ok := it.(map[string]interface{}); ok {
			out := make([]string, 0, len(keys))
			for _, k := range keys {
				if v, ok := m[k]; ok {
					out = append(out, fmt.Sprintf("%s=%v", k, v))
				}
			}
			// if no allowed keys found, print compact JSON for the item
			if len(out) == 0 {
				b, _ := json.Marshal(m)
				fmt.Println(string(b))
			} else {
				fmt.Println(strings.Join(out, " "))
			}
		} else {
			// primitive item
			fmt.Printf("- %v\n", it)
		}
	}
}

// decodeJWTPayload decodes the JWT payload (base64url) and returns pretty JSON bytes
func decodeJWTPayload(token string) ([]byte, error) {
	parts := strings.Split(token, ".")
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid token")
	}
	payload := parts[1]
	// add padding if needed and decode base64url
	decoded, err := base64.RawURLEncoding.DecodeString(payload)
	if err != nil {
		// try standard URL encoding with padding
		decoded, err = base64.URLEncoding.DecodeString(payload)
		if err != nil {
			return nil, err
		}
	}
	// pretty-print JSON
	var pretty bytes.Buffer
	if err := json.Indent(&pretty, decoded, "", "  "); err != nil {
		return decoded, nil
	}
	return pretty.Bytes(), nil
}

// printClaimsSummary prints a concise selection of common JWT claims
func printClaimsSummary(jsonBytes []byte) {
	var m map[string]interface{}
	if err := json.Unmarshal(jsonBytes, &m); err != nil {
		fmt.Println(string(jsonBytes))
		return
	}
	// prefer common claim keys
	keys := []string{"sub", "id", "userId", "username", "email", "name", "plan"}
	for _, k := range keys {
		if v, ok := m[k]; ok {
			fmt.Printf("%s: %v\n", k, v)
		}
	}
	// fallback: if none printed, show compact JSON
	printed := 0
	for _, k := range keys {
		if _, ok := m[k]; ok {
			printed++
		}
	}
	if printed == 0 {
		// print a compact one-line JSON
		b, _ := json.Marshal(m)
		fmt.Println(string(b))
	}
}

func saveSelection(kind, val string) error {
	if err := ensureDir(); err != nil {
		return err
	}
	return os.WriteFile(selFile(kind), []byte(val), 0600)
}

func loadSelection(kind string) (string, error) {
	b, err := os.ReadFile(selFile(kind))
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(b)), nil
}

func main() {
	if len(os.Args) < 2 {
		printHelp()
		return
	}

	cmd := os.Args[1]
	switch cmd {
	case "help", "-h", "--help", "all":
		printHelp()
		return
	case "login":
		startCliLogin()
		return
	case "logout":
		_ = deleteToken()
		fmt.Println("logged out")
		return
	case "whoami":
		token, err := loadToken()
		if err != nil {
			fmt.Println("not logged in")
			return
		}
		info, err := decodeJWTPayload(token)
		if err != nil {
			fmt.Println("failed to parse token:", err)
			return
		}
		printClaimsSummary(info)
		return
	case "org":
		if len(os.Args) < 3 {
			fmt.Println("usage: upblit org <list|switch>")
			return
		}
		switch os.Args[2] {
		case "list":
			b, err := apiGet("/org", nil)
			if err != nil {
				fmt.Println("error:", err)
				return
			}
			safePrintList(b, "org")
		case "switch":
			if len(os.Args) < 4 {
				fmt.Println("usage: upblit org switch <orgId>")
				return
			}
			_ = saveSelection("org", os.Args[3])
			fmt.Println("switched org ->", os.Args[3])
		default:
			fmt.Println("unknown org command")
		}
		return
	case "project":
		if len(os.Args) < 3 {
			fmt.Println("usage: upblit project <list|switch>")
			return
		}
		switch os.Args[2] {
		case "list":
			org, _ := loadSelection("org")
			params := map[string]string{}
			if org != "" {
				params["OrganizationId"] = org
			}
			b, err := apiGet("/project", params)
			if err != nil {
				fmt.Println("error:", err)
				return
			}
			safePrintList(b, "project")
		case "switch":
			if len(os.Args) < 4 {
				fmt.Println("usage: upblit project switch <projectId>")
				return
			}
			_ = saveSelection("project", os.Args[3])
			fmt.Println("switched project ->", os.Args[3])
		default:
			fmt.Println("unknown project command")
		}
		return
	case "app":
		if len(os.Args) < 3 {
			fmt.Println("usage: upblit app <list|switch|create>")
			return
		}
		switch os.Args[2] {
		case "list":
			proj, _ := loadSelection("project")
			params := map[string]string{}
			if proj != "" {
				params["projectId"] = proj
			}
			b, err := apiGet("/applications", params)
			if err != nil {
				fmt.Println("error:", err)
				return
			}
			safePrintList(b, "app")
		case "switch":
			if len(os.Args) < 4 {
				fmt.Println("usage: upblit app switch <appId>")
				return
			}
			_ = saveSelection("app", os.Args[3])
			fmt.Println("switched app ->", os.Args[3])
		case "create":
			if len(os.Args) < 4 {
				fmt.Println("usage: upblit app create <name> --env <env> -d \"description\"")
				return
			}
			// simple flag parsing for create
			appName := os.Args[3]
			env := "production"
			desc := ""
			fs := flag.NewFlagSet("appcreate", flag.ContinueOnError)
			fs.StringVar(&env, "env", "production", "environment")
			fs.StringVar(&desc, "d", "", "description")
			_ = fs.Parse(os.Args[4:])
			payload := map[string]any{"name": appName, "environment": env, "description": desc}
			b, err := apiPostJSON("/applications", payload)
			if err != nil {
				fmt.Println("error:", err)
				return
			}
			prettyPrintJSON(b)
		default:
			fmt.Println("unknown app command")
		}
		return
	case "generate":
		if len(os.Args) >= 2 && len(os.Args) >= 3 && os.Args[2] == "apikey" {
			app, _ := loadSelection("app")
			if app == "" {
				fmt.Println("no app selected; use 'upblit app switch <id>'")
				return
			}
			b, err := apiPostJSON("/apikey?ApplicationId="+url.QueryEscape(app), nil)
			if err != nil {
				fmt.Println("error:", err)
				return
			}
			prettyPrintJSON(b)
			return
		}
		fmt.Println("usage: upblit generate apikey")
		return
	case "log", "trace", "uptime", "metrices":
		// map to backend query endpoints
		var path string
		switch cmd {
		case "log":
			path = "/query/logs"
		case "trace":
			path = "/query/traces"
		case "uptime":
			path = "/uptime/monitors"
		case "metrices":
			path = "/query/metrics"
		}
		params := map[string]string{"size": "10"}
		// if project selected, prefer scoping
		if p, err := loadSelection("project"); err == nil && p != "" {
			params["projectId"] = p
		}
		b, err := apiGet(path, params)
		if err != nil {
			fmt.Println("error:", err)
			return
		}
		prettyPrintJSON(b)
		return
	default:
		fmt.Println("unknown command:", cmd)
		printHelp()
	}
}
