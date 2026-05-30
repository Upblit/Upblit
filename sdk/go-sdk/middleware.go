package upblit

import (
	"encoding/json"
	"net/http"
	"time"
)

func (s *SDK) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet && r.URL.Path == "/health" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
			return
		}

		traceID := newUUID()
		rootSpanID := newUUID()
		start := now()

		tc := &traceContext{
			TraceID:     traceID,
			CurrentSpan: rootSpanID,
		}

		recorder := &statusRecorder{ResponseWriter: w}
		next.ServeHTTP(recorder, r.WithContext(withTraceContext(r.Context(), tc)))

		s.pushTrace(Trace{
			Timestamp:      now().UTC().Format(time.RFC3339Nano),
			RequestMethod:  "controller:" + r.Method,
			RequestURL:     requestURL(r),
			ResponseStatus: recorder.Status(),
			TraceID:        traceID,
			SpanID:         rootSpanID,
			DurationMs:     now().Sub(start).Milliseconds(),
		})
	})
}

func requestURL(r *http.Request) string {
	if r.URL == nil {
		return ""
	}
	return r.URL.RequestURI()
}
