package kafka

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"UpblitIngestor/models"
	"UpblitIngestor/services"

	"github.com/segmentio/kafka-go"
	"go.mongodb.org/mongo-driver/mongo"
)

type LogConsumer struct {
	reader        *kafka.Reader
	logCollection *mongo.Collection
	alertPublisher interface{ Publish(string, any) error }
	alertSubject   string
	batchSize     int
	flushInterval time.Duration
}

func NewLogConsumer(broker, topic, groupID string,
	logCol *mongo.Collection,
	alertPublisher interface{ Publish(string, any) error },
	alertSubject string,
) *LogConsumer {

	return &LogConsumer{
		reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers:     []string{broker},
			Topic:       topic,
			GroupID:     groupID,
			MinBytes:    10e3,
			MaxBytes:    10e6,
			MaxWait:     1 * time.Second,
			StartOffset: kafka.LastOffset,
		}),
		logCollection: logCol,
		alertPublisher: alertPublisher,
		alertSubject:   alertSubject,
		batchSize:     100,
		flushInterval: 2 * time.Second,
	}
}

func (c *LogConsumer) Start(ctx context.Context) {
	log.Println("Log consumer started...")

	batch := make([]models.Log, 0, c.batchSize)
	ticker := time.NewTicker(c.flushInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			c.processBatch(ctx, batch)
			_ = c.reader.Close()
			return

		case <-ticker.C:
			if len(batch) > 0 {
				c.processBatch(ctx, batch)
				batch = batch[:0]
			}

		default:
			msg, err := c.reader.FetchMessage(ctx)
			if err != nil {
				log.Println("fetch error:", err)
				continue
			}

			var logItem models.Log
			if err := json.Unmarshal(msg.Value, &logItem); err != nil {
				log.Println("unmarshal error:", err)
				continue
			}

			batch = append(batch, logItem)

			if len(batch) >= c.batchSize {
				c.processBatch(ctx, batch)

				if err := c.reader.CommitMessages(ctx, msg); err != nil {
					log.Println("commit error:", err)
				}

				batch = batch[:0]
			}
		}
	}
}

func (c *LogConsumer) processBatch(ctx context.Context, batch []models.Log) {
	if len(batch) == 0 {
		return
	}
	dbCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	docs := make([]interface{}, len(batch))
	for i, l := range batch {
		docs[i] = l
	}

	if _, err := c.logCollection.InsertMany(dbCtx, docs); err != nil {
		log.Println("mongo log insert error:", err)
	}

	for _, alert := range services.DetectLogAlerts(batch) {
		if c.alertPublisher == nil {
			continue
		}
		if err := c.alertPublisher.Publish(c.alertSubject, alert); err != nil {
			log.Println("alert publish error:", err)
		}
	}
}
