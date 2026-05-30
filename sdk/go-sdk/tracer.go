package upblit

import (
	"context"
	"time"
)

func (s *SDK) Service(ctx context.Context, name string, fn func(context.Context) error) error {
	return s.span(ctx, "service:"+name, fn)
}

func (s *SDK) Call(ctx context.Context, name string, fn func(context.Context) error) error {
	return s.span(ctx, "external:"+name, fn)
}

func (s *SDK) Controller(ctx context.Context, name string, fn func(context.Context) error) error {
	return s.span(ctx, "controller:"+name, fn)
}

func (s *SDK) span(ctx context.Context, name string, fn func(context.Context) error) error {
	tc := getTraceContext(ctx)
	if tc == nil {
		if fn == nil {
			return nil
		}
		return fn(ctx)
	}

	spanID := newUUID()
	parentSpanID := tc.CurrentSpan
	start := now()
	tc.CurrentSpan = spanID

	status := 200
	if fn != nil {
		if err := fn(ctx); err != nil {
			status = 500
			s.finishSpan(tc, name, spanID, parentSpanID, status, start)
			tc.CurrentSpan = parentSpanID
			return err
		}
	}

	s.finishSpan(tc, name, spanID, parentSpanID, status, start)
	tc.CurrentSpan = parentSpanID
	return nil
}

func (s *SDK) finishSpan(tc *traceContext, name, spanID, parentSpanID string, status int, start time.Time) {
	s.pushTrace(Trace{
		Timestamp:      now().UTC().Format(time.RFC3339Nano),
		RequestMethod:  name,
		RequestURL:     "",
		ResponseStatus: status,
		TraceID:        tc.TraceID,
		SpanID:         spanID,
		ParentSpanID:   &parentSpanID,
		DurationMs:     now().Sub(start).Milliseconds(),
	})
}

func ServiceValue[T any](s *SDK, ctx context.Context, name string, fn func(context.Context) (T, error)) (T, error) {
	return spanValue(s, ctx, "service:"+name, fn)
}

func CallValue[T any](s *SDK, ctx context.Context, name string, fn func(context.Context) (T, error)) (T, error) {
	return spanValue(s, ctx, "external:"+name, fn)
}

func ControllerValue[T any](s *SDK, ctx context.Context, name string, fn func(context.Context) (T, error)) (T, error) {
	return spanValue(s, ctx, "controller:"+name, fn)
}

func spanValue[T any](s *SDK, ctx context.Context, name string, fn func(context.Context) (T, error)) (T, error) {
	var zero T
	var value T

	err := s.span(ctx, name, func(ctx context.Context) error {
		var err error
		value, err = fn(ctx)
		return err
	})
	if err != nil {
		return zero, err
	}

	return value, nil
}
