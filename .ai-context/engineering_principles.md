# Engineering Principles

> The foundational beliefs that guide technical decisions in the Upblit codebase. These are not rules — they are the reasoning behind the rules.

---

## 1. Clarity Over Cleverness

Code is read far more often than it is written. Prefer the obvious solution over the elegant one. A junior engineer should be able to understand what a function does without reading its dependencies.

**In practice**:
- Explicit variable names over abbreviations
- Flat code over deeply nested callbacks
- Typed interfaces over `any` or `object`
- Comments that explain *why*, not *what*

---

## 2. Fail Loudly, Recover Gracefully

Errors should be visible during development and handled cleanly in production. Silent failures are the hardest bugs to diagnose.

**In practice**:
- Backend: throw domain exceptions, let `GlobalExceptionHandler` map them to HTTP responses
- Frontend: catch API errors, show user-facing messages, log to console in development
- SDKs: on flush failure, re-queue the batch — never silently drop telemetry data
- Never swallow exceptions with empty catch blocks

---

## 3. The Boundary Is the Contract

Module and service boundaries define the system's architecture. Respecting them prevents the codebase from becoming a monolith disguised as microservices.

**In practice**:
- Spring Modulith boundaries are enforced at compile time — do not bypass them
- The frontend calls the backend only through `src/lib/api.ts` — no direct `fetch()` in components
- SDKs communicate with the backend only through the ingest API — no direct database access
- The email service is a separate process — the backend calls it via HTTP, not direct import

---

## 4. Configuration Is Not Code

Runtime behavior that varies between environments belongs in environment variables, not in source code. Source code should be environment-agnostic.

**In practice**:
- All URLs, secrets, and credentials come from environment variables
- `application.properties` uses `${ENV_VAR}` syntax exclusively
- Frontend uses `NEXT_PUBLIC_*` env vars for API URLs
- SDKs accept `baseURL` as a constructor parameter — no hardcoded ingest URLs

---

## 5. Security Is Not a Feature

Security is a baseline requirement, not an optional enhancement. It must be considered at every layer.

**In practice**:
- Authentication on every API endpoint (JWT or API key)
- Input validation on every user-supplied value
- No secrets in source code, logs, or client-side storage (beyond the established JWT pattern)
- File uploads validated for type and size before processing

---

## 6. Observability Is the Product

Upblit's core value proposition is observability. The platform must practice what it preaches.

**In practice**:
- Every service should emit structured logs
- The backend should be instrumented with the Upblit SDK (dogfooding)
- Error rates, latency, and throughput should be measurable
- Health check endpoints on every service

---

## 7. Incremental Over Big Bang

Large, sweeping changes are risky. Prefer small, verifiable increments that can be reviewed, tested, and rolled back independently.

**In practice**:
- One feature per PR
- Database schema changes are additive (add columns, don't rename or drop)
- API changes are backward-compatible (add fields, don't remove or rename)
- SDK changes follow semantic versioning — breaking changes require a major version bump

---

## 8. The User Is a Developer

Upblit's users are engineers. They expect precision, not hand-holding. Error messages should be specific. Documentation should include code examples. The CLI should be scriptable.

**In practice**:
- Error responses include enough context to diagnose the problem
- API responses are consistent and predictable
- CLI output is parseable (or at least human-readable)
- Documentation shows real code, not pseudocode

---

## 9. Don't Build What You Don't Need

Speculative architecture is technical debt. Build for the current requirements, with enough structure to extend later — but don't extend before you need to.

**In practice**:
- No microservices without a clear reason to split
- No abstraction layers without demonstrated duplication
- No caching without a measured performance problem
- No message queues without a demonstrated need for async processing

---

## 10. Open Source Means Readable

The codebase is open source. Any developer in the world can read it. Write code as if it will be reviewed by a stranger who has no context.

**In practice**:
- README files in every service directory
- Inline comments for non-obvious decisions
- Consistent naming that matches the domain terminology
- No magic numbers or unexplained constants
