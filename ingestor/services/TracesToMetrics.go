package services

import (
	"time"

	"UpblitIngestor/models"
)

func TracesToMetrics(docs []models.Trace) models.Metrics {
	if len(docs) == 0 {
		return models.Metrics{}
	}

	var totalLatency int64
	var maxLatency int64
	var minLatency int64 = docs[0].DurationMs
	var errorCount int64

	for _, d := range docs {
		totalLatency += d.DurationMs

		if d.DurationMs > maxLatency {
			maxLatency = d.DurationMs
		}

		if d.DurationMs < minLatency {
			minLatency = d.DurationMs
		}

		if d.ResponseStatus >= 400 {
			errorCount++
		}
	}

	avgLatency := float64(totalLatency) / float64(len(docs))

	return models.Metrics{
		ProjectID:     docs[0].ProjectID,
		ApplicationID: docs[0].ApplicationID,
		Timestamp:     time.Now().UTC(),

		RequestCount: int64(len(docs)),
		ErrorCount:   errorCount,
		AvgLatency:   avgLatency,
		MaxLatency:   maxLatency,
		MinLatency:   minLatency,
	}
}
