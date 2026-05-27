# Scaling Strategy

> How Upblit scales as usage grows. This is a planning document — no implementation required.

---

## Current Scale Assumptions

The system is designed for early-stage usage:
- Tens to hundreds of organizations
- Hundreds to thousands of applications
- Moderate telemetry volume (< 1M traces/day)
- Single backend instance

---

## Scaling Dimensions

### 1. Telemetry Ingest Volume

The ingest path (`POST /ingest/traces`, `POST /ingest/logs`) is the highest-throughput path. Each instrumented application sends batches every 30 seconds.

**Current bottleneck**: Synchronous MongoDB writes on every ingest request.

**Scaling path**:
```
Current: SDK → POST /ingest → synchronous MongoDB write
Level 1: SDK → POST /ingest → async write (non-blocking)
Level 2: SDK → POST /ingest → in-memory queue → batch writer
Level 3: SDK → POST /ingest → Kafka topic → consumer → MongoDB
```

**When to move to Level 2**: When ingest latency exceeds 200ms or MongoDB write throughput becomes a bottleneck.
**When to move to Level 3**: When ingest volume exceeds 10M events/day or requires guaranteed delivery.

---

### 2. Dashboard Query Performance

The query path (`GET /logs/project?id=`) reads from MongoDB. Performance degrades without indexes.

**Immediate actions (no scale required)**:
- Add compound index `{projectId, timestamp}` on traces
- Add compound index `{applicationId, timestamp}` on logs
- Add TTL index to prevent unbounded collection growth

**Scaling path**:
```
Current: MongoDB query → full collection scan (no indexes)
Level 1: MongoDB query → indexed scan (add indexes)
Level 2: Paginated queries (add pagination to endpoints)
Level 3: Read replicas for dashboard queries
Level 4: Pre-aggregated views / materialized summaries
```

---

### 3. Backend API Throughput

The backend is stateless and horizontally scalable. No code changes required to add instances.

**Scaling path**:
```
Current: Single instance
Level 1: 2-3 instances behind load balancer (no code changes)
Level 2: Auto-scaling group based on CPU/memory
Level 3: Kubernetes HPA (Horizontal Pod Autoscaler)
```

**Prerequisites**: Health check endpoint (`GET /health`) must exist before adding a load balancer.

---

### 4. Database Connections

PostgreSQL connections are managed by HikariCP (already configured). MongoDB connections are managed by Spring Data MongoDB.

**Current config**: `spring.datasource.hikari.data-source-properties.prepareThreshold=0` is set.

**Scaling path**:
```
Current: Direct connections from each backend instance
Level 1: PgBouncer connection pooler (when connection count exceeds DB limit)
Level 2: Read replicas for dashboard queries
```

---

### 5. File Storage

Files are stored in Supabase (external CDN). This scales independently of the backend.

**No action required** — Supabase handles scaling automatically.

---

## Scaling Triggers

| Metric | Threshold | Action |
|---|---|---|
| Ingest endpoint p99 latency | > 500ms | Add async write queue |
| MongoDB query time | > 1s for project traces | Add indexes (immediate) |
| Backend CPU | > 70% sustained | Add backend instance |
| PostgreSQL connections | > 80% of max | Add PgBouncer |
| MongoDB storage | > 80% of tier | Add TTL indexes or upgrade tier |
| Traces collection size | > 10GB | Verify TTL is active |

---

## What NOT to Do Prematurely

| Premature Action | Why to Avoid |
|---|---|
| Add Kafka before ingest is a bottleneck | Significant operational complexity for no current benefit |
| Add Redis before a measured cache miss problem | Adds infrastructure without proven need |
| Add Kubernetes before horizontal scaling is needed | Significant operational overhead |
| Add read replicas before query performance is measured | Premature optimization |
| Implement trace sampling before storage is a problem | Reduces data quality unnecessarily |

---

## Telemetry Data Retention

| Tier | Retention | Storage Estimate |
|---|---|---|
| Hot (recent) | 90 days | MongoDB Atlas (current) |
| Warm (archive) | 1 year | MongoDB Atlas or S3 export |
| Cold (compliance) | 7 years | S3 Glacier (if required) |

**Current state**: No TTL configured — all data retained indefinitely. Add TTL indexes immediately (SCALE-004, SCALE-005).
