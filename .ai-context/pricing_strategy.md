# Pricing Strategy

> Plan names from backend: `PIRATES`, `SUPERNOVA`, `WARLORD`
> Hierarchy: Organization → Project → Application
> This document defines limits, upgrade logic, and centralization strategy.

---

## The Core Question: What Level Does the Plan Live At?

The plan must live at the **Organization level** — not the user level, not the project level.

**Why:**
- An Organization is the billing unit. It owns projects, applications, and team members.
- A user can belong to multiple orgs, each on a different plan.
- Projects and Applications are resources *consumed* by the org — they don't have their own billing.
- This matches how every major platform (Vercel, Railway, Render, GitHub) does it.

```
User (free identity — no plan)
└── Organization  ← PLAN LIVES HERE (PIRATES / SUPERNOVA / WARLORD)
    ├── Project (counted against org quota)
    │   └── Application (counted against org quota)
    │       ├── API Key
    │       └── Telemetry (counted against org data quota)
    └── Members (counted against org seat quota)
```

---

## Plan Definitions

### PIRATES — Free

> For solo developers and side projects. No credit card required.

| Resource | Limit |
|---|---|
| Organizations | 1 |
| Projects per org | 3 |
| Applications per project | 3 |
| Team members per org | 1 (solo only) |
| API keys per application | 1 |
| Trace retention | 7 days |
| Log retention | 7 days |
| Telemetry ingestion | 50,000 spans/month |
| Log ingestion | 10,000 log entries/month |
| AI Gateway tenants | 1 |
| AI documents per tenant | 3 |
| AI document size | 5 MB max |
| Dashboard access | Full |
| DeployX CLI | Full |
| SDK access | Full (Express, Go, Python) |
| Support | Community (GitHub Issues) |

**Upgrade trigger:** Hit any limit → prompt to upgrade to SUPERNOVA.

---

### SUPERNOVA — Pro

> For small teams and growing products.

| Resource | Limit |
|---|---|
| Organizations | 3 |
| Projects per org | 20 |
| Applications per project | 20 |
| Team members per org | 10 |
| API keys per application | 5 |
| Trace retention | 30 days |
| Log retention | 30 days |
| Telemetry ingestion | 5,000,000 spans/month |
| Log ingestion | 1,000,000 log entries/month |
| AI Gateway tenants | 10 |
| AI documents per tenant | 50 |
| AI document size | 10 MB max |
| Dashboard access | Full |
| DeployX CLI | Full |
| SDK access | Full |
| Support | Email (48h response) |

---

### WARLORD — Enterprise

> For organizations that need scale, compliance, and dedicated support.

| Resource | Limit |
|---|---|
| Organizations | Unlimited |
| Projects per org | Unlimited |
| Applications per project | Unlimited |
| Team members per org | Unlimited |
| API keys per application | Unlimited |
| Trace retention | 90 days (configurable) |
| Log retention | 90 days (configurable) |
| Telemetry ingestion | Unlimited (fair use) |
| Log ingestion | Unlimited (fair use) |
| AI Gateway tenants | Unlimited |
| AI documents per tenant | Unlimited |
| AI document size | 50 MB max |
| Dashboard access | Full + audit logs |
| DeployX CLI | Full |
| SDK access | Full + Java SDK (priority) |
| RBAC | Custom roles |
| SSO | Planned |
| SLA | 99.9% uptime SLA |
| Support | Dedicated Slack + 4h response |

---

## Side-by-Side Comparison

| Feature | PIRATES | SUPERNOVA | WARLORD |
|---|---|---|---|
| **Price** | Free | ~$20/mo per org | Custom |
| **Orgs** | 1 | 3 | Unlimited |
| **Projects / org** | 3 | 20 | Unlimited |
| **Apps / project** | 3 | 20 | Unlimited |
| **Members / org** | 1 | 10 | Unlimited |
| **API keys / app** | 1 | 5 | Unlimited |
| **Trace retention** | 7 days | 30 days | 90 days |
| **Log retention** | 7 days | 30 days | 90 days |
| **Spans / month** | 50K | 5M | Unlimited |
| **Logs / month** | 10K | 1M | Unlimited |
| **AI tenants** | 1 | 10 | Unlimited |
| **AI docs / tenant** | 3 | 50 | Unlimited |
| **Support** | Community | Email | Dedicated |

---

## Upgrade Flow — How Centralization Works

### Single Source of Truth

The `Plan` field lives on the `Organization` entity in PostgreSQL.

```java
// com.upblit.backend.core.Organization.java
@Enumerated(EnumType.STRING)
private Plan plan = Plan.PIRATES; // default
```

Every quota check reads from `organization.getPlan()`. No quota logic lives on User, Project, or Application.

### Quota Enforcement Points

```
POST /project?OrganizationId={id}
  → OrganizationService.checkProjectQuota(org)
  → if org.projects.size() >= plan.maxProjects → 403 UPGRADE_REQUIRED

POST /applications
  → ApplicationService.checkAppQuota(project)
  → if project.applications.size() >= plan.maxAppsPerProject → 403 UPGRADE_REQUIRED

POST /org/invite
  → OrganizationService.checkMemberQuota(org)
  → if org.members.size() >= plan.maxMembers → 403 UPGRADE_REQUIRED

POST /ingest/traces
  → IngestService.checkSpanQuota(org, month)
  → if monthlySpans >= plan.maxSpansPerMonth → 429 QUOTA_EXCEEDED

POST /ai/tenant
  → AiService.checkTenantQuota(org)
  → if org.tenants.size() >= plan.maxTenants → 403 UPGRADE_REQUIRED
```

### Plan Limits as a Config Object

Define limits in one place — not scattered across services:

