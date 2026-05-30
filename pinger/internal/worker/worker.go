package worker

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"upblitpinger/internal/alerts"
	"upblitpinger/internal/domain"
)

type MonitorStore interface {
	List(ctx context.Context, projectID string) ([]domain.UptimeMonitor, error)
	UpdateStatus(ctx context.Context, id int64, record domain.UptimeCheckRecord) error
}

type HistoryStore interface {
	RecordCheck(ctx context.Context, record domain.UptimeCheckRecord) error
}

type AlertPublisher interface {
	Publish(alert domain.AlertEvent) error
}

type Worker struct {
	monitors MonitorStore
	history  HistoryStore
	alerts   AlertPublisher
	alertSubject string
	alertThresholdMs int64
	interval time.Duration
	client   *http.Client
}

func New(monitors MonitorStore, history HistoryStore, alertPublisher AlertPublisher, alertSubject string, alertThresholdMs int64, interval time.Duration) *Worker {
	return &Worker{
		monitors:         monitors,
		history:          history,
		alerts:           alertPublisher,
		alertSubject:     alertSubject,
		alertThresholdMs: alertThresholdMs,
		interval:         interval,
		client:           &http.Client{Timeout: 10 * time.Second},
	}
}

func (w *Worker) Run(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	// Run once immediately
	w.runOnce(ctx)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.runOnce(ctx)
		}
	}
}

func (w *Worker) runOnce(ctx context.Context) {
	monitors, err := w.monitors.List(ctx, "")
	if err != nil {
		log.Printf("worker: failed to list monitors: %v", err)
		return
	}

	for _, m := range monitors {
		// perform check sequentially
		start := time.Now()
		targetURL, err := normalizeHealthURL(m.URL)
		if err != nil {
			record := domain.UptimeCheckRecord{
				MonitorID:  strconv.FormatInt(m.ID, 10),
				ProjectID:  m.ProjectID,
				URL:        m.URL,
				Timestamp:  time.Now().UTC(),
				ResponseMs: 0,
				StatusCode: 0,
				Success:    false,
				Error:      err.Error(),
			}
			_ = w.history.RecordCheck(ctx, record)
			_ = w.monitors.UpdateStatus(ctx, m.ID, record)
			w.publishAlert(m, record, "monitor check failed")
			continue
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
		if err != nil {
			record := domain.UptimeCheckRecord{
				MonitorID:  strconv.FormatInt(m.ID, 10),
				ProjectID:  m.ProjectID,
				URL:        targetURL,
				Timestamp:  time.Now().UTC(),
				ResponseMs: 0,
				StatusCode: 0,
				Success:    false,
				Error:      err.Error(),
			}
			_ = w.history.RecordCheck(ctx, record)
			_ = w.monitors.UpdateStatus(ctx, m.ID, record)
			w.publishAlert(m, record, "request could not be created")
			continue
		}

		resp, err := w.client.Do(req)
		duration := time.Since(start)
		record := domain.UptimeCheckRecord{
			MonitorID:  strconv.FormatInt(m.ID, 10),
			ProjectID:  m.ProjectID,
			URL:        targetURL,
			Timestamp:  time.Now().UTC(),
			ResponseMs: duration.Milliseconds(),
			Success:    false,
		}
		if err != nil {
			record.Error = err.Error()
			_ = w.history.RecordCheck(ctx, record)
			_ = w.monitors.UpdateStatus(ctx, m.ID, record)
			w.publishAlert(m, record, "monitor request failed")
			continue
		}
		record.StatusCode = resp.StatusCode
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			record.Success = true
		}
		resp.Body.Close()
		if !record.Success || record.ResponseMs >= w.alertThresholdMs {
			w.publishAlert(m, record, "monitor anomaly detected")
		}

		if err := w.history.RecordCheck(ctx, record); err != nil {
			log.Printf("worker: failed to record check: %v", err)
		}
		if err := w.monitors.UpdateStatus(ctx, m.ID, record); err != nil {
			log.Printf("worker: failed to update monitor status: %v", err)
		}
	}
}

func (w *Worker) publishAlert(m domain.UptimeMonitor, record domain.UptimeCheckRecord, reason string) {
	if w.alerts == nil {
		return
	}

	severity := "warning"
	kind := "uptime_slow"
	if !record.Success {
		severity = "critical"
		kind = "uptime_failure"
	}

	alert := domain.AlertEvent{
		Subject:       w.alertSubject,
		Source:        "pinger",
		Kind:          kind,
		Severity:      severity,
		Title:         "uptime monitor alert",
		Message:       reason + ": " + m.URL,
		ProjectID:     m.ProjectID,
		ApplicationID: m.ApplicationID,
		MonitorID:     m.ID,
		DetectedAt:    time.Now().UTC(),
		CreatedAt:     time.Now().UTC(),
		Metadata: map[string]any{
			"url":        m.URL,
			"responseMs": record.ResponseMs,
			"statusCode": record.StatusCode,
			"success":    record.Success,
		},
	}

	if err := w.alerts.Publish(alert); err != nil {
		log.Printf("worker: failed to publish alert: %v", err)
	}
}

func normalizeHealthURL(rawURL string) (string, error) {
	value := strings.TrimSpace(rawURL)
	if value == "" {
		return "", http.ErrMissingFile
	}

	if !strings.Contains(value, "://") {
		value = "https://" + value
	}

	parsed, err := url.Parse(value)
	if err != nil {
		return "", err
	}

	path := strings.TrimRight(parsed.Path, "/")
	if path == "" {
		path = "/health"
	}
	parsed.Path = path
	return parsed.String(), nil
}
