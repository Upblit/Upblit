# Architecture Rules

> Invariants and constraints that must be preserved across all changes to the Upblit system. These are not suggestions — they are load-bearing architectural decisions.

---

## Rule 1: Module Boundaries (Backend)

The backend uses **Spring Modulith**. Each top-level package under `com.upblit.backend` is a module:

| Module | Responsibility |
|---|---|
| `core` | Users, Organizations, Projects, Applications, API Keys, Invites |
| `query` | Telemetry read path: Traces, Logs, Metrics |
| `ai` | AI Gateway: Tenants, Docs |
| `security` | JWT, OAuth2, Refresh Tokens |
| `email` | Email dispatch via external email service |
| `config` | Cross-cutting: exception handling, HTTP client config |
| `Library` | External integrations: Supabase |

**Rule**: Do not import a class from one module directly into another module's internal classes. Expose only DTOs and service interfaces at module boundaries.

---

## Rule 2: Dual Database Strategy

The backend uses two databases for distinct purposes:

- **PostgreSQL** (via JPA): Relational, transactional data — Users, Organizations, Projects, Applications, API Keys, Invites, Refresh Tokens, Plans
- **MongoDB** (via Spring Data MongoDB): Document-oriented, high-volume, schema-flexible data — Traces, Logs, Metrics, AI Docs, AI Tenants

**Rule**: Do not store telemetry data in PostgreSQL. Do not store user/org/project relational data in MongoDB. The boundary is: **identity and structure → PostgreSQL**, **observability and content → MongoDB**.

---

## Rule 3: Authentication Architecture

- Authentication is **GitHub OAuth2** only (no username/password)
- Post-OAuth, the backend issues a **JWT access token** + **refresh token**
- The frontend stores the JWT in `localStorage` under key `"token"`
- All API calls attach `Authorization: Bearer {token}`
- The backend validates JWT via `JWTAuthenticationFilter` on every request
- Refresh tokens are stored in PostgreSQL (`RefreshToken` entity)
- **Rule**: Do not add new auth providers without updating `SecurityConfig`, `CustomOAuth2UserService`, and `OAuth2SuccessHandler`. Do not bypass `JWTAuthenticationFilter`.

---

## Rule 4: SDK Ingest Contract

All SDKs must conform to this contract:

```
POST /ingest/traces
Header: x-api-key: <api-key>
Body: {
  "timestamp": "<ISO8601>",
  "traces": [Trace]
}

POST /ingest/logs
Header: x-api-key: <api-key>
Body: {
  "timestamp": "<ISO8601>",
  "logs": [LogEntry]
}
```

**Rule**: Do not change the ingest endpoint paths or payload structure without updating all three SDKs (Express, Go, Python) simultaneously. The API key header name is `x-api-key` — do not change it.

---

## Rule 5: Frontend Route Hierarchy

The dashboard follows a strict hierarchical route structure:

```
/dashboard
  /orgs
    /[orgId]/projects
      /[projectId]/apps
      /[projectId]/observability
  /ai-gateway
  /profile
```

**Rule**: All dashboard pages must be children of `dashboard/layout.tsx`. The layout provides the auth guard, sidebar, and header. Do not create dashboard pages outside this layout.

---

## Rule 6: File Storage

Organization logos and AI documents are stored in **Supabase**, not on local disk or in the database. The `SupabaseService` in `Library/` handles all file operations.

**Rule**: Do not store binary files in PostgreSQL or MongoDB. Do not use local filesystem storage in the backend — it will not persist across container restarts.

---

## Rule 7: Email Service Isolation

The email service is a **separate Node.js microservice**, not part of the Spring Boot backend. The backend calls it via HTTP (configured via `email.uri` and `email.secret` env vars).

**Rule**: Do not add email-sending logic directly to the Spring Boot backend. Route all email through the email service.

---

## Rule 8: SDK Repository Separation

The production SDK implementations are in `SDK/` at the workspace root:
- `SDK/Express-sdk/` — published as `upblit-express` v2.0.0
- `SDK/Go-sdk/` — package `upblit`
- `SDK/Python-sdk/` — package `upblit`

The `Upblit/sdk/` directory contains empty stubs and is **not the source of truth**.

**Rule**: All SDK development happens in `SDK/<language>-sdk/`. Do not develop SDKs in `Upblit/sdk/`.

---

## Rule 9: No Hardcoded Configuration

All environment-sensitive values must come from environment variables:
- Backend: `application.properties` with `${ENV_VAR}` syntax, loaded via `spring-dotenv`
- Frontend: `NEXT_PUBLIC_*` env vars
- SDKs: constructor parameters (no env var reading inside SDK code)
- Email service: `dotenv` package

**Rule**: No secrets, URLs, or credentials in source code. The `.env` file in `Upblit/backend/` is gitignored and must never be committed.

---

## Rule 10: Stitch Screen Definitions

The `frontend/src/stitch/` directory contains JSON screen definitions used by the design system. These are declarative UI specifications, not runtime code.

**Rule**: Stitch JSON files are design artifacts. Do not import or execute them at runtime. They are reference documents for component implementation.
