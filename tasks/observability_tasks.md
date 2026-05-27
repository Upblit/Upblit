# Observability Tasks

> Owner: CODEX (backend ingest/query), ANTIGRAVITY (SDK emitters), COPILOT (dashboard UI)
> Scope: `Upblit/backend/query/`, `SDK/`, `Upblit/frontend/src/app/dashboard/`
> Reference: `.ai-context/observability_rules.md`, `.ai-context/telemetry_flow.md`

---

## Ingest Pipeline

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| OBS-001 | Verify `POST /ingest/traces` validates `x-api-key` and resolves applicationId/projectId | P0 | [ ] | None | None |
| OBS-002 | Verify `POST /ingest/logs` validates `x-api-key` and stores logs with applicationId/projectId | P0 | [ ] | None | None |
| OBS-003 | Implement rate limiting on ingest endpoints to prevent storage abuse | P1 | [ ] | None | None |
| OBS-004 | Add request size limit to ingest endpoints (prevent oversized payloads) | P1 | [ ] | None | None |
| OBS-005 | Implement batch size validation — reject batches with >1000 traces or logs | P2 | [ ] | None | None |

---

## Query Layer

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| OBS-006 | Add MongoDB index on `projectId` in traces collection | P1 | [ ] | None | None |
| OBS-007 | Add MongoDB index on `applicationId` in traces and logs collections | P1 | [ ] | None | None |
| OBS-008 | Add MongoDB index on `traceId` in traces and logs collections | P1 | [ ] | None | None |
| OBS-009 | Add pagination to `GET /logs/project?id={projectId}` | P1 | [ ] | None | None |
| OBS-010 | Add pagination to `GET /ingest/logs` | P1 | [ ] | None | None |
| OBS-011 | Add date range filtering to trace and log query endpoints | P2 | [ ] | None | OBS-009, OBS-010 |
| OBS-012 | Add application-level filtering to `GET /logs/project` | P2 | [ ] | None | OBS-009 |

---

## Data Retention

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| OBS-013 | Add TTL index on `timestamp` in traces collection (configurable, default 90 days) | P1 | [ ] | None | None |
| OBS-014 | Add TTL index on `timestamp` in logs collection | P1 | [ ] | None | None |
| OBS-015 | Document retention policy and expose it in the dashboard | P3 | [ ] | OBS-013, OBS-014 | None |

---

## Metrics

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| OBS-016 | Define metrics payload schema (backend `Metrics.java` model exists) | P2 | [ ] | None | None |
| OBS-017 | Implement `POST /ingest/metrics` endpoint | P2 | [ ] | OBS-016 | None |
| OBS-018 | Implement metrics emitter in Express SDK | P2 | [ ] | OBS-016, OBS-017 | None |
| OBS-019 | Implement metrics emitter in Go SDK | P2 | [ ] | OBS-016, OBS-017 | None |
| OBS-020 | Implement metrics emitter in Python SDK | P2 | [ ] | OBS-016, OBS-017 | None |
| OBS-021 | Add metrics visualization to the observability dashboard | P2 | [ ] | OBS-016 | FE-015 |

---

## Real-Time Streaming

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| OBS-022 | Design WebSocket protocol for real-time log streaming (backend WebSocket infra exists) | P3 | [ ] | None | None |
| OBS-023 | Implement WebSocket endpoint for real-time log streaming | P3 | [ ] | OBS-022 | None |
| OBS-024 | Add real-time log stream to the LogsTable component | P3 | [ ] | OBS-023 | FE-017 |

---

## OpenTelemetry Compatibility

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| OBS-025 | Research OTLP (OpenTelemetry Protocol) compatibility requirements | P3 | [ ] | None | None |
| OBS-026 | Design OTLP-compatible ingest endpoint | P3 | [ ] | OBS-025 | None |
