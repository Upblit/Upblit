# Folder Structure

> Canonical directory layout for the Upblit workspace. Use this as the reference when navigating, adding files, or explaining the codebase to new contributors.

---

## Workspace Root

```
/                                   ← Workspace root (c:\Workspace\Upblit)
├── Upblit/                         ← Main monorepo
├── SDK/                            ← Production SDK implementations
├── 1-day-data/                     ← Standalone OTEL dashboard prototype (Next.js)
├── docs/                           ← Standalone docs site (Next.js + Nextra)
├── frontend/                       ← Empty (not the main frontend)
└── New folder/                     ← Empty / scratch
```

---

## Upblit/ (Main Monorepo)

```
Upblit/
├── .gitignore
├── backend/                        ← Spring Boot API (Java 21, Maven)
├── frontend/                       ← Next.js 16 frontend (React 19, TypeScript)
├── email/                          ← Email microservice (Node.js, Express, Resend)
├── sdk/                            ← SDK stubs (EMPTY — not the real SDKs)
│   ├── express-sdk/
│   ├── go-sdk/
│   ├── java-sdk/
│   ├── npm-sdk/
│   ├── python-sdk/
│   └── react-sdk/
├── swagger/swagger/                ← API reference UI (Next.js + @scalar/api-reference)
├── policies/                       ← Legal/policy pages (Next.js + MDX + Radix UI)
├── docs/nextra-docs-demo-yt/       ← Documentation site (Next.js + Nextra + MDX)
├── Community/                      ← Static HTML community page
├── UpblitCLI/                      ← DeployX CLI tool (Go)
├── test/                           ← Test projects (not production)
│   ├── frontend-mainpage/
│   ├── testingchart/
│   └── node-servers/
├── .ai-context/                    ← AI workspace intelligence (generated)
├── agents/                         ← AI agent governance files (generated)
├── tasks/                          ← Task distribution system (generated)
└── architecture/                   ← Architecture documentation (generated)
```

---

## Backend Structure

```
backend/
├── Dockerfile
├── pom.xml                         ← Spring Boot 4, Java 21, Spring Modulith
├── .env                            ← Local secrets (gitignored)
└── src/main/
    ├── resources/
    │   └── application.properties  ← All config via ${ENV_VAR}
    └── java/com/upblit/backend/
        ├── BackendApplication.java
        ├── ai/                     ← AI Gateway module
        │   ├── Doc.java / DocRepository.java
        │   ├── Tenant.java / TenantRepository.java
        │   ├── docs/               ← DocsController, DocsService, DTOs
        │   └── tenant/             ← TenantController, TenantService, TenantDTO
        ├── config/                 ← GlobalExceptionHandler, RestTemplateConfig
        ├── core/                   ← Core domain module
        │   ├── Application.java / ApplicationDTO.java / ApplicationsRepository.java
        │   ├── Organization.java / OrganizationRepository.java
        │   ├── Project.java / ProjectRepository.java
        │   ├── User.java / UserRepository.java
        │   ├── Plan.java
        │   ├── ApiKey/             ← ApiClient, ApiKeyController, ApiKeyGenerator
        │   ├── application/        ← ApplicationController, ApplicationService
        │   ├── org/                ← OrganizationService, orgcontroller, Invite*, LogoImageProcessor
        │   ├── project/            ← ProjectController, ProjectService, ProjectDTO
        │   └── user/               ← UserController, UserService
        ├── email/                  ← EmailDTO, EmailService (calls external email service)
        ├── Library/                ← SupabaseService (file storage)
        ├── query/                  ← Telemetry read path
        │   ├── controller/         ← LogController, MetricsController, TraceController
        │   ├── DTO/                ← PaginatedResponse
        │   ├── model/              ← Log, Metrics, Trace (MongoDB documents)
        │   ├── repository/         ← LogRepository, MetricsRepository, TraceRepository
        │   └── service/            ← LogService, MetricsService, TraceService, ProjectAccessService
        ├── security/               ← Security module
        │   ├── SecurityConfig.java
        │   ├── UserdataUtil.java
        │   ├── JWT/                ← JWTAuthenticationFilter, JWTService
        │   ├── OAuth/              ← CustomOAuth2User*, OAuth2SuccessHandler
        │   └── RefreshToken/       ← Refresh, RefreshController, RefreshRepository, RefreshService
        └── test/                   ← Test utilities (Pinger, Test)
```

---

