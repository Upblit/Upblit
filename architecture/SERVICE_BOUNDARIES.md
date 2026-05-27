# Service Boundaries

> Defines what each service owns, what it exposes, and what it must not do.

---

## Backend API (`Upblit/backend/`)

### Owns
- All business logic for the Upblit platform
- User identity and authentication (JWT, OAuth2)
- Organization, Project, Application, API Key management
- Telemetry ingest and query (traces, logs, metrics)
- AI Gateway (tenants, document management)
- Email dispatch coordination (via email service)
- File storage coordination (via Supabase)

### Exposes
- REST API on port 8080
- WebSocket endpoint (infrastructure present, not yet wired to features)
- OpenAPI spec (via springdoc)

### Must Not
- Store files on local disk
- Send emails directly (delegate to email service)
- Expose raw stack traces in API responses
- Accept requests without authentication (except OAuth2 callback and ingest with API key)

---

## Frontend (`Upblit/frontend/`)

### Owns
- All user-facing web UI
- Dashboard (orgs, projects, apps, observability, AI gateway, profile)
- Landing/marketing page
- Authentication flow (OAuth2 redirect, JWT storage)
- Client-side filtering and state management

### Exposes
- Web application on port 3000
- Static assets

### Must Not
- Call `fetch()` directly in components (use `src/lib/api.ts`)
- Store API keys in `localStorage` or `sessionStorage`
- Implement business logic (delegate to backend)
- Use icon libraries other than `lucide-react`
- Use animation libraries other than `framer-motion`

---

## Email Service (`Upblit/email/`)

### Owns
- Email template rendering
- Email delivery via Resend API
- Webhook handling via Svix

### Exposes
- HTTP API on port 3000
- `POST /` — send email by template name
- `POST /tester` — test endpoint

### Must Not
- Access the database directly
- Handle authentication (authentication is the backend's responsibility)
- Store user data

---

## Express SDK (`SDK/Express-sdk/`)

### Owns
- HTTP request instrumentation for Express.js applications
- Trace and log buffering and flushing
- Span context propagation via AsyncLocalStorage

### Exposes
- `upblit(apiKey)` — Express middleware factory
- `upblit.service(name, fn)` — service span helper
- `upblit.controller(name, fn)` — controller span helper
- `upblit.call(name, fn)` — external call span helper
- `upblit.log(level, message)` — log helper

### Must Not
- Access the database directly
- Modify the HTTP request or response beyond adding trace headers
- Throw errors that crash the instrumented application
- Store the API key anywhere other than memory

---

## Go SDK (`SDK/Go-sdk/`)

### Owns
- HTTP request instrumentation for Go HTTP servers
- Trace and log buffering and flushing (goroutine-safe)
- Span context propagation via `context.Context`

### Exposes
- `upblit.New(apiKey, ...opts)` — SDK constructor
- `sdk.Middleware()` — HTTP middleware
- `sdk.Service(ctx, name, fn)` — service span
- `sdk.Call(ctx, name, fn)` — external call span
- `sdk.Log(level, message)` — log helper
- `sdk.Flush(ctx)` — manual flush
- `sdk.Close()` — graceful shutdown

### Must Not
- Use global state (all state is on the `*SDK` struct)
- Panic on transport errors
- Block the instrumented application's goroutines

---

## Python SDK (`SDK/Python-sdk/`)

### Owns
- HTTP request instrumentation for Python ASGI/WSGI applications
- Trace and log buffering and flushing (thread-safe)
- Span context propagation via `threading.local`

### Exposes
- `upblit.init(api_key)` — module-level initialization
- `upblit.SDK(api_key)` — instance constructor
- `await sdk.service(name, fn)` — service span
- `await sdk.call(name, fn)` — external call span
- `await sdk.controller(name, fn)` — controller span
- `sdk.log(level, message)` — log helper
- `sdk.flush()` — manual flush
- `sdk.close()` — graceful shutdown

### Must Not
- Import framework-specific code at module level (keep framework adapters separate)
- Use `requests` or other external HTTP libraries (use `urllib.request`)
- Block the event loop in async contexts

---

## DeployX CLI (`Upblit/UpblitCLI/`)

### Owns
- Git-based deployment workflow automation
- Developer-facing CLI interface

### Exposes
- `deployx init <git-repo-url>` — initialize and push
- `deployx push` — commit and push
- `deployx --help`

### Must Not
- Access the Upblit API directly (current implementation is Git-only)
- Store credentials
- Require external dependencies beyond Go stdlib

---

## Boundary Violations to Watch For

| Violation | Risk |
|---|---|
| Component calling `fetch()` directly instead of `src/lib/api.ts` | Inconsistent auth, hard to maintain |
| Backend module importing another module's internal classes | Breaks Spring Modulith enforcement |
| SDK reading environment variables | Breaks the constructor-parameter contract |
| Email service accessing PostgreSQL | Creates hidden coupling |
| Frontend storing API keys in localStorage | Security risk |
| Backend writing files to local disk | Files lost on container restart |
