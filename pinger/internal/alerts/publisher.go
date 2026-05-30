package alerts

import (
	"encoding/json"
	"fmt"
	"strings"

	"upblitpinger/internal/domain"

	"github.com/nats-io/nats.go"
)

type Publisher struct {
	conn    *nats.Conn
	subject string
}

func NewPublisher(url, subject string) (*Publisher, error) {
	serverURL := strings.TrimSpace(url)
	if serverURL == "" {
		serverURL = nats.DefaultURL
	}

	conn, err := nats.Connect(serverURL)
	if err != nil {
		return nil, fmt.Errorf("connect nats: %w", err)
	}

	return &Publisher{conn: conn, subject: strings.TrimSpace(subject)}, nil
}

func (p *Publisher) Publish(alert domain.AlertEvent) error {
	data, err := json.Marshal(alert)
	if err != nil {
		return err
	}
	return p.conn.Publish(p.subject, data)
}

func (p *Publisher) Close() {
	if p != nil && p.conn != nil {
		p.conn.Close()
	}
}