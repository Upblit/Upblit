# Terminology

> Canonical definitions for all domain terms used across Upblit. All agents, contributors, and documentation must use these terms consistently.

---

## Core Domain Terms

| Term | Definition |
|---|---|
| **Organization** | Top-level tenant unit. A group of users sharing projects and billing. Stored in PostgreSQL. Has a logo (stored in Supabase). |
| **Project** | A logical grouping of applications within an organization. Maps to a deployment context. |
| **Application** | A single deployable service or app within a project. Has an environment (production/staging/development). The unit that receives an API key. |
| **API Key** | A secret token generated per Application. Used by SDKs to authenticate telemetry ingestion. Never stored in frontend state after display. |
| **Trace** | A distributed trace record. Contains one or more Spans. Identified by `traceId`. Stored in MongoDB. |
| **Span** | A single unit of work within a trace. Has `spanId`, `parentSpanId`, `requestMethod`, `requestURL`, `responseStatus`, `durationMs`. |
| **Log Entry** | A structured log record with `level`, `message`, `traceId`, `timestamp`. Stored in MongoDB. |
| **Telemetry** | The collective term for Traces + Logs + Metrics emitted by instrumented applications. |
| **Ingest** | The act of receiving telemetry data from SDKs. Endpoint: `/ingest/traces`, `/ingest/logs`. |
| **Tenant** | An AI Gateway tenant. Scoped to an Organization. Used to manage AI knowledge-base documents. |
| **Plan** | A billing/feature tier for an Organization. Defined by the `Plan` entity in the backend. |
| **Invite** | A mechanism to add users to an Organization. Managed by `InviteController`. |
| **Refresh Token** | A long-lived token used to obtain new JWT access tokens without re-authentication. |

---

## Technical Terms

| Term | Definition |
|---|---|
| **DeployX** | The brand name for the deployment CLI tool (`UpblitCLI`). Commands: `deployx init`, `deployx push`. |
| **SDK** | Software Development Kit. Upblit provides SDKs for Express (Node.js), Go, and Python. Each SDK instruments HTTP requests and emits traces/logs to the ingest endpoint. |
| **Flush** | The SDK operation of sending buffered traces/logs to the ingest endpoint. Triggered on a timer (default 30s) or manually. |
| **Span Context** | Thread-local / async-local storage holding the current `traceId` and `spanId`. Used by SDKs to propagate trace context across async calls. |
| **Spring Modulith** | The architectural pattern used in the backend. Modules are enforced at compile time. |
| **Supabase** | Used as a file/object storage backend for organization logos and AI documents. |
| **Resend** | Third-party email delivery service used by the email microservice. |
| **Svix** | Webhook delivery service. Referenced in the email service. |
| **Scalar** | The API reference UI library used in the Swagger service (`@scalar/api-reference`). |
| **Nextra** | The Next.js-based documentation framework used for the docs site. |
| **Stitch** | Internal design system / screen definition format. JSON files in `frontend/src/stitch/` define UI screens declaratively. |

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Java packages | `com.upblit.backend.<module>` | `com.upblit.backend.core.org` |
| Java classes | PascalCase | `OrganizationService`, `ApiKeyController` |
| TypeScript interfaces | PascalCase | `Organization`, `DashboardProject` |
| TypeScript functions | camelCase | `fetchWithAuth`, `normalizeProject` |
| API endpoints | kebab-case nouns | `/org`, `/project`, `/applications`, `/apikey` |
| Go packages | lowercase | `package upblit` |
| Go types | PascalCase | `SDK`, `Trace`, `LogEntry` |
| Python classes | PascalCase | `SDK`, `Transport` |
| Python functions | snake_case | `push_trace`, `flush_logs` |
| CSS Modules | camelCase | `styles.page`, `styles.textShine` |
| Environment variables | SCREAMING_SNAKE_CASE | `MONGODB_URI`, `JWT_SECRET` |

---

## Ambiguous Terms to Avoid

| Avoid | Use Instead | Reason |
|---|---|---|
| "service" (generic) | Specify: "backend service", "email service", "SDK service span" | Overloaded term |
| "log" (verb) | "emit a log entry", "push a log" | Conflicts with the noun |
| "deploy" (generic) | "push via DeployX CLI", "deploy to environment" | Overloaded in product context |
| "tenant" (generic) | "AI Gateway tenant" | Distinguish from multi-tenancy at org level |
