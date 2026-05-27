# SDK Standards

> Behavioral contract, API surface, and quality standards for all Upblit SDKs.

---

## SDK Inventory

| SDK | Location | Language | Status | Package Name |
|---|---|---|---|---|
| Express SDK | `SDK/Express-sdk/` | Node.js | Published (v2.0.0) | `upblit-express` |
| Go SDK | `SDK/Go-sdk/` | Go | Active | `github.com/upblit/go-sdk` (assumed) |
| Python SDK | `SDK/Python-sdk/` | Python | Active | `upblit` |
| Java SDK | `Upblit/sdk/java-sdk/` | Java | Empty stub | — |
| React SDK | `Upblit/sdk/react-sdk/` | TypeScript | Empty stub | — |
| npm SDK | `Upblit/sdk/npm-sdk/` | TypeScript | Empty stub | — |

---

## Universal Behavioral Contract

Every SDK must implement the following behaviors regardless of language:

### 1. Initialization
```
SDK(apiKey, options?) → sdk instance
```
- `apiKey`: string — the application's API key from Upblit dashboard
- `options.baseURL`: string — override ingest endpoint (default: `https://ingest.upblit.com`)
- `options.flushInterval`: number — seconds between auto-flushes (default: 30)

### 2. Middleware / HTTP Instrumentation
- Intercept every incoming HTTP request
- Generate `traceId` (UUID v4) and `rootSpanId` (UUID v4)
- Store in async-local / thread-local context
- On response finish: push root span to trace buffer
- Skip health check endpoint (`GET /health`) — do not trace it

### 3. Span Helpers
```
sdk.service(name, fn)    → executes fn(), wraps in "service:{name}" span
sdk.controller(name, fn) → executes fn(), wraps in "controller:{name}" span
sdk.call(name, fn)       → executes fn(), wraps in "external:{name}" span
```
- Each helper reads current span from context as `parentSpanId`
- Creates new `spanId`, sets as current in context
- On fn() completion (success or error): pushes span to buffer, restores parent span
- On error: sets `responseStatus = 500`

### 4. Logging
```
sdk.log(message)           → level defaults to "info"
sdk.log(level, message)    → explicit level
```
- Levels: `fatal`, `error`, `warn`, `info`, `debug`
- `fatal` level: flush immediately (do not buffer)
- All other levels: buffer and flush on interval

### 5. Buffering
- Traces and logs are buffered in memory separately
- Default flush interval: 30 seconds
- On flush failure: re-queue the batch (prepend to buffer)
- Thread/goroutine safety required for all buffer operations

### 6. Flush
```
sdk.flush()   → flush all buffered traces and logs
sdk.close()   → stop background flusher, flush remaining buffer
```

### 7. Transport
- `POST {baseURL}/ingest/traces` with `x-api-key` header
- `POST {baseURL}/ingest/logs` with `x-api-key` header
- Content-Type: `application/json`
- Payload: `{ "timestamp": "<ISO8601>", "traces": [...] }` or `{ "timestamp": "<ISO8601>", "logs": [...] }`

---

## Language-Specific Implementation Notes

### Express SDK (Node.js)
```javascript
const upblit = require('upblit-express')
app.use(upblit('YOUR_API_KEY'))

// Span helpers
await upblit.service('getUserById', async () => { ... })
await upblit.call('stripe', async () => { ... })
upblit.log('error', 'Something failed')
```
- Context: `AsyncLocalStorage` (Node.js built-in)
- Transport: `node-fetch` or `http` module
- Entry point: `upblit(apiKey)` returns Express middleware function

### Go SDK
```go
sdk := upblit.New("YOUR_API_KEY")
defer sdk.Close()

// Middleware
router.Use(sdk.Middleware())

// Span helpers
result, err := sdk.Service(ctx, "getUserById", func() (any, error) { ... })
```
- Context: `context.Context` passed explicitly
- Transport: `net/http` standard library
- Thread safety: `sync.Mutex` on all buffer operations
- Options: functional options pattern (`WithBaseURL`, `WithHTTPClient`, `WithFlushInterval`)

### Python SDK
```python
import upblit
upblit.init("YOUR_API_KEY")

# Middleware (FastAPI/Starlette)
app.add_middleware(upblit.Middleware)

# Span helpers (async)
result = await upblit.service("getUserById", lambda: get_user(id))
await upblit.log("error", "Something failed")
```
- Context: `threading.local` for sync; `contextvars.ContextVar` for async
- Transport: `urllib.request` (no external HTTP dependency)
- Thread safety: `threading.RLock`
- Async support: `asyncio`-compatible span helpers

---

## SDK Quality Standards

### Required for all SDKs
- [ ] README with installation, quickstart, and API reference
- [ ] Unit tests covering: middleware span creation, context propagation, flush/re-queue on failure, log level routing
- [ ] Published to appropriate package registry
- [ ] Semantic versioning (`MAJOR.MINOR.PATCH`)
- [ ] Changelog

### Ingest URL Inconsistency (Must Resolve)
| SDK | Current Base URL |
|---|---|
| Express SDK | Configured via `service.js` — URL not visible in index |
| Go SDK | `https://ingest.upblit.com` |
| Python SDK | `https://ingest.upblit.dev` |

**Action required**: Standardize all SDKs to use `https://ingest.upblit.com` as the default base URL.

---

## SDK Stubs (Not Yet Implemented)

The following SDKs exist as empty directories in `Upblit/sdk/`:

| SDK | Minimum Viable Implementation |
|---|---|
| Java SDK | Spring Boot auto-configuration, servlet filter for middleware, `@Traced` annotation for span helpers |
| React SDK | Browser-side error boundary tracing, Web Vitals capture, user session correlation |
| npm SDK | Generic TypeScript SDK for non-Express Node.js frameworks (Fastify, Koa, Hapi) |
