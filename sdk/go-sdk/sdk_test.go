package upblit

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestMiddlewareHealth(t *testing.T) {
	sdk := New("token", WithFlushInterval(0))
	defer sdk.Close()

	handler := sdk.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("health should not call next handler")
	}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body map[string]string
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if body["status"] != "ok" {
		t.Fatalf("expected status ok, got %q", body["status"])
	}

	if len(sdk.traceBuffer) != 0 {
		t.Fatalf("expected no health trace, got %d", len(sdk.traceBuffer))
	}
}

func TestMiddlewareCapturesRequestAndNestedSpans(t *testing.T) {
	sdk := New("token", WithFlushInterval(0))
	defer sdk.Close()

	handler := sdk.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := sdk.Service(r.Context(), "users.get", func(ctx context.Context) error {
			sdk.Info(ctx, "loaded user")
			return sdk.Call(ctx, "database", func(context.Context) error {
				return nil
			})
		})
		if err != nil {
			t.Fatal(err)
		}
		w.WriteHeader(http.StatusCreated)
	}))

	req := httptest.NewRequest(http.MethodGet, "/users/1?active=true", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d", res.Code)
	}

	if len(sdk.traceBuffer) != 3 {
		t.Fatalf("expected 3 traces, got %d", len(sdk.traceBuffer))
	}

	if sdk.traceBuffer[0].RequestMethod != "external:database" {
		t.Fatalf("expected database span first, got %q", sdk.traceBuffer[0].RequestMethod)
	}
	if sdk.traceBuffer[1].RequestMethod != "service:users.get" {
		t.Fatalf("expected service span second, got %q", sdk.traceBuffer[1].RequestMethod)
	}
	if sdk.traceBuffer[2].RequestMethod != "controller:GET" {
		t.Fatalf("expected controller span last, got %q", sdk.traceBuffer[2].RequestMethod)
	}
	if sdk.traceBuffer[2].RequestURL != "/users/1?active=true" {
		t.Fatalf("expected request URI, got %q", sdk.traceBuffer[2].RequestURL)
	}
	if len(sdk.logBuffer) != 1 {
		t.Fatalf("expected 1 log, got %d", len(sdk.logBuffer))
	}
	if sdk.logBuffer[0].TraceID == nil {
		t.Fatal("expected log to include trace ID")
	}
}

func TestFlushRestoresBatchOnFailure(t *testing.T) {
	sdk := New("token", WithBaseURL("http://127.0.0.1:1"), WithFlushInterval(0))
	defer sdk.Close()

	sdk.pushTrace(Trace{TraceID: "trace", SpanID: "span"})

	if err := sdk.FlushTraces(context.Background()); err == nil {
		t.Fatal("expected flush error")
	}

	if len(sdk.traceBuffer) != 1 {
		t.Fatalf("expected trace restored, got %d", len(sdk.traceBuffer))
	}
}

func TestFatalLogSendsImmediately(t *testing.T) {
	var apiKey string
	var logs []LogEntry

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey = r.Header.Get("x-api-key")
		var payload struct {
			Logs []LogEntry `json:"logs"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		logs = payload.Logs
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	sdk := New("token", WithBaseURL(server.URL), WithFlushInterval(0))
	defer sdk.Close()

	sdk.Fatal(context.Background(), "boom")

	if apiKey != "token" {
		t.Fatalf("expected API key header, got %q", apiKey)
	}
	if len(logs) != 1 || logs[0].Level != "fatal" || logs[0].Message != "boom" {
		t.Fatalf("unexpected logs: %+v", logs)
	}
	if len(sdk.logBuffer) != 0 {
		t.Fatalf("fatal log should not be buffered")
	}
}

func TestFlushPostsTelemetry(t *testing.T) {
	var tracePath string
	var logPath string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/ingest/traces":
			tracePath = r.URL.Path
		case "/ingest/logs":
			logPath = r.URL.Path
		default:
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	sdk := New("token", WithBaseURL(server.URL), WithFlushInterval(0))
	defer sdk.Close()

	sdk.pushTrace(Trace{TraceID: "trace", SpanID: "span"})
	sdk.Info(context.Background(), "hello")

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	if err := sdk.Flush(ctx); err != nil {
		t.Fatalf("flush: %v", err)
	}

	if tracePath != "/ingest/traces" {
		t.Fatalf("expected traces endpoint, got %q", tracePath)
	}
	if logPath != "/ingest/logs" {
		t.Fatalf("expected logs endpoint, got %q", logPath)
	}
	if len(sdk.traceBuffer) != 0 || len(sdk.logBuffer) != 0 {
		t.Fatal("expected buffers to be empty")
	}
}
