package mongo

import (
	"context"
	"time"

	"upblitpinger/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Store struct {
	collection *mongo.Collection
}

func New(database *mongo.Database, collectionName string) *Store {
	return &Store{collection: database.Collection(collectionName)}
}

func (s *Store) EnsureIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "monitorId", Value: 1}, {Key: "timestamp", Value: -1}}, Options: options.Index().SetName("monitor_timestamp_idx")},
		{Keys: bson.D{{Key: "projectId", Value: 1}, {Key: "timestamp", Value: -1}}, Options: options.Index().SetName("project_timestamp_idx")},
		{Keys: bson.D{{Key: "timestamp", Value: -1}}, Options: options.Index().SetName("timestamp_idx")},
	}
	_, err := s.collection.Indexes().CreateMany(ctx, indexes)
	return err
}

func (s *Store) RecordCheck(ctx context.Context, record domain.UptimeCheckRecord) error {
	if record.ID.IsZero() {
		record.ID = primitive.NewObjectID()
	}
	if record.Timestamp.IsZero() {
		record.Timestamp = time.Now().UTC()
	}
	_, err := s.collection.InsertOne(ctx, record)
	return err
}

func (s *Store) ListHistory(ctx context.Context, monitorID string, from, to time.Time) ([]domain.UptimeCheckRecord, error) {
	filter := bson.M{"monitorId": monitorID}
	if !from.IsZero() || !to.IsZero() {
		timeFilter := bson.M{}
		if !from.IsZero() {
			timeFilter["$gte"] = from.UTC()
		}
		if !to.IsZero() {
			timeFilter["$lte"] = to.UTC()
		}
		filter["timestamp"] = timeFilter
	}

	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	cur, err := s.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	results := make([]domain.UptimeCheckRecord, 0)
	for cur.Next(ctx) {
		var record domain.UptimeCheckRecord
		if err := cur.Decode(&record); err != nil {
			return nil, err
		}
		results = append(results, record)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return results, nil
}