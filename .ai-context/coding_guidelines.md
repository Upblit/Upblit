# Coding Guidelines

> These are the observed and prescribed coding standards for the Upblit codebase. All agents and contributors must follow these when generating or reviewing code.

---

## General Principles

1. **Match the existing style** — before writing new code, read the surrounding file. Match its patterns, naming, and structure.
2. **No unnecessary abstractions** — only introduce a new abstraction when there is clear evidence of duplication or complexity that warrants it.
3. **Explicit over implicit** — prefer explicit types, explicit error handling, and explicit data flow over magic or convention-based inference.
4. **No speculative features** — do not implement features that are not in the current task scope.
5. **Security by default** — validate inputs, use parameterized queries, never log secrets, never expose tokens in client-side storage beyond what is already established.

---

## Backend (Java / Spring Boot)

### Package Structure
- Follow the existing module layout: `com.upblit.backend.<module>.<layer>`
- Layers: `controller`, `service`, `repository`, `model` / entity, `DTO`
- Spring Modulith boundaries must be respected — do not import across module boundaries without explicit module API

### Naming
- Controllers: `<Entity>Controller.java` — exception: `orgcontroller.java` (existing, do not rename)
- Services: `<Entity>Service.java`
- Repositories: `<Entity>Repository.java`
- DTOs: `<Entity>DTO.java`
- Entities: `<Entity>.java` (no suffix)

### Code Style
- Use Lombok `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` where appropriate
- Use `@RestController` + `@RequestMapping` for controllers
- Use `ResponseEntity<T>` for all controller return types
- Use `Optional<T>` from repositories — never return `null` from service methods
- Use `WebClient` (reactive) for outbound HTTP calls — `RestTemplate` is legacy, avoid adding new usages
- All environment-sensitive config must come from `application.properties` via `${ENV_VAR}` — no hardcoded secrets

### Database
- PostgreSQL (via JPA/Hibernate): Users, Organizations, Projects, Applications, API Keys, Invites, Refresh Tokens, Plans
- MongoDB (via Spring Data MongoDB): Traces, Logs, Metrics, AI Docs, AI Tenants
- `spring.jpa.hibernate.ddl-auto=update` is set — schema changes happen automatically; be careful with destructive changes
- File storage: Supabase (via `SupabaseService`) — not local disk

### Error Handling
- Use `GlobalExceptionHandler` for centralized exception mapping
- Return structured error responses — never raw stack traces to clients
- Log errors at `ERROR` level with context (entity ID, operation)

---

## Frontend (TypeScript / Next.js)

### Architecture
- App Router (Next.js 16) — all pages are in `src/app/`
- Client components: `"use client"` directive at top of file
- Server components: default (no directive needed)
- CSS Modules: `ComponentName.module.css` co-located with component
- No global CSS mutations — use CSS Modules or Tailwind utility classes

### API Client
- All backend calls go through `src/lib/api.ts` or `src/lib/upblit-api.ts`
- Never call `fetch()` directly from a component — use the typed helpers
- Auth token is read from `localStorage` key `"token"`
- On 401: clear token, redirect to `/login?reason=session_expired`
- Organization ID is read from `localStorage` keys: `organizationId`, `OrganizationId`, or `orgId` (in that priority order)

### Component Conventions
- One component per file
- Props interface defined at top of file: `interface ComponentNameProps { ... }`
- Use `lucide-react` for all icons — no other icon libraries
- Use `framer-motion` for animations — no CSS transitions for interactive animations
- Use `next/image` for all images — never `<img>` tags
- Environment badge colors: `production` → red, `staging` → yellow, `development` → green, unknown → grey

### State Management
- Local component state: `useState` / `useReducer`
- No global state library is currently installed — do not add one without explicit task approval
- API keys: stored only in component state, never in `localStorage` or `sessionStorage`

### TypeScript
- Strict mode is enabled — no `any` types without explicit justification
- All API response shapes must have typed interfaces
- Use `normalizeProject`, `normalizeApplication`, `normalizeOrganization` helpers from `upblit-api.ts` when mapping API responses

### Styling
- Dark theme: background `#000` / `#1c1b1b`, text `#e5e2e1` / `#c3c5d9`, borders `#353534` / `#434656`
- Brand blue: `#0052ff`
- Font families: `var(--font-space-grotesk)`, `var(--font-cubano)`, `var(--font-montserrat)`, `var(--font-jetbrains)`
- Tailwind 4 utility classes are available for layout/spacing — prefer CSS Modules for component-specific styles

---

## SDKs (Express / Go / Python)

### Shared Behavioral Contract
- All SDKs must buffer traces and logs in memory and flush on a configurable interval (default: 30s)
- All SDKs must support manual `flush()` / `Flush()` calls
- All SDKs must re-queue failed batches on transport error
- All SDKs must use `x-api-key` header for authentication
- Ingest endpoints: `POST /ingest/traces`, `POST /ingest/logs`
- Payload format: `{ timestamp: ISO8601, traces: Trace[] }` / `{ timestamp: ISO8601, logs: LogEntry[] }`

### Express SDK
- Entry point: `upblit(apiKey)` returns Express middleware
- Span helpers: `upblit.service(name, fn)`, `upblit.controller(name, fn)`, `upblit.call(name, fn)`
- Context propagation: Node.js `AsyncLocalStorage` via `context.js`

### Go SDK
- Entry point: `upblit.New(apiKey, ...opts)` returns `*SDK`
- Options pattern: `WithBaseURL`, `WithHTTPClient`, `WithFlushInterval`
- Thread safety: all buffer operations protected by `sync.Mutex`
- Graceful shutdown: `sdk.Close()` stops the flush goroutine

### Python SDK
- Entry point: `upblit.init(api_key)` for module-level default; `upblit.SDK(api_key)` for instance
- Async span helpers: `await sdk.service(name, fn)`, `await sdk.call(name, fn)`, `await sdk.controller(name, fn)`
- Thread safety: `threading.RLock` for buffer operations
- Background flush: daemon thread, stops on `sdk.close()`

---

## CLI (Go)

- Binary name: `deployx`
- Commands: `init <git-repo-url>`, `push`, `--help`
- No external dependencies beyond stdlib — keep it minimal
- All output to stdout; errors to stderr via `log.Fatalf`

---

## What to Avoid

- Do not add `console.log` / `System.out.println` debug statements to committed code
- Do not hardcode URLs — use environment variables
- Do not commit `.env` files
- Do not use `any` in TypeScript without a comment explaining why
- Do not use `RestTemplate` for new backend HTTP calls — use `WebClient`
- Do not bypass Spring Security filters
- Do not store secrets in frontend state beyond the established `localStorage` token pattern
