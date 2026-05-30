package upblit

import (
	"context"
)

func (s *SDK) Log(ctx context.Context, level string, message string) {
	if level == "" {
		level = "info"
	}

	var traceID *string
	if tc := getTraceContext(ctx); tc != nil {
		id := tc.TraceID
		traceID = &id
	}

	entry := LogEntry{
		TraceID:         traceID,
		Level:           level,
		Type:            "app",
		Message:         message,
		Timestamp:       now().UTC(),
		ClientTimestamp: now().UTC(),
	}

	s.pushLog(entry, level == "fatal")
}

func (s *SDK) Info(ctx context.Context, message string) {
	s.Log(ctx, "info", message)
}

func (s *SDK) Fatal(ctx context.Context, message string) {
	s.Log(ctx, "fatal", message)
}
