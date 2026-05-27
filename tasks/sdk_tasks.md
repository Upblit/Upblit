# SDK Tasks

> Owner: ANTIGRAVITY
> Scope: `SDK/`, `Upblit/sdk/`, `Upblit/UpblitCLI/`
> Reference: `.ai-context/sdk_standards.md`, `.ai-context/telemetry_flow.md`

---

## Critical Fixes (Existing SDKs)

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-001 | Standardize ingest base URL to `https://ingest.upblit.com` across all SDKs (Go uses `.com`, Python uses `.dev`) | P1 | [ ] | CROSS-001 | None |
| SDK-002 | Verify Express SDK ingest URL in `service.js` — document and align with standard | P1 | [ ] | None | None |
| SDK-003 | Add `GET /health` skip to Go SDK middleware (currently only in Express SDK) | P2 | [ ] | None | None |
| SDK-004 | Add `GET /health` skip to Python SDK middleware | P2 | [ ] | None | None |

---

## Express SDK

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-005 | Publish Express SDK to npm registry (currently only `.tgz` file) | P1 | [ ] | None | None |
| SDK-006 | Write unit tests for Express SDK middleware (span creation, context propagation) | P2 | [ ] | None | None |
| SDK-007 | Write unit tests for Express SDK flush/re-queue on transport failure | P2 | [ ] | None | None |
| SDK-008 | Update Express SDK README with npm install instructions | P2 | [ ] | SDK-005 | None |

---

## Go SDK

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-009 | Define and publish Go module path (e.g., `github.com/upblit/go-sdk`) | P1 | [ ] | None | None |
| SDK-010 | Verify Go SDK middleware correctly captures response status code via `response_writer.go` | P1 | [ ] | None | None |
| SDK-011 | Add `sdk_test.go` coverage for: middleware span creation, flush, re-queue on failure | P2 | [ ] | None | None |
| SDK-012 | Update Go SDK README with `go get` install instructions and quickstart | P2 | [ ] | SDK-009 | None |

---

## Python SDK

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-013 | Publish Python SDK to PyPI | P1 | [ ] | None | None |
| SDK-014 | Verify Python SDK middleware works with FastAPI (ASGI) | P1 | [ ] | None | None |
| SDK-015 | Verify Python SDK middleware works with Flask (WSGI) | P2 | [ ] | None | None |
| SDK-016 | Write unit tests for Python SDK (flush, re-queue, log level routing) | P2 | [ ] | None | None |
| SDK-017 | Update Python SDK README with pip install instructions and quickstart | P2 | [ ] | SDK-013 | None |

---

## New SDK Implementations

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-018 | Implement Java SDK in `Upblit/sdk/java-sdk/` — Spring Boot auto-configuration, servlet filter, `@Traced` annotation | P2 | [ ] | None | None |
| SDK-019 | Implement React SDK in `Upblit/sdk/react-sdk/` — browser error boundary tracing, Web Vitals, session correlation | P2 | [ ] | None | None |
| SDK-020 | Implement npm (generic Node.js) SDK in `Upblit/sdk/npm-sdk/` — Fastify, Koa, Hapi support | P3 | [ ] | None | None |

---

## Metrics SDK

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-021 | Design metrics payload schema (backend model exists: `Metrics.java`) | P2 | [ ] | CODEX coordination | None |
| SDK-022 | Implement metrics emitter in Express SDK | P2 | [ ] | SDK-021 | None |
| SDK-023 | Implement metrics emitter in Go SDK | P2 | [ ] | SDK-021 | None |
| SDK-024 | Implement metrics emitter in Python SDK | P2 | [ ] | SDK-021 | None |

---

## CLI (DeployX)

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| SDK-025 | Implement `deployx live` command (referenced in frontend but not implemented) | P2 | [ ] | None | None |
| SDK-026 | Implement `deployx deploy --env prod` command | P2 | [ ] | None | None |
| SDK-027 | Implement `deployx logs --project <name>` command | P2 | [ ] | None | None |
| SDK-028 | Implement `deployx rollback --to <version>` command | P3 | [ ] | None | None |
| SDK-029 | Create release pipeline for DeployX CLI binary (GitHub Releases) | P2 | [ ] | CROSS-003 | None |
