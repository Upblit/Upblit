package upblit

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"
)

const (
	DefaultBaseURL       = "https://ingest.upblit.com"
	defaultFlushInterval = 30 * time.Second
)

type SDK struct {
	apiKey        string
	baseURL       string
	httpClient    *http.Client
	flushInterval time.Duration

	mu           sync.Mutex
	traceBuffer  []Trace
	logBuffer    []LogEntry
	stopFlushers chan struct{}
	closeOnce    sync.Once
}

type Option func(*SDK)

func WithBaseURL(baseURL string) Option {
	return func(s *SDK) {
		s.baseURL = strings.TrimRight(baseURL, "/")
	}
}

func WithHTTPClient(client *http.Client) Option {
	return func(s *SDK) {
		if client != nil {
			s.httpClient = client
		}
	}
}

func WithFlushInterval(interval time.Duration) Option {
	return func(s *SDK) {
		s.flushInterval = interval
	}
}

func New(apiKey string, opts ...Option) *SDK {
	s := &SDK{
		apiKey:        apiKey,
		baseURL:       DefaultBaseURL,
		httpClient:    http.DefaultClient,
		flushInterval: defaultFlushInterval,
		stopFlushers:  make(chan struct{}),
	}

	for _, opt := range opts {
		opt(s)
	}

	if s.baseURL == "" {
		s.baseURL = DefaultBaseURL
	}

	if s.flushInterval > 0 {
		go s.startFlushers()
	}

	return s
}

func (s *SDK) Close() {
	s.closeOnce.Do(func() {
		close(s.stopFlushers)
	})
}

func (s *SDK) startFlushers() {
	ticker := time.NewTicker(s.flushInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			_ = s.Flush(context.Background())
		case <-s.stopFlushers:
			return
		}
	}
}

func (s *SDK) Flush(ctx context.Context) error {
	traceErr := s.FlushTraces(ctx)
	logErr := s.FlushLogs(ctx)
	if traceErr != nil {
		return traceErr
	}
	return logErr
}

func (s *SDK) pushTrace(trace Trace) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.traceBuffer = append(s.traceBuffer, trace)
}

func (s *SDK) pushLog(entry LogEntry, instant bool) {
	if instant {
		_ = s.sendLogs(context.Background(), []LogEntry{entry})
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.logBuffer = append(s.logBuffer, entry)
}

func (s *SDK) FlushTraces(ctx context.Context) error {
	s.mu.Lock()
	if len(s.traceBuffer) == 0 {
		s.mu.Unlock()
		return nil
	}
	batch := append([]Trace(nil), s.traceBuffer...)
	s.traceBuffer = nil
	s.mu.Unlock()

	if err := s.sendTraces(ctx, batch); err != nil {
		s.mu.Lock()
		s.traceBuffer = append(batch, s.traceBuffer...)
		s.mu.Unlock()
		return err
	}

	return nil
}

func (s *SDK) FlushLogs(ctx context.Context) error {
	s.mu.Lock()
	if len(s.logBuffer) == 0 {
		s.mu.Unlock()
		return nil
	}
	batch := append([]LogEntry(nil), s.logBuffer...)
	s.logBuffer = nil
	s.mu.Unlock()

	if err := s.sendLogs(ctx, batch); err != nil {
		s.mu.Lock()
		s.logBuffer = append(batch, s.logBuffer...)
		s.mu.Unlock()
		return err
	}

	return nil
}

func (s *SDK) sendTraces(ctx context.Context, traces []Trace) error {
	return s.postJSON(ctx, "/ingest/traces", map[string]any{
		"timestamp": now().UTC().Format(time.RFC3339Nano),
		"traces":    traces,
	})
}

func (s *SDK) sendLogs(ctx context.Context, logs []LogEntry) error {
	return s.postJSON(ctx, "/ingest/logs", map[string]any{
		"timestamp": now().UTC().Format(time.RFC3339Nano),
		"logs":      logs,
	})
}

func (s *SDK) postJSON(ctx context.Context, path string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	if s.apiKey != "" {
		req.Header.Set("x-api-key", s.apiKey)
	}

	res, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return &HTTPError{StatusCode: res.StatusCode, URL: req.URL.String()}
	}

	return nil
}

type HTTPError struct {
	StatusCode int
	URL        string
}

func (e *HTTPError) Error() string {
	return "upblit: ingestion request failed with non-2xx status"
}
