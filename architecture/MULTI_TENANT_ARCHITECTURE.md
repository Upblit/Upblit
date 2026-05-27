# Multi-Tenant Architecture

> Describes how Upblit isolates data between organizations (tenants).

---

## Tenancy Model

Upblit uses **shared database, shared schema** multi-tenancy:
- All organizations share the same PostgreSQL tables
- All telemetry shares the same MongoDB collections
- Isolation is enforced at the **application layer** via `organizationId` / `projectId` / `applicationId` filters

This is the simplest and most cost-effective model for early-stage SaaS. It trades isolation strength for operational simplicity.

---

## Tenant Hierarchy

```
User (GitHub identity)
└── Organization (top-level tenant)
    ├── Plan (billing tier)
    ├── Invite (user membership)
    └── Project
        └── Application
            ├── API Key (for SDK authentication)
            └── Telemetry (Traces, Logs, Metrics in MongoDB)
```

---

## Data Isolation Enforcement

### PostgreSQL

All queries must be scoped to the authenticated user's organizations:

```java
// Correct: scoped to user's orgs
organizationRepository.findByUsersContaining(currentUser)

// Wrong: returns all orgs
organizationRepository.findAll()
```

The `ProjectAccessService` in `com.upblit.backend.query.service` is responsible for verifying that a user has access to a project before returning telemetry data.

### MongoDB

Telemetry documents store `applicationId` and `projectId`. All queries must include these as filters:

```java
// Correct: scoped to project
traceRepository.findByProjectId(projectId)

// Wrong: returns all traces
traceRepository.findAll()
```

### API Key Scoping

Each API key is scoped to a single Application. When the backend receives an ingest request:
1. Validates `x-api-key` against `ApiClient` table
2. Resolves `applicationId` from the API key record
3. Resolves `projectId` from the application record
4. Stores telemetry with both IDs

This ensures telemetry is always associated with the correct tenant hierarchy.

---

## Current Isolation Risks

| Risk | Description | Mitigation |
|---|---|---|
| Missing authorization checks | If `GET /org` returns all orgs instead of user's orgs, cross-tenant data leakage occurs | Audit all endpoints (SEC-001, SEC-002) |
| No row-level security | A SQL injection or authorization bug could expose all org data | Add PostgreSQL RLS (BE-021) |
| Shared MongoDB collections | A query without `projectId` filter returns all tenants' data | Enforce filter in all repository methods |
| No RBAC | Any org member can perform admin actions | Implement RBAC (SEC-009 through SEC-012) |

---

## AI Gateway Tenancy

The AI Gateway has its own tenant concept (`Tenant` entity in MongoDB) that is scoped to an Organization:

```
Organization
└── AI Tenant (name, organizationId)
    └── AI Document (file metadata, stored in Supabase)
```

AI tenants are isolated by `organizationId`. All AI tenant queries must include the organization filter.

---

## Future Tenancy Considerations

If Upblit scales to thousands of organizations, the shared schema model may need to evolve:

| Model | When to Consider |
|---|---|
| Shared schema (current) | < 1,000 organizations, low isolation requirements |
| Schema-per-tenant | > 1,000 organizations, compliance requirements (GDPR, HIPAA) |
| Database-per-tenant | Enterprise customers requiring complete data isolation |

**Do not migrate to a different tenancy model without explicit product and engineering decision.** The current model is appropriate for the current scale.
