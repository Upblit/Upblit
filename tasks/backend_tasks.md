# Backend Tasks

> Owner: CODEX
> Scope: `Upblit/backend/`, `Upblit/email/`
> Reference: `.ai-context/backend_conventions.md`, `.ai-context/security_standards.md`

---

## API Correctness

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| BE-001 | Verify `GET /org` returns only organizations the authenticated user belongs to (not all orgs) | P0 | [ ] | None | None |
| BE-002 | Verify `GET /project?OrganizationId={id}` validates user has access to the org before returning projects | P0 | [ ] | None | None |
| BE-003 | Verify `GET /applications?projectId={id}` validates user has access to the project | P0 | [ ] | None | None |
| BE-004 | Verify `POST /apikey?ApplicationId={id}` validates user has access to the application | P0 | [ ] | None | None |
| BE-005 | Verify ingest endpoints (`POST /ingest/traces`, `POST /ingest/logs`) validate `x-api-key` header | P0 | [ ] | None | None |
| BE-006 | Verify `POST /ingest/*` resolves `applicationId` and `projectId` from the API key and stores them with the telemetry | P1 | [ ] | None | BE-005 |
| BE-007 | Verify `GET /User?username={username}` returns the correct user and does not expose other users' data | P1 | [ ] | None | None |

---

## Security

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| BE-008 | Audit `ApiKeyGenerator` — verify API keys are stored as hashes (not plaintext) in PostgreSQL | P1 | [ ] | None | None |
| BE-009 | Verify JWT has `exp` claim set in `JWTService` | P1 | [ ] | None | None |
| BE-010 | Verify refresh tokens are single-use (invalidated after use) in `RefreshService` | P1 | [ ] | None | None |
| BE-011 | Implement rate limiting on ingest endpoints (`/ingest/traces`, `/ingest/logs`) | P1 | [ ] | None | None |
| BE-012 | Verify CORS configuration in `SecurityConfig` — only allow `FRONTEND_URI` origin | P1 | [ ] | None | None |
| BE-013 | Implement RBAC roles (admin/member) within organizations | P1 | [ ] | CROSS-002 | BE-001 |
| BE-014 | Add server-side file type validation (magic bytes) for org logo and AI doc uploads | P2 | [ ] | None | None |
| BE-015 | Verify `OAuth2SuccessHandler` does not expose JWT in redirect URL query string | P1 | [ ] | None | None |

---

## Database

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| BE-016 | Add MongoDB index on `projectId` field in traces collection | P1 | [ ] | None | None |
| BE-017 | Add MongoDB index on `applicationId` field in traces and logs collections | P1 | [ ] | None | None |
| BE-018 | Add MongoDB index on `traceId` field in traces and logs collections | P1 | [ ] | None | None |
| BE-019 | Add TTL index on `timestamp` field in traces and logs collections (e.g., 90-day retention) | P1 | [ ] | None | None |
| BE-020 | Evaluate switching `ddl-auto` from `update` to `validate` + introduce Flyway for explicit migrations | P2 | [ ] | None | None |
| BE-021 | Add PostgreSQL row-level security (RLS) as defense-in-depth for org data isolation | P2 | [ ] | None | BE-013 |

---

## API Design

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| BE-022 | Add `GET /health` endpoint to the backend (currently only in SDK middleware) | P2 | [ ] | None | None |
| BE-023 | Add pagination to `GET /logs/project?id={projectId}` — large projects will have many traces | P2 | [ ] | None | None |
| BE-024 | Add pagination to `GET /ingest/logs` | P2 | [ ] | None | None |
| BE-025 | Standardize endpoint naming: evaluate moving from query params to path params for IDs | P3 | [ ] | CROSS-005 | COPILOT coordination |

---

## Email Service

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| BE-026 | Create `Dockerfile` for the email service (`Upblit/email/`) | P2 | [ ] | None | None |
| BE-027 | Add input validation to email service endpoints | P2 | [ ] | None | None |
| BE-028 | Add authentication to email service (verify `EMAIL_SECRET` on all requests) | P1 | [ ] | None | None |

---

## Testing

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| BE-029 | Write unit tests for `JWTService` (token generation, validation, expiry) | P2 | [ ] | None | None |
| BE-030 | Write unit tests for `ApiKeyGenerator` | P2 | [ ] | None | None |
| BE-031 | Write integration tests for the ingest endpoints | P2 | [ ] | None | BE-005 |
| BE-032 | Write integration tests for the org → project → application hierarchy endpoints | P2 | [ ] | None | BE-001 through BE-004 |
