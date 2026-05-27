# Infrastructure Tasks

> Owner: CODEX
> Scope: Deployment, CI/CD, Docker, containerization
> Reference: `.ai-context/deployment_strategy.md`

---

## CI/CD Pipeline

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| INFRA-001 | Create `.github/workflows/backend-ci.yml` — build, test, lint on PR | P1 | [ ] | None | None |
| INFRA-002 | Create `.github/workflows/frontend-ci.yml` — build, lint, type-check on PR | P1 | [ ] | None | None |
| INFRA-003 | Create `.github/workflows/backend-deploy.yml` — build Docker image, push to registry on merge to main | P1 | [ ] | INFRA-001 | None |
| INFRA-004 | Create `.github/workflows/sdk-publish.yml` — publish Express SDK to npm on tag | P2 | [ ] | None | SDK-005 |
| INFRA-005 | Create `.github/workflows/cli-release.yml` — build Go binary, create GitHub Release on tag | P2 | [ ] | None | None |

---

## Docker

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| INFRA-006 | Create `docker-compose.yml` at `Upblit/` root for local full-stack development | P1 | [ ] | None | INFRA-007 |
| INFRA-007 | Create `Dockerfile` for the email service (`Upblit/email/`) | P1 | [ ] | None | None |
| INFRA-008 | Verify backend `Dockerfile` uses multi-stage build (build stage + runtime stage) | P2 | [ ] | None | None |
| INFRA-009 | Add `.dockerignore` files to backend and email service | P2 | [ ] | None | None |
| INFRA-010 | Add health check instruction to backend `Dockerfile` | P2 | [ ] | BE-022 | None |

---

## Local Development

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| INFRA-011 | Document local development setup in `Upblit/README.md` | P1 | [ ] | None | None |
| INFRA-012 | Create `.env.example` files for backend and email service | P1 | [ ] | None | None |
| INFRA-013 | Verify `docker-compose.yml` starts: backend, email service, PostgreSQL, MongoDB | P1 | [ ] | INFRA-006 | None |

---

## Production Readiness

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| INFRA-014 | Define production environment variable checklist | P1 | [ ] | None | None |
| INFRA-015 | Document rollback procedure for backend deployments | P2 | [ ] | None | None |
| INFRA-016 | Set up container registry (Docker Hub, GitHub Container Registry, or ECR) | P2 | [ ] | None | None |
| INFRA-017 | Evaluate Kubernetes deployment (write manifests only when K8s is confirmed as target) | P3 | [ ] | None | None |
