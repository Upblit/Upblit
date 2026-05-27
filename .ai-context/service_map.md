# Service Map

> Last updated: 2026-05-27 | Status: ANALYSIS ONLY — do not modify production code

## Overview

Upblit is an AI-native cloud developer platform. The core philosophy is **Deploy. Observe. Scale.** The system is composed of independently deployable services, a multi-language SDK layer, a CLI tool, and supporting infrastructure services.

---

## Service Inventory

| Service | Path | Runtime | Port | Status |
|---|---|---|---|---|
| Backend API | `Upblit/backend/` | Spring Boot 4 / Java 21 | 8080 | Active |
| Frontend | `Upblit/frontend/` | Next.js 16 / React 19 | 3000 | Active |
| Email Service | `Upblit/email/` | Node.js / Express | 3000 | Active |
| Nextra Docs | `Upblit/docs/nextra-docs-demo-yt/` | Next.js | varies | Active |
| Swagger UI | `Upblit/swagger/swagger/` | Next.js + @scalar/api-reference | varies | Active |
| Policies Site | `Upblit/policies/` | Next.js + MDX | varies | Active |
| Community Page | `Upblit/Community/` | Static HTML | — | Active |
| DeployX CLI | `Upblit/UpblitCLI/` | Go | — | Active |
| Express SDK | `SDK/Express-sdk/` | Node.js | — | Published (v2.0.0) |
| Go SDK | `SDK/Go-sdk/` | Go | — | Active |
| Python SDK | `SDK/Python-sdk/` | Python | — | Active |

### SDK Stubs (empty — not yet implemented)
- `Upblit/sdk/express-sdk/`
- `Upblit/sdk/go-sdk/`
- `Upblit/sdk/java-sdk/`
- `Upblit/sdk/npm-sdk/`
- `Upblit/sdk/python-sdk/`
- `Upblit/sdk/react-sdk/`

> **Note**: The real SDK implementations live in `SDK/` at the workspace root, not in `Upblit/sdk/`. The `Upblit/sdk/` directory contains empty stubs only.

---

## Service Dependency Graph

```mermaid
graph TD
    FE[Frontend<br/>Next.js :3000] -->|REST + JWT| BE[Backend API<br/>Spring Boot :8080]
    FE -->|OAuth2 redirect| GH[GitHub OAuth]

    BE -->|MongoDB Atlas| MDB[(MongoDB<br/>Telemetry / AI Docs)]
    BE -->|PostgreSQL| PG[(PostgreSQL<br/>Users / Orgs / Projects / Apps)]
    BE -->|Supabase Storage| SB[Supabase<br/>Logo / File Storage]
    BE -->|HTTP| EMAIL[Email Service<br/>Node.js :3000]
    BE -->|WebClient| AI_EXT[External AI Service<br/>Docs / Tenant API]

    EMAIL -->|Resend API| RESEND[Resend<br/>Email Delivery]

    SDK_EX[Express SDK] -->|HTTP POST| INGEST[/ingest/traces<br/>/ingest/logs]
    SDK_GO[Go SDK] -->|HTTP POST| INGEST
    SDK_PY[Python SDK] -->|HTTP POST| INGEST
    INGEST -->|handled by| BE

    CLI[DeployX CLI<br/>Go] -->|git commands| GIT[Git Remote]

    SWAGGER[Swagger UI<br/>Next.js] -->|reads| SPEC[swagger.json<br/>OpenAPI Spec]
    DOCS[Nextra Docs] -->|static| USERS[Developers]
    POLICIES[Policies Site] -->|static| USERS
```

---

## Data Flow Summary

### Authentication Flow
1. User clicks "Login with GitHub" on Frontend
2. Frontend redirects to `GET /oauth2/authorization/github`
3. Backend handles OAuth2 callback, creates/updates User in PostgreSQL
4. Backend issues JWT access token + refresh token
5. Frontend stores JWT in `localStorage`
6. All subsequent API calls attach `Authorization: Bearer {token}`

### Telemetry Ingestion Flow
1. SDK (Express/Go/Python) instruments application code
2. SDK buffers traces and logs in memory
3. SDK flushes to `POST https://ingest.upblit.com/ingest/traces` and `/ingest/logs`
4. Backend receives, validates API key, stores in MongoDB
5. Frontend queries `GET /logs/project?id={projectId}` to display traces

### Organization Hierarchy
```
User → Organization → Project → Application → API Key → SDK Telemetry
```

---

## Missing Services (Documented, Not Present)

| Expected Service | Evidence | Status |
|---|---|---|
| Observability Ingestor | SDK targets `ingest.upblit.com` | Not found in repo — likely external or not yet built |
| Kafka / Message Queue | Referenced in product vision | No config found |
| Redis Cache | Referenced in product vision | No config found |
| Qdrant Vector DB | Referenced in product vision | No config found |
| CI/CD Pipeline | No `.github/workflows/` found | Not configured |
| Docker Compose | No `docker-compose.yml` at root | Not present |
| Kubernetes Manifests | No `k8s/` directory | Not present |
