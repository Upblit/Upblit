# Task Index

> Master index of all task files in the Upblit engineering workspace.
> Tasks are organized by domain. Each task file defines ownership, priority, blockers, and dependencies.
> Tasks are NOT auto-executed. They require explicit human or agent assignment.

---

## Task Files

| File | Domain | Owner |
|---|---|---|
| `frontend_tasks.md` | Frontend dashboard, UI, design system | COPILOT |
| `backend_tasks.md` | Spring Boot API, database, security | CODEX |
| `sdk_tasks.md` | Multi-language SDKs, CLI | ANTIGRAVITY |
| `docs_tasks.md` | Developer documentation, API reference | ANTIGRAVITY |
| `observability_tasks.md` | Telemetry pipeline, ingest, query | CODEX + ANTIGRAVITY |
| `security_tasks.md` | Auth, RBAC, secrets, API key security | CODEX |
| `infra_tasks.md` | Docker, CI/CD, deployment | CODEX |
| `ai_tasks.md` | AI Gateway, tenant management, docs | CODEX + COPILOT |
| `scaling_tasks.md` | Performance, database indexes, TTL | CODEX |

---

## Priority Levels

| Level | Meaning |
|---|---|
| `P0` | Blocking — system cannot function correctly without this |
| `P1` | Critical — significant gap in functionality or security |
| `P2` | Important — needed for production readiness |
| `P3` | Nice to have — improves DX or quality |

---

## Status Labels

| Status | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |
| `[!]` | Blocked |

---

## Cross-Cutting Tasks

These tasks span multiple domains and require coordination between agents.

| ID | Task | Owners | Priority |
|---|---|---|---|
| CROSS-001 | Standardize ingest URL across all SDKs (`ingest.upblit.com`) | ANTIGRAVITY + CODEX | P1 |
| CROSS-002 | Define and document RBAC roles (admin/member) | CODEX + COPILOT | P1 |
| CROSS-003 | Set up CI/CD pipeline (GitHub Actions) | CODEX | P1 |
| CROSS-004 | Create `docker-compose.yml` for local full-stack development | CODEX | P2 |
| CROSS-005 | Align API endpoint naming to REST conventions | CODEX + COPILOT | P3 |

---

## Recently Completed

None yet — workspace orchestration layer just initialized.

---

## How to Use This Task System

1. Pick a task from the relevant domain file
2. Assign it to an agent or developer
3. Change status from `[ ]` to `[~]` when starting
4. Change status to `[x]` when complete
5. Add blockers as `[!]` with a note explaining what is blocking
6. Update this index when new task files are added
