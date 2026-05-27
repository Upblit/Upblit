# AI Gateway Tasks

> Owner: CODEX (backend), COPILOT (frontend)
> Scope: `Upblit/backend/ai/`, `Upblit/frontend/src/app/dashboard/ai-gateway/`

---

## Backend

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| AI-001 | Verify `POST /ai/tenant` creates a tenant scoped to the authenticated user's organization | P1 | [ ] | None | None |
| AI-002 | Implement `GET /ai/tenant?organizationId={id}` — list tenants for an org | P1 | [ ] | None | None |
| AI-003 | Verify `POST /ai/docs?TenantId={id}` validates the tenant belongs to the user's org | P1 | [ ] | None | None |
| AI-004 | Implement `GET /ai/docs?TenantId={id}` — list documents for a tenant | P2 | [ ] | None | None |
| AI-005 | Implement `DELETE /ai/docs/{docId}` — remove a document from a tenant | P2 | [ ] | None | None |
| AI-006 | Document the external AI service integration in `DocsService` and `DocsSender` | P2 | [ ] | None | None |

---

## Frontend

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| AI-007 | Create `/dashboard/ai-gateway/page.tsx` — tenant list, create tenant form, doc upload | P2 | [ ] | AI-002 | FE-001 |
| AI-008 | Implement tenant creation form — name + org selector, calls `POST /ai/tenant` | P2 | [ ] | None | AI-007 |
| AI-009 | Implement tenant list — fetch `GET /ai/tenant?organizationId={id}` | P2 | [ ] | AI-002 | AI-007 |
| AI-010 | Implement doc upload — file picker, calls `POST /ai/docs?TenantId={id}`, progress bar, toast | P2 | [ ] | None | AI-007, FE-022 |
| AI-011 | Implement doc list per tenant — fetch `GET /ai/docs?TenantId={id}` | P3 | [ ] | AI-004 | AI-007 |
| AI-012 | Implement doc delete — calls `DELETE /ai/docs/{docId}`, removes from list | P3 | [ ] | AI-005 | AI-011 |
