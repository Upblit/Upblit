# Telemetry Flow

> End-to-end data flow for traces and logs from instrumented application to the Upblit dashboard.

---

## Full Flow Diagram

```mermaid
sequenceDiagram
    participant APP as Instrumented App
    participant SDK as Upblit SDK
    participant CTX as Span Context
    participant BUF as SDK Buffer
    participant INGEST as Backend /ingest/*
    participant MDB as MongoDB
    participant FE as Frontend Dashboard

    APP->>SDK: HTTP request arrives (middleware intercepts)
    SDK->>CTX: Create traceId + rootSpanId, store in AsyncLocal/context
    SDK->>APP: next() — request proceeds

    APP->>SDK: sdk.service("name", fn) called
    SDK->>CTX: Read current spanId as parentSpanId
    SDK->>CTX: Create new spanId, set as current
    SDK->>APP: Execute fn()
    APP-->>SDK: fn() returns
    SDK->>BUF: pushTrace(span)
    SDK->>CTX: Restore parentSpanId as current

    APP-->>SDK: Response sent (res.on("finish"))
    SDK->>BUF: pushTrace(rootSpan)

    Note over BUF: Every 30s (or on manual flush)
    BUF->>INGEST: POST /ingest/traces { timestamp, traces[] }
    INGEST->>INGEST: Validate x-api-key header
    INGEST->>MDB: Store trace documents

    FE->>INGEST: GET /logs/project?id={projectId}
    INGEST->>MDB: Query traces by projectId
    MDB-->>INGEST: Trace[]
    INGEST-->>FE: Trace[]
    FE->>FE: Render TelemetryTable
```

---

## Log Flow

```mermaid
sequenceDiagram
    participant APP as Instrumented App
    participant SDK as Upblit SDK
    participant CTX as Span Context
    participant BUF as Log Buffer
    participant INGEST as Backend /ingest/logs
    participant MDB as MongoDB

    APP->>SDK: sdk.log("error", "Payment failed")
    SDK->>CTX: Read current traceId (may be null)
    SDK->>BUF: pushLog(LogEntry) — buffered (or instant if level=fatal)

    Note over BUF: Every 30s (or instant for fatal)
    BUF->>INGEST: POST /ingest/logs { timestamp, logs[] }
    INGEST->>INGEST: Validate x-api-key
    INGEST->>MDB: Store log documents
```

---

## SDK Buffer State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Buffering: pushTrace / pushLog
    Buffering --> Flushing: timer fires (30s) or flush() called
    Flushing --> Idle: success
    Flushing --> Requeuing: transport error
    Requeuing --> Buffering: batch prepended to buffer
    Idle --> Closed: close() called
    Buffering --> Closed: close() called (flush first)
    Closed --> [*]
```

---

## Trace Hierarchy

```
Trace (identified by traceId)
├── Root Span (parentSpanId = null)
│   Created by: middleware on HTTP request arrival
│   requestMethod: "controller:METHOD"
│
├── Service Span (parentSpanId = rootSpanId)
│   Created by: sdk.service("name", fn)
│   requestMethod: "service:name"
│
└── External Call Span (parentSpanId = serviceSpanId)
    Created by: sdk.call("name", fn)
    requestMethod: "external:name"
```

---

## API Key → Application → Project → Organization Linkage

When the backend receives a trace batch:
1. Validates `x-api-key` header against `ApiClient` table in PostgreSQL
2. Resolves `applicationId` from the API key record
3. Resolves `projectId` from the application record
4. Stores trace with `applicationId` and `projectId` in MongoDB

This linkage enables the query: `GET /logs/project?id={projectId}` to return all traces across all applications in a project.

---

## Ingest Payload Schemas

### Trace Batch
```json
{
  "timestamp": "2026-05-27T10:00:00.000Z",
  "traces": [
    {
      "timestamp": "2026-05-27T10:00:00.123Z",
      "requestMethod": "controller:POST",
      "requestURL": "/api/users",
      "responseStatus": 201,
      "traceId": "550e8400-e29b-41d4-a716-446655440000",
      "spanId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "parentSpanId": null,
      "durationMs": 145
    }
  ]
}
```

### Log Batch
```json
{
  "timestamp": "2026-05-27T10:00:00.000Z",
  "logs": [
    {
      "traceId": "550e8400-e29b-41d4-a716-446655440000",
      "level": "error",
      "type": "app",
      "message": "Payment processing failed: timeout",
      "timestamp": "2026-05-27T10:00:00.456Z",
      "clientTimestamp": "2026-05-27T10:00:00.450Z"
    }
  ]
}
```

---

## Known Gaps in Telemetry Flow

| Gap | Impact |
|---|---|
| No ingest endpoint authentication validation documented | Unknown if API key validation is implemented in backend ingest controllers |
| No metrics SDK emitter | Metrics model exists in backend but no SDK sends metrics data |
| No trace sampling | 100% of traces are collected — will cause storage growth at scale |
| No OpenTelemetry (OTLP) support | Cannot integrate with standard observability tools (Jaeger, Tempo, etc.) |
| No real-time streaming | Dashboard requires manual refresh to see new traces |
| `ingest.upblit.com` vs `localhost:8080` | Go SDK targets `ingest.upblit.com`; Python SDK targets `ingest.upblit.dev`; Express SDK targets the backend directly. Inconsistency needs resolution. |
