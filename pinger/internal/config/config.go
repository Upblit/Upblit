package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	PostgresURI       string
	MongoURI          string
	HTTPAddr          string
	PostgresTable     string
	MongoDBName       string
	MongoCollection   string
	NATSURL           string
	NATSAlertsSubject string
	AlertResponseMs   int64
}

func LoadFromEnv() Config {
	return Config{
		PostgresURI:       strings.TrimSpace(os.Getenv("POSTGRES_URL")),
		MongoURI:          strings.TrimSpace(os.Getenv("MONGODB_URI")),
		HTTPAddr:          defaultString(os.Getenv("HTTP_ADDR"), ":8085"),
		PostgresTable:     defaultString(os.Getenv("UPTIME_TABLE"), "uptime_monitors"),
		MongoDBName:       defaultString(os.Getenv("MONGODB_DATABASE"), "observability"),
		MongoCollection:   defaultString(os.Getenv("UPTIME_COLLECTION"), "uptime"),
		NATSURL:           defaultString(os.Getenv("NATS_URL"), "nats://localhost:4222"),
		NATSAlertsSubject: defaultString(os.Getenv("NATS_ALERTS_SUBJECT"), "upblit.alerts"),
		AlertResponseMs:   parseInt64OrDefault(os.Getenv("ALERT_RESPONSE_MS"), 2000),
	}
}

func (c Config) Validate() error {
	missing := make([]string, 0, 2)
	if c.PostgresURI == "" {
		missing = append(missing, "POSTGRES_URL")
	}
	if c.MongoURI == "" {
		missing = append(missing, "MONGODB_URI")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env: %s", strings.Join(missing, ", "))
	}
	return nil
}

func defaultString(value, fallback string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return fallback
	}
	return trimmed
}

func parseInt64OrDefault(value string, fallback int64) int64 {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return fallback
	}
	parsed, err := strconv.ParseInt(trimmed, 10, 64)
	if err != nil {
		return fallback
	}
	return parsed
}
