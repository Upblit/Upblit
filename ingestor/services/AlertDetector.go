package services

import (
	"fmt"
	"strings"
	"time"

	"UpblitIngestor/models"
	"UpblitIngestor/pubsub"
)

const slowTraceThresholdMs int64 = 1500

func DetectTraceAlerts(traces []models.Trace) []models.AlertEvent {
	alerts := make([]models.AlertEvent, 0)
	now := time.Now().UTC()

	for _, trace := range traces {
		if trace.ResponseStatus >= 500 {
			alerts = append(alerts, models.AlertEvent{
				Subject:       pubsub.AlertsSubject,
				Source:        "ingestor",
				Kind:          "trace_error",
				Severity:      "critical",
				Title:         "trace response error",
				Message:       fmt.Sprintf("application %d returned %d for %s", trace.ApplicationID, trace.ResponseStatus, trace.RequestURL),
				ProjectID:     trace.ProjectID,
				ApplicationID: trace.ApplicationID,
				DetectedAt:    now,
				CreatedAt:     now,
				Metadata: map[string]any{
					"traceId":        trace.TraceID,
					"requestMethod":  trace.RequestMethod,
					"requestURL":     trace.RequestURL,
					"responseStatus": trace.ResponseStatus,
					"durationMs":     trace.DurationMs,
				},
			})
		}

		if trace.DurationMs >= slowTraceThresholdMs {
			alerts = append(alerts, models.AlertEvent{
				Subject:       pubsub.AlertsSubject,
				Source:        "ingestor",
				Kind:          "trace_latency",
				Severity:      "warning",
				Title:         "slow trace detected",
				Message:       fmt.Sprintf("application %d took %dms for %s", trace.ApplicationID, trace.DurationMs, trace.RequestURL),
				ProjectID:     trace.ProjectID,
				ApplicationID: trace.ApplicationID,
				DetectedAt:    now,
				CreatedAt:     now,
				Metadata: map[string]any{
					"traceId":        trace.TraceID,
					"requestMethod":  trace.RequestMethod,
					"requestURL":     trace.RequestURL,
					"responseStatus": trace.ResponseStatus,
					"durationMs":     trace.DurationMs,
				},
			})
		}
	}

	return alerts
}

func DetectLogAlerts(logs []models.Log) []models.AlertEvent {
	alerts := make([]models.AlertEvent, 0)
	now := time.Now().UTC()

	for _, entry := range logs {
		level := strings.ToLower(strings.TrimSpace(entry.Level))
		if level == "error" || level == "fatal" || level == "panic" {
			alerts = append(alerts, models.AlertEvent{
				Subject:       pubsub.AlertsSubject,
				Source:        "ingestor",
				Kind:          "log_anomaly",
				Severity:      "critical",
				Title:         "error log detected",
				Message:       entry.Message,
				ProjectID:     entry.ProjectID,
				ApplicationID: entry.ApplicationID,
				DetectedAt:    now,
				CreatedAt:     now,
				Metadata: map[string]any{
					"traceId": entry.TraceID,
					"level":   entry.Level,
					"type":    entry.Type,
				},
			})
		}
	}

	return alerts
}