## Frontend Structure

```
frontend/
├── package.json                    ← Next.js 16, React 19, framer-motion, lucide-react, shadcn
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout
│   │   ├── page.tsx                ← Landing page (marketing)
│   │   ├── page.module.css
│   │   ├── globals.css
│   │   ├── component/              ← Landing page components
│   │   │   ├── background/
│   │   │   ├── navbar/
│   │   │   └── contributors/
│   │   └── dashboard/              ← Dashboard app shell
│   │       ├── layout.tsx          ← Dashboard layout (sidebar + header + auth guard)
│   │       ├── page.tsx            ← Redirect to /dashboard/orgs
│   │       ├── Dashboard.module.css
│   │       ├── components/         ← Shared dashboard components
│   │       │   ├── Header/
│   │       │   ├── Sidebar/        ← (to be created)
│   │       │   ├── OrgCard/        ← (to be created)
│   │       │   ├── ApplicationCard/← (to be created)
│   │       │   ├── ApiKeyModal/    ← (to be created)
│   │       │   ├── TelemetryTable/ ← (to be created)
│   │       │   ├── LogsTable/      ← (to be created)
│   │       │   └── Toast/          ← (to be created)
│   │       ├── orgs/               ← (to be created)
│   │       │   └── [orgId]/projects/
│   │       │       └── [projectId]/
│   │       │           ├── apps/
│   │       │           └── observability/
│   │       ├── ai-gateway/         ← (to be created)
│   │       └── profile/            ← (to be created)
│   ├── lib/
│   │   ├── api.ts                  ← Primary API client (fetchWithAuth)
│   │   └── upblit-api.ts           ← Extended API client (normalize helpers)
│   └── stitch/                     ← Declarative screen definitions (design artifacts)
│       └── projects-screen.json
└── agents/                         ← Frontend spec documents
    ├── design.md
    ├── requirements.md
    └── tasks.md
```

---

## SDK/ (Production SDKs)

```
SDK/
├── Express-sdk/
│   ├── index.js                    ← Entry point: upblit(apiKey) → middleware
│   ├── middleware.js               ← HTTP request instrumentation
│   ├── tracer.js                   ← Span helpers (service, controller, call)
│   ├── logger.js                   ← Log helper
│   ├── context.js                  ← AsyncLocalStorage context
│   ├── service.js                  ← Transport (HTTP push to ingest)
│   ├── package.json
│   └── upblit-express-2.0.0.tgz   ← Published package
├── Go-sdk/
│   ├── sdk.go                      ← SDK struct, New(), Flush(), Close()
│   ├── middleware.go               ← HTTP middleware
│   ├── tracer.go                   ← Span helpers
│   ├── logger.go                   ← Log helper
│   ├── context.go                  ← context.Context propagation
│   ├── types.go                    ← Trace, LogEntry structs
│   ├── time.go                     ← Time utilities
│   ├── uuid.go                     ← UUID generation
│   ├── response_writer.go          ← HTTP response writer wrapper
│   ├── default.go                  ← Default SDK instance
│   ├── go.mod
│   └── sdk_test.go
└── Python-sdk/
    ├── upblit/
    │   ├── __init__.py             ← Public API exports
    │   ├── sdk.py                  ← SDK class, init(), flush(), close()
    │   ├── middleware.py           ← ASGI/WSGI middleware
    │   ├── transport.py            ← HTTP transport
    │   ├── context.py              ← Thread-local context
    │   └── types.py                ← Trace, LogEntry dataclasses
    ├── tests/
    │   └── test_sdk.py
    └── pyproject.toml
```

---

## Naming Conventions for New Files

| Type | Convention | Example |
|---|---|---|
| React component | `PascalCase.tsx` + `PascalCase.module.css` | `OrgCard.tsx` |
| Next.js page | `page.tsx` (App Router convention) | `orgs/page.tsx` |
| Next.js layout | `layout.tsx` | `dashboard/layout.tsx` |
| TypeScript utility | `camelCase.ts` | `useToast.ts` |
| Java controller | `PascalCaseController.java` | `ApplicationController.java` |
| Java service | `PascalCaseService.java` | `OrganizationService.java` |
| Java entity | `PascalCase.java` | `Organization.java` |
| Java DTO | `PascalCaseDTO.java` | `OrganizationDTO.java` |
| Go file | `snake_case.go` | `response_writer.go` |
| Python file | `snake_case.py` | `transport.py` |
