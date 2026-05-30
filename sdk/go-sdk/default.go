package upblit

import (
	"context"
	"net/http"
	"sync"
)

var (
	defaultMu  sync.RWMutex
	defaultSDK *SDK
)

func Init(apiKey string, opts ...Option) *SDK {
	s := New(apiKey, opts...)
	defaultMu.Lock()
	if defaultSDK != nil {
		defaultSDK.Close()
	}
	defaultSDK = s
	defaultMu.Unlock()
	return s
}

func Default() *SDK {
	defaultMu.RLock()
	s := defaultSDK
	defaultMu.RUnlock()
	if s != nil {
		return s
	}

	return Init("")
}

func Middleware(next http.Handler) http.Handler {
	return Default().Middleware(next)
}

func Service(ctx context.Context, name string, fn func(context.Context) error) error {
	return Default().Service(ctx, name, fn)
}

func Call(ctx context.Context, name string, fn func(context.Context) error) error {
	return Default().Call(ctx, name, fn)
}

func Controller(ctx context.Context, name string, fn func(context.Context) error) error {
	return Default().Controller(ctx, name, fn)
}

func Log(ctx context.Context, args ...string) {
	level := "info"
	message := ""

	switch len(args) {
	case 0:
		return
	case 1:
		message = args[0]
	default:
		level = args[0]
		message = args[1]
	}

	Default().Log(ctx, level, message)
}