```java
// com.upblit.backend.core.PlanLimits.java
public enum PlanLimits {

    PIRATES(
        1,    // maxOrgs (per user)
        3,    // maxProjectsPerOrg
        3,    // maxAppsPerProject
        1,    // maxMembersPerOrg
        1,    // maxApiKeysPerApp
        7,    // traceRetentionDays
        50_000,   // maxSpansPerMonth
        10_000,   // maxLogsPerMonth
        1,    // maxAiTenants
        3,    // maxAiDocsPerTenant
        5     // maxAiDocSizeMB
    ),

    SUPERNOVA(
        3,
        20,
        20,
        10,
        5,
        30,
        5_000_000,
        1_000_000,
        10,
        50,
        10
    ),

    WARLORD(
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        90,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        Integer.MAX_VALUE,
        50
    );

    public final int maxOrgsPerUser;
    public final int maxProjectsPerOrg;
    public final int maxAppsPerProject;
    public final int maxMembersPerOrg;
    public final int maxApiKeysPerApp;
    public final int traceRetentionDays;
    public final int maxSpansPerMonth;
    public final int maxLogsPerMonth;
    public final int maxAiTenants;
    public final int maxAiDocsPerTenant;
    public final int maxAiDocSizeMB;

    PlanLimits(int maxOrgsPerUser, int maxProjectsPerOrg, int maxAppsPerProject,
               int maxMembersPerOrg, int maxApiKeysPerApp, int traceRetentionDays,
               int maxSpansPerMonth, int maxLogsPerMonth,
               int maxAiTenants, int maxAiDocsPerTenant, int maxAiDocSizeMB) {
        this.maxOrgsPerUser = maxOrgsPerUser;
        this.maxProjectsPerOrg = maxProjectsPerOrg;
        this.maxAppsPerProject = maxAppsPerProject;
        this.maxMembersPerOrg = maxMembersPerOrg;
        this.maxApiKeysPerApp = maxApiKeysPerApp;
        this.traceRetentionDays = traceRetentionDays;
        this.maxSpansPerMonth = maxSpansPerMonth;
        this.maxLogsPerMonth = maxLogsPerMonth;
        this.maxAiTenants = maxAiTenants;
        this.maxAiDocsPerTenant = maxAiDocsPerTenant;
        this.maxAiDocSizeMB = maxAiDocSizeMB;
    }
}
```

Usage in any service:

```java
PlanLimits limits = PlanLimits.valueOf(org.getPlan().name());
if (org.getProjects().size() >= limits.maxProjectsPerOrg) {
    throw new QuotaExceededException("Upgrade to SUPERNOVA to create more projects.");
}
```

---

## Error Response for Quota Hits

```json
HTTP 403
{
  "error": "QUOTA_EXCEEDED",
  "resource": "projects",
  "current": 3,
  "limit": 3,
  "plan": "PIRATES",
  "upgradeUrl": "/pricing"
}
```

The frontend reads `error: "QUOTA_EXCEEDED"` and shows an upgrade prompt inline — not a generic error toast.

---

## Frontend Upgrade Prompt Pattern

When any API call returns `QUOTA_EXCEEDED`:

```
┌─────────────────────────────────────────────────┐
│  You've reached the project limit on PIRATES.   │
│  Upgrade to SUPERNOVA to create up to 20        │
│  projects per organization.                     │
│                                                 │
│  [Upgrade to SUPERNOVA →]   [Not now]           │
└─────────────────────────────────────────────────┘
```

- Show inline in the modal/form that triggered the limit — not a page redirect
- The CTA links to `/pricing` with the relevant plan pre-highlighted
- "Not now" dismisses without blocking the user from other actions

---

## Usage Dashboard (Planned)

Each org's settings page should show a usage meter:

```
PIRATES Plan
─────────────────────────────────────────────────
Projects          ████████░░  3 / 3   [Upgrade]
Applications      ██░░░░░░░░  2 / 3
Members           █░░░░░░░░░  1 / 1   [Upgrade]
Spans this month  ███░░░░░░░  28K / 50K
Logs this month   █░░░░░░░░░  1.2K / 10K
AI Tenants        █░░░░░░░░░  1 / 1   [Upgrade]
─────────────────────────────────────────────────
```

---

## Plan Upgrade Path

```
PIRATES → SUPERNOVA   (self-serve, credit card)
SUPERNOVA → WARLORD   (contact sales / enterprise form)
WARLORD → SUPERNOVA   (downgrade — requires data cleanup if over limits)
```

### Downgrade Rules

If an org downgrades from SUPERNOVA → PIRATES and is over the PIRATES limits:
- Block the downgrade until the org is within limits
- Show exactly which resources need to be removed:
  ```
  Cannot downgrade: you have 12 projects (limit: 3) and 8 members (limit: 1).
  Remove 9 projects and 7 members to continue.
  ```

---

## What Does NOT Have a Plan

| Entity | Has Plan? | Reason |
|---|---|---|
| User | No | Users are free identities. Billing is per org. |
| Project | No | Projects are resources consumed by the org plan. |
| Application | No | Same — counted against org quota. |
| API Key | No | Counted against app quota, enforced by org plan. |

A user with no organizations is always on an implicit "no plan" state — they can create 1 org (PIRATES) for free.

---

## MongoDB TTL Enforcement by Plan

The `traceRetentionDays` limit is enforced via MongoDB TTL indexes, set per-document based on the org's plan at ingest time:

```json
// Trace document
{
  "projectId": 10,
  "traceId": "...",
  "timestamp": "2026-05-27T10:00:00Z",
  "expiresAt": "2026-06-03T10:00:00Z"  // timestamp + plan.traceRetentionDays
}
```

```javascript
db.traces.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

When an org upgrades, existing documents keep their old `expiresAt`. New documents get the new retention window. This avoids a bulk update on upgrade.
