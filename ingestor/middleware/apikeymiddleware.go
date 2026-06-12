package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

type APIClient struct {
	ID            int64  `json:"id"`
	APIKey        string `json:"api_key"`
	ProjectID     int64  `json:"project_id"`
	ApplicationID int64  `json:"application_id"`
}

// Middleware to validate API key
func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/health" {
			c.Next()
			return
		}
		clientKey := c.GetHeader("x-api-key")

		if clientKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing api key"})
			c.Abort()
			return
		}

		// Require the "upblit_" prefix
		if !strings.HasPrefix(clientKey, "upblit_") {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid api key"})
			c.Abort()
			return
		}

		// Remove the prefix before looking it up in the DB
		clientKey = strings.TrimPrefix(clientKey, "upblit_")

		client, err := GetAPIClientByKey(clientKey)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid api key"})
			c.Abort()
			return
		}

		c.Set("project_id", client.ProjectID)
		c.Set("application_id", client.ApplicationID)

		c.Next()
	}
}

// Fetch API client from Supabase
func GetAPIClientByKey(key string) (*APIClient, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseAPIKey := os.Getenv("SUPABASE_API_KEY")
	if supabaseURL == "" || supabaseAPIKey == "" {
		return nil, fmt.Errorf("missing supabase environment variables")
	}

	// ✅ URL encode the key (VERY IMPORTANT)
	encodedKey := url.QueryEscape(key)

	fullURL := fmt.Sprintf(
		"%s/rest/v1/api_client?api_key=eq.%s&limit=1",
		supabaseURL,
		encodedKey,
	)

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return nil, err
	}

	// Headers required by Supabase
	req.Header.Set("apikey", supabaseAPIKey)
	req.Header.Set("Authorization", "Bearer "+supabaseAPIKey)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("supabase error: %s", resp.Status)
	}

	var result []APIClient
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("client not found")
	}

	return &result[0], nil
}
