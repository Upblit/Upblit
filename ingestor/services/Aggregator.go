package services

import (
	"fmt"
	"sync"
	"time"

	"UpblitIngestor/models"
)

// Internal state for aggregation (not stored directly in DB)
type metricState struct {
	ProjectID     int64
	ApplicationID int64
	Timestamp     time.Time // bucket start

	RequestCount int64
	ErrorCount   int64

	TotalLatency int64
	MaxLatency   int64
	MinLatency   int64
}

// Main aggregator
type MetricsAggregator struct {
	mu      sync.Mutex
	buckets map[string]*metricState
}

// Constructor
func NewMetricsAggregator() *MetricsAggregator {
	return &MetricsAggregator{
		buckets: make(map[string]*metricState),
	}
}

// Generate unique key: Project + App + Time bucket
func getKey(projectID, appID int64, bucket time.Time) string {
	return fmt.Sprintf("%d_%d_%s",
		projectID,
		appID,
		bucket.Format(time.RFC3339),
	)
}

// 5-minute bucket logic
func getBucketTime(t time.Time) time.Time {
	return t.Truncate(5 * time.Minute)
}

// Add traces (called continuously from Kafka consumer)
func (m *MetricsAggregator) AddTraces(traces []models.Trace) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, t := range traces {
		bucket := getBucketTime(t.Timestamp)
		key := getKey(t.ProjectID, t.ApplicationID, bucket)

		state, exists := m.buckets[key]
		if !exists {
			state = &metricState{
				ProjectID:     t.ProjectID,
				ApplicationID: t.ApplicationID,
				Timestamp:     bucket,
				MaxLatency:    t.DurationMs,
				MinLatency:    t.DurationMs,
			}
			m.buckets[key] = state
		}

		// Update aggregation
		state.RequestCount++
		state.TotalLatency += t.DurationMs

		if t.ResponseStatus >= 400 {
			state.ErrorCount++
		}

		if t.DurationMs > state.MaxLatency {
			state.MaxLatency = t.DurationMs
		}

		if t.DurationMs < state.MinLatency {
			state.MinLatency = t.DurationMs
		}
	}
}

// Convert internal state → final Metrics model
func (m *MetricsAggregator) Flush() []models.Metrics {
	m.mu.Lock()
	defer m.mu.Unlock()

	results := make([]models.Metrics, 0, len(m.buckets))

	for _, state := range m.buckets {
		var avg float64
		if state.RequestCount > 0 {
			avg = float64(state.TotalLatency) / float64(state.RequestCount)
		}

		metric := models.Metrics{
			ProjectID:     state.ProjectID,
			ApplicationID: state.ApplicationID,
			Timestamp:     state.Timestamp,

			RequestCount: state.RequestCount,
			ErrorCount:   state.ErrorCount,
			AvgLatency:   avg,
			MaxLatency:   state.MaxLatency,
			MinLatency:   state.MinLatency,
		}

		results = append(results, metric)
	}

	// Reset buckets after flush
	m.buckets = make(map[string]*metricState)

	return results
}
