# Scaling Tasks

> Owner: CODEX
> Scope: Database performance, caching, ingest throughput
> Reference: `.ai-context/database_strategy.md`, `.ai-context/observability_rules.md`

---

## Database Performance

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SCALE-001 | Add compound index `{projectId, timestamp}` on traces collection | P1 | [ ] | None | None |
| SCALE-002 | Add compound index `{applicationId, timestamp}` on traces and logs collections | P1 | [ ] | None | None |
| SCALE-003 | Add index on `traceId` in traces and logs collections | P1 | [ ] | None | None |
| SCALE-004 | Add TTL index on `timestamp` in traces collection (90-day default) | P1 | [ ] | None | None |
| SCALE-005 | Add TTL index on `timestamp` in logs collection | P1 | [ ] | None | None |
| SCALE-006 | Benchmark `GET /logs/project?id={projectId}` query performance with 100k+ traces | P2 | [ ] | SCALE-001 | None |
| SCALE-007 | Evaluate MongoDB capped collections or time-series collections for traces | P3 | [ ] | None | None |

---

## Ingest Throughput

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SCALE-008 | Implement async/non-blocking ingest endpoint (currently synchronous write to MongoDB) | P2 | [ ] | None | None |
| SCALE-009 | Evaluate Kafka for ingest buffering (high-volume scenarios) | P3 | [ ] | None | None |
| SCALE-010 | Implement ingest batch size limits (reject batches >1000 items) | P1 | [ ] | None | None |
| SCALE-011 | Add ingest rate limiting per API key | P1 | [ ] | None | None |

---

## Caching

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SCALE-012 | Evaluate Redis for caching `GET /org` and `GET /project` responses | P3 | [ ] | None | None |
| SCALE-013 | Evaluate Redis for JWT token blacklisting (on logout/revocation) | P2 | [ ] | None | None |
| SCALE-014 | Evaluate Redis for API key validation caching (avoid DB lookup on every ingest request) | P2 | [ ] | None | None |

---

## Frontend Performance

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SCALE-015 | Implement virtual scrolling in `TelemetryTable` for >100 rows | P1 | [ ] | None | FE-016 |
| SCALE-016 | Implement virtual scrolling in `LogsTable` for >100 rows | P1 | [ ] | None | FE-017 |
| SCALE-017 | Implement pagination in `TelemetryTable` (server-side, after OBS-009) | P2 | [ ] | OBS-009 | FE-016 |
| SCALE-018 | Implement pagination in `LogsTable` (server-side, after OBS-010) | P2 | [ ] | OBS-010 | FE-017 |

---

## Trace Sampling

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SCALE-019 | Design trace sampling strategy (head-based vs. tail-based) | P3 | [ ] | None | None |
| SCALE-020 | Implement configurable sampling rate in SDK middleware | P3 | [ ] | SCALE-019 | None |
| SCALE-021 | Implement sampling rate configuration in the dashboard | P3 | [ ] | SCALE-019 | None |
