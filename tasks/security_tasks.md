# Security Tasks

> Owner: CODEX
> Scope: `Upblit/backend/security/`, `Upblit/backend/core/ApiKey/`
> Reference: `.ai-context/security_standards.md`

---

## Critical (P0)

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-001 | Audit `GET /org` — verify it returns only orgs the authenticated user belongs to | P0 | [ ] | None | None |
| SEC-002 | Audit all resource endpoints — verify user authorization before returning data | P0 | [ ] | None | None |
| SEC-003 | Audit `ApiKeyGenerator` — verify API keys are stored as hashes, not plaintext | P0 | [ ] | None | None |

---

## Authentication

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-004 | Verify JWT `exp` claim is set in `JWTService` | P1 | [ ] | None | None |
| SEC-005 | Verify JWT `exp` is validated in `JWTAuthenticationFilter` | P1 | [ ] | None | None |
| SEC-006 | Verify refresh tokens are single-use (invalidated after use in `RefreshService`) | P1 | [ ] | None | None |
| SEC-007 | Verify `OAuth2SuccessHandler` does not expose JWT in redirect URL query string | P1 | [ ] | None | None |
| SEC-008 | Add JWT token blacklist or short expiry + refresh rotation strategy | P2 | [ ] | None | SEC-004 |

---

## Authorization (RBAC)

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-009 | Define RBAC roles: `OWNER`, `ADMIN`, `MEMBER` within an Organization | P1 | [ ] | None | None |
| SEC-010 | Implement role enforcement on org management endpoints (only OWNER/ADMIN can create projects) | P1 | [ ] | SEC-009 | None |
| SEC-011 | Implement role enforcement on API key generation (only OWNER/ADMIN can generate keys) | P1 | [ ] | SEC-009 | None |
| SEC-012 | Expose user role in `GET /org` response so frontend can conditionally show admin actions | P1 | [ ] | SEC-009 | None |

---

## API Key Security

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-013 | Implement API key revocation endpoint (`DELETE /apikey/{id}`) | P1 | [ ] | None | None |
| SEC-014 | Add audit log for API key generation events (who generated, when, for which app) | P2 | [ ] | None | None |
| SEC-015 | Add API key listing endpoint (`GET /apikey?ApplicationId={id}`) — show masked keys only | P2 | [ ] | None | None |

---

## Transport & Network

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-016 | Verify CORS configuration in `SecurityConfig` — only allow `FRONTEND_URI` | P1 | [ ] | None | None |
| SEC-017 | Add `Strict-Transport-Security` header for production deployments | P2 | [ ] | None | None |
| SEC-018 | Add `Content-Security-Policy` header to backend responses | P2 | [ ] | None | None |
| SEC-019 | Implement rate limiting on authentication endpoints (`/oauth2/*`, `/refresh`) | P1 | [ ] | None | None |

---

## Input Validation

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-020 | Add `@Valid` annotations to all DTO parameters in controllers | P1 | [ ] | None | None |
| SEC-021 | Add server-side file type validation (magic bytes) for org logo uploads | P1 | [ ] | None | None |
| SEC-022 | Add server-side file type validation for AI document uploads | P1 | [ ] | None | None |
| SEC-023 | Align file size limits: client-side is 5MB, server-side is 10MB — decide and enforce consistently | P2 | [ ] | None | None |

---

## Secrets Management

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SEC-024 | Audit all log statements — ensure no secrets or tokens are logged | P1 | [ ] | None | None |
| SEC-025 | Document secret rotation procedure for all environment variables | P2 | [ ] | None | None |
| SEC-026 | Evaluate using a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production | P3 | [ ] | None | None |
