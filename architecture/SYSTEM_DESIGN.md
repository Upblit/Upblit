# System Design

> Upblit — AI-Native Cloud Developer Platform
> Status: Descriptive document — no migrations, no infra scripts

---

## Overview

Upblit is a developer platform for deploying, observing, and scaling applications. It provides:
- A deployment CLI (`deployx`) for Git-based deployments
- A web dashboard for managing organizations, projects, and applications
- An observability layer (traces, logs, metrics) via multi-language SDKs
- An AI Gateway for knowledge-base management
- A multi-language SDK ecosystem (Express, Go, Python, Java, React)

Core philosophy: **Deploy. Observe. Scale.**

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Developer Tools"
        CLI[DeployX CLI<br/>Go binary]
        SDK_EX[Express SDK<br/>npm package]
        SDK_GO[Go SDK<br/>go module]
        SDK_PY[Python SDK<br/>PyPI package]
    end

    subgraph "Web Properties"
        FE[Frontend<br/>Next.js 16 / React 19]
        DOCS[Docs Site<br/>Nextra + MDX]
        SWAGGER[API Reference<br/>Scalar + OpenAPI]
        POLICIES[Policies<br/>Next.js + MDX]
    end

    subgraph "Backend Platform"
        BE[Spring Boot API<br/>Java 21 / Port 8080]
        EMAIL[Email Service<br/>Node.js / Express]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Identity + Structure)]
        MDB[(MongoDB Atlas<br/>Telemetry + AI)]
        SB[Supabase<br/>File Storage]
    end

    subgraph "External Services"
        GH[GitHub OAuth2]
        RESEND[Resend<br/>Email Delivery]
    end

    FE -->|REST + JWT| BE
    FE -->|OAuth2| GH
    SDK_EX -->|POST /ingest/*| BE
    SDK_GO -->|POST /ingest/*| BE
    SDK_PY -->|POST /ingest/*| BE
    CLI -->|git commands| GIT[Git Remote]

    BE --> PG
    BE --> MDB
    BE --> SB
    BE --> EMAIL
    EMAIL --> RESEND
    BE --> GH
```

---

## Request Lifecycle

### Authenticated Dashboard Request
```
Browser → Frontend (Next.js)
       → GET /org (with JWT Bearer token)
       → Backend (JWTAuthenticationFilter validates token)
       → OrganizationService (checks user membership)
       → OrganizationRepository (PostgreSQL query)
       → Response: Organization[]
       → Frontend renders OrgCard grid
```

### SDK Telemetry Ingest
```
Instrumented App → SDK middleware (intercepts HTTP request)
                → Creates traceId + rootSpanId in AsyncLocal context
                → Request proceeds through app code
                → sdk.service() / sdk.call() create child spans
                → Response sent → root span pushed to buffer
                → Every 30s: SDK flushes buffer
                → POST /ingest/traces (x-api-key header)
                → Backend validates API key → resolves applicationId/projectId
                → Stores trace in MongoDB
```

### OAuth2 Login
```
Browser → GET /oauth2/authorization/github
       → Redirect to GitHub OAuth
       → User authorizes → GitHub redirects to REDIRECT_URI
       → Backend: CustomOAuth2UserService creates/updates User in PostgreSQL
       → OAuth2SuccessHandler issues JWT + refresh token
       → Frontend stores JWT in localStorage["token"]
```

---

## Module Architecture (Backend)

The backend uses **Spring Modulith** to enforce module boundaries at compile time.

```mermaid
graph LR
    subgraph "Spring Boot Application"
        CORE[core<br/>Users, Orgs, Projects, Apps, API Keys]
        QUERY[query<br/>Traces, Logs, Metrics]
        AI[ai<br/>Tenants, Docs]
        SEC[security<br/>JWT, OAuth2, Refresh]
        EMAIL_MOD[email<br/>Email dispatch]
        LIB[Library<br/>Supabase]
        CONFIG[config<br/>Exception handling]
    end

    SEC --> CORE
    CORE --> LIB
    CORE --> EMAIL_MOD
    QUERY --> CORE
    AI --> LIB
```

---

## Data Architecture

### PostgreSQL (Relational — Identity & Structure)
- Users, Organizations, Projects, Applications
- API Keys (ApiClient), Invites, Plans
- Refresh Tokens
- Managed by JPA/Hibernate with `ddl-auto=update`

### MongoDB (Document — Telemetry & AI Content)
- Traces (distributed trace spans)
- Logs (structured log entries)
- Metrics (application metrics — emitter not yet built)
- AI Docs (knowledge-base document metadata)
- AI Tenants

### Supabase (Object Storage — Files)
- Organization logos
- AI Gateway documents

---

## Security Architecture

```mermaid
sequenceDiagram
    participant B as Browser
    participant FE as Frontend
    participant BE as Backend
    participant GH as GitHub

    B->>FE: Click "Login with GitHub"
    FE->>BE: GET /oauth2/authorization/github
    BE->>GH: Redirect (OAuth2 Authorization Code)
    GH->>B: GitHub login page
    B->>GH: User authorizes
    GH->>BE: Callback with code
    BE->>GH: Exchange code for access token
    BE->>BE: Create/update User in PostgreSQL
    BE->>BE: Issue JWT + Refresh Token
    BE->>FE: Redirect with JWT
    FE->>B: Store JWT in localStorage
    B->>BE: All subsequent requests: Authorization: Bearer {jwt}
    BE->>BE: JWTAuthenticationFilter validates on every request
```

---

## Current System Gaps

| Category | Gap | Severity |
|---|---|---|
| Security | No explicit RBAC roles | Critical |
| Security | API key storage format unverified | High |
| Observability | No metrics SDK emitter | Medium |
| Observability | No real-time streaming | Medium |
| Infrastructure | No CI/CD pipeline | High |
| Infrastructure | No docker-compose for local dev | High |
| Database | No TTL on telemetry collections | High |
| Database | No explicit migration tool | High |
| SDK | Ingest URL inconsistency | High |
| SDK | Java, React, npm SDKs not implemented | Medium |
| CLI | Several commands referenced but not implemented | Medium |
