# upblit-go

`upblit-go` is a small Go SDK that mirrors the Express SDK behavior for `net/http` applications.

It records incoming requests, creates trace context for downstream work, buffers traces and logs in memory, and sends them to Upblit using your observation token.

## Installation

```bash
go get github.com/upblit/upblit-go
```

## Quick Setup

```go
package main

import (
	"context"
	"encoding/json"
	"net/http"

	upblit "github.com/upblit/upblit-go"
)

func main() {
	sdk := upblit.Init("<YOUR_TOKEN>")
	defer sdk.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_ = upblit.Service(r.Context(), "users.getByID", func(ctx context.Context) error {
			upblit.Log(ctx, "info", "user loaded")
			return nil
		})

		_ = json.NewEncoder(w).Encode(map[string]string{"message": "Hello World"})
	})

	http.ListenAndServe(":3000", upblit.Middleware(mux))
}
```

## What It Does

- Creates a trace for each incoming request.
- Exposes a built-in `GET /health` endpoint that returns `{ "status": "ok" }`.
- Buffers traces and logs in memory and flushes them every 30 seconds.
- Sends trace data to `https://ingest.upblit.com/ingest/traces`.
- Sends log data to `https://ingest.upblit.com/ingest/logs`.
- Sends `fatal` logs immediately.

## API

Use the default SDK:

```go
sdk := upblit.Init("<YOUR_TOKEN>")
defer sdk.Close()

handler := upblit.Middleware(mux)
upblit.Service(ctx, "name", fn)
upblit.Call(ctx, "name", fn)
upblit.Log(ctx, "message")
upblit.Log(ctx, "fatal", "something failed")
```

Or create an explicit SDK instance:

```go
sdk := upblit.New("<YOUR_TOKEN>")
defer sdk.Close()

handler := sdk.Middleware(mux)
sdk.Info(ctx, "message")
sdk.Fatal(ctx, "something failed")
```

### `Middleware(next http.Handler) http.Handler`

Wraps an HTTP handler, adds request trace context, records the controller span, and handles `GET /health`.

### `Service(ctx, name, fn)`

Wraps internal application work in a `service:<name>` span.

### `Call(ctx, name, fn)`

Wraps external or downstream work in an `external:<name>` span.

### `Log(ctx, message)` and `Log(ctx, level, message)`

Records an app log in the current trace context. If the level is `fatal`, the log is sent immediately.

## Configuration

```go
sdk := upblit.New(
	"<YOUR_TOKEN>",
	upblit.WithBaseURL("https://ingest.upblit.com"),
	upblit.WithHTTPClient(http.DefaultClient),
	upblit.WithFlushInterval(30*time.Second),
)
```

Set `WithFlushInterval(0)` in tests or short-lived tools to disable the background flusher and call `sdk.Flush(ctx)` manually.

## Notes

- Telemetry is buffered in memory.
- Requests to `/health` are excluded from tracing.
- If the ingestion service is unavailable, buffered telemetry is restored and retried on the next flush.
