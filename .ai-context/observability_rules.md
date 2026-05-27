# Observability Rules

> Standards for how telemetry is collected, structured, stored, and queried across the Upblit platform.

---

## Telemetry Data Model

### Trace
```typescript
interface Trace {
  timestamp: string        // ISO8601 — when the span was recorded
  requestMethod: string    // e.g. "controller:POST", "service:getUserById", "external:stripe"
  requestURL: string       // HTTP path or empty string for internal spans
  responseStatus: number   // HTTP status code or 200/500 for internal spans
  traceId: string          // UUID — shared across all spans in one request
  spanId: string           // UUID — unique per span
  parentSpanId: string | null  // null for root span
  durationMs: number       // wall-clock duration in milliseconds
}
```

### LogEntry
```typescript
interface LogEntry {
  traceId: string | null   // correlates log to a trace; null if outside request context
  level: string            // "fatal" | "error" | "warn" | "info" | "debug"
  type: string             // "app" | "system"
  message: string
  timestamp: string        // ISO8601 — server-side receipt time
  clientTimestamp: string  // ISO8601 — SDK-side emission time
}
```

### Metrics (backend model exists, SDK not yet implemented)
```java
// com.upblit.backend.query.model.Metrics
// Structure: TBD — model exists but no SDK emitter found
```

---

## Span Naming Convention

All SDKs use a `type:name` prefix pattern for `requestMethod`:

| Prefix | Meaning | Example |
|---|---|---|
| `controller:` | HTTP handler / route handler | `controller:POST` |
| `service:` | Internal service layer call | `service:getUserById` |
| `external:` | Outbound HTTP call to third party | `external:stripe` |

**Rule**: Always use one of these three prefixes. Do not use raw HTTP methods as the full `requestMethod` value.

---

## Trace Context Propagation

Each SDK uses language-native context propagation:

| SDK | Mechanism |
|---|---|
| Express (Node.js) | `AsyncLocalStorage` via `context.js` |
| Go | `context.Context` passed through call chain |
| Python | `threading.local` via `context.py` |

**Rule**: The root span is created by the middleware on every incoming HTTP request. Child spans are created by `service()`, `controller()`, and `call()` helpers. The `parentSpanId` of a child span is the `spanId` of the currently active span in context.

---

## Ingest Endpoints

```
POST /ingest/traces
POST /ingest/logs
```

- Authentication: `x-api-key: <api-key>` header
- Content-Type: `application/json`
- Payload: `{ "timestamp": "<ISO8601>", "traces": [...] }` or `{ "timestamp": "<ISO8601>", "logs": [...] }`
- The `timestamp` at the envelope level is the flush time, not the individual span time

---

## Query Endpoints (Backend)

| Endpoint | Description |
|---|---|
| `GET /logs/project?id={projectId}` | Fetch all telemetry (traces) for a project |
| `GET /ingest/logs` | Fetch all log entries |
| `GET /metrics` | Fetch metrics (controller exists) |

---

## Buffering and Flush Rules

- Default flush interval: **30 seconds** (all SDKs)
- On flush failure: **re-queue the batch** — do not drop data
- On `fatal` log level: **flush immediately** (instant mode) — do not buffer
- On SDK shutdown (`close()`/`Close()`): flush remaining buffer before exit

---

## Observability Dashboard Rules (Frontend)

- Telemetry and logs are fetched **in parallel** (`Promise.all`) on the observability page
- Tables with >100 rows must use **virtual/windowed rendering**
- Filtering is **client-side** — no re-fetch on filter change
- Trace rows are **expandable** — show all spans in the trace on expand
- Log level filter uses **pill toggles** — multiple levels can be active simultaneously
- Log search is **case-insensitive substring match** on the `message` field

---

## What Is Not Yet Implemented

| Feature | Status | Notes |
|---|---|---|
| Metrics SDK emitter | Missing | Backend model exists; no SDK sends metrics |
| Real-time log streaming | Missing | WebSocket infrastructure exists in backend but not wired to logs |
| Alerting / thresholds | Missing | No alert model or notification system |
| Trace sampling | Missing | All traces are currently collected (100% sampling) |
| OpenTelemetry compatibility | Missing | Custom format only; no OTLP support |
| Log retention policy | Unknown | No TTL or archival config found in MongoDB setup |
