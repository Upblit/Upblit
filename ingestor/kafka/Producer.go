package kafka

import (
	"context"
	"encoding/json"
	"log"
	"strconv"
	"time"

	"UpblitIngestor/models"

	"github.com/segmentio/kafka-go"
)

type Producer struct {
	writer *kafka.Writer
}

// NewProducer creates a Kafka producer with sane production defaults
func NewProducer(broker string, topic string) *Producer {
	return &Producer{
		writer: &kafka.Writer{
			Addr:         kafka.TCP(broker),
			Topic:        topic,
			Balancer:     &kafka.LeastBytes{},
			BatchSize:    100,
			BatchTimeout: 100 * time.Millisecond,
			Compression:  kafka.Snappy, // efficient for logs/traces
		},
	}
}

// internal reusable write with retry + timeout
func (p *Producer) writeMessages(msgs []kafka.Message) error {
	var err error

	for i := 0; i < 3; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		err = p.writer.WriteMessages(ctx, msgs...)
		cancel()

		if err == nil {
			return nil
		}

		log.Println("kafka write attempt failed:", err)
		time.Sleep(100 * time.Millisecond)
	}

	log.Println("kafka write failed after retries:", err)
	return err
}

// SendTraces sends trace data to Kafka
func (p *Producer) SendTraces(docs []models.Trace) error {
	msgs := make([]kafka.Message, 0, len(docs))

	for _, doc := range docs {
		data, err := json.Marshal(doc)
		if err != nil {
			return err
		}

		msgs = append(msgs, kafka.Message{
			Key:   []byte(strconv.FormatInt(doc.ApplicationID, 10)),
			Value: data,
		})
	}

	return p.writeMessages(msgs)
}

// SendLogs sends log data to Kafka
func (p *Producer) SendLogs(logs []models.Log) error {
	msgs := make([]kafka.Message, 0, len(logs))

	for _, logItem := range logs {
		data, err := json.Marshal(logItem)
		if err != nil {
			return err
		}

		msgs = append(msgs, kafka.Message{
			Key:   []byte(strconv.FormatInt(logItem.ApplicationID, 10)),
			Value: data,
		})
	}

	return p.writeMessages(msgs)
}

// Close safely closes the Kafka writer
func (p *Producer) Close() {
	if p.writer != nil {
		if err := p.writer.Close(); err != nil {
			log.Println("error closing producer:", err)
		}
	}
}
