# Documentation Tasks

> Owner: ANTIGRAVITY (SDK docs), COPILOT (frontend/API docs)
> Scope: `Upblit/docs/`, `Upblit/swagger/`, `SDK/*/README.md`

---

## API Reference

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| DOCS-001 | Verify `swagger/swagger/public/swagger.json` is up to date with all current backend endpoints | P1 | [ ] | None | None |
| DOCS-002 | Add missing endpoints to `swagger.json`: `/ingest/traces`, `/ingest/logs`, `/ai/tenant`, `/ai/docs` | P1 | [ ] | None | DOCS-001 |
| DOCS-003 | Add request/response schemas to all endpoints in `swagger.json` | P1 | [ ] | None | DOCS-001 |
| DOCS-004 | Add authentication documentation to `swagger.json` (JWT Bearer + x-api-key) | P1 | [ ] | None | DOCS-001 |

---

## SDK Documentation

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| DOCS-005 | Write Express SDK README — installation, quickstart, API reference, examples | P1 | [ ] | SDK-005 | None |
| DOCS-006 | Write Go SDK README — `go get`, quickstart, API reference, examples | P1 | [ ] | SDK-009 | None |
| DOCS-007 | Write Python SDK README — pip install, quickstart, API reference, examples | P1 | [ ] | SDK-013 | None |
| DOCS-008 | Create SDK comparison page — side-by-side examples for Express/Go/Python | P2 | [ ] | DOCS-005, DOCS-006, DOCS-007 | None |

---

## Developer Documentation (Nextra)

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| DOCS-009 | Create "Getting Started" guide — create account, create org, create project, create app, get API key | P1 | [ ] | None | None |
| DOCS-010 | Create "Instrument Your App" guide — Express, Go, Python quickstarts | P1 | [ ] | DOCS-005, DOCS-006, DOCS-007 | None |
| DOCS-011 | Create "Dashboard Guide" — navigating orgs, projects, apps, observability | P2 | [ ] | FE tasks | None |
| DOCS-012 | Create "DeployX CLI" guide — install, init, push, all commands | P2 | [ ] | SDK-025, SDK-026, SDK-027 | None |
| DOCS-013 | Create "AI Gateway" guide — create tenant, upload docs | P2 | [ ] | None | None |
| DOCS-014 | Create "API Keys" guide — generate, use, revoke | P2 | [ ] | None | None |

---

## Community

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| DOCS-015 | Update `Upblit/Community/` static page with current product information | P3 | [ ] | None | None |
| DOCS-016 | Add contributing guide to main `Upblit/` repository | P2 | [ ] | None | None |
| DOCS-017 | Add `CHANGELOG.md` to each SDK | P2 | [ ] | None | None |
