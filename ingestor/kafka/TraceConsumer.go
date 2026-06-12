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

type TraceConsumer struct {
	reader          *kafka.Reader
	aggregator      *services.MetricsAggregator
	traceCollection *mongo.Collection
	alertPublisher   interface{ Publish(string, any) error }
	alertSubject     string
	batchSize       int
	flushInterval   time.Duration
}

func NewTraceConsumer(broker, topic, groupID string,
	agg *services.MetricsAggregator,
	traceCol *mongo.Collection,
	alertPublisher interface{ Publish(string, any) error },
	alertSubject string,
) *TraceConsumer {

	return &TraceConsumer{
		reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers:     []string{broker},
			Topic:       topic,
			GroupID:     groupID,
			MinBytes:    10e3,
			MaxBytes:    10e6,
			MaxWait:     1 * time.Second,
			StartOffset: kafka.LastOffset,
		}),
		aggregator:      agg,
		traceCollection: traceCol,
		alertPublisher:  alertPublisher,
		alertSubject:    alertSubject,
		batchSize:       100,
		flushInterval:   2 * time.Second,
	}
}

func (c *TraceConsumer) Start(ctx context.Context) {
	log.Println("Trace consumer started...")

	batch := make([]models.Trace, 0, c.batchSize)
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

			var trace models.Trace
			if err := json.Unmarshal(msg.Value, &trace); err != nil {
				log.Println("unmarshal error:", err)
				continue
			}

			batch = append(batch, trace)

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

func (c *TraceConsumer) processBatch(ctx context.Context, batch []models.Trace) {
	if len(batch) == 0 {
		return
	}

	c.aggregator.AddTraces(batch)

	dbCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	docs := make([]interface{}, len(batch))
	for i, t := range batch {
		docs[i] = t
	}

	if _, err := c.traceCollection.InsertMany(dbCtx, docs); err != nil {
		log.Println("mongo trace insert error:", err)
	}

	for _, alert := range services.DetectTraceAlerts(batch) {
		if c.alertPublisher == nil {
			continue
		}
		if err := c.alertPublisher.Publish(c.alertSubject, alert); err != nil {
			log.Println("alert publish error:", err)
		}
	}
}
