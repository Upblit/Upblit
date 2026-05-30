package upblit

import "context"

type traceContext struct {
	TraceID     string
	CurrentSpan string
}

type contextKey struct{}

func withTraceContext(ctx context.Context, tc *traceContext) context.Context {
	return context.WithValue(ctx, contextKey{}, tc)
}

func getTraceContext(ctx context.Context) *traceContext {
	if ctx == nil {
		return nil
	}

	tc, _ := ctx.Value(contextKey{}).(*traceContext)
	return tc
}
