package pubsub

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/nats-io/nats.go"
)

const (
	TraceSubject  = "upblit.telemetry.traces"
	LogsSubject   = "upblit.telemetry.logs"
	AlertsSubject = "upblit.alerts"
)

type Client struct {
	conn *nats.Conn
}

func New(url string) (*Client, error) {
	serverURL := strings.TrimSpace(url)
	if serverURL == "" {
		serverURL = nats.DefaultURL
	}

	conn, err := nats.Connect(serverURL)
	if err != nil {
		return nil, fmt.Errorf("connect nats: %w", err)
	}

	return &Client{conn: conn}, nil
}

func (c *Client) Publish(subject string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return c.conn.Publish(subject, data)
}

func (c *Client) Subscribe(subject string, handler nats.MsgHandler) (*nats.Subscription, error) {
	return c.conn.Subscribe(subject, handler)
}

func (c *Client) Close() {
	if c != nil && c.conn != nil {
		c.conn.Close()
	}
}