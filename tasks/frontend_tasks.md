# Frontend Tasks

> Owner: COPILOT
> Scope: `Upblit/frontend/`
> Reference: `frontend/agents/design.md`, `frontend/agents/requirements.md`, `frontend/agents/tasks.md`

---

## Foundation

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-001 | Create `src/app/dashboard/layout.tsx` — persistent shell with auth guard, sidebar slot, header slot | P1 | [ ] | None | FE-002, FE-003 |
| FE-002 | Create `Sidebar` component — nav items, active route highlight, collapse to icon-only below 768px (framer-motion) | P1 | [ ] | None | None |
| FE-003 | Update `DashboardHeader` — fetch user from `GET /User?username=`, show avatar, add logout dropdown | P1 | [ ] | BE-007 | None |
| FE-004 | Update `src/app/dashboard/page.tsx` — redirect to `/dashboard/orgs` | P1 | [ ] | None | None |

---

## Organization Management

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-005 | Create `/dashboard/orgs/page.tsx` — fetch `GET /org`, render OrgCard grid, loading skeleton, empty state | P1 | [ ] | None | FE-001, FE-006 |
| FE-006 | Create `OrgCard` component — logo (next/image), name, description, member count, link to projects | P1 | [ ] | None | None |
| FE-007 | Create `CreateOrgModal` — name, description, file upload; client-side validation; calls `POST /org`; framer-motion animation | P1 | [ ] | None | FE-005 |

---

## Project Management

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-008 | Create `/dashboard/orgs/[orgId]/projects/page.tsx` — fetch `GET /project?OrganizationId={orgId}`, project cards, client-side search, empty state | P1 | [ ] | None | FE-001 |
| FE-009 | Update `ProjectCard` — accept `orgId` prop, link to `/dashboard/orgs/[orgId]/projects/[projectId]/apps` | P1 | [ ] | None | FE-008 |
| FE-010 | Add inline "New Project" form to projects page — name field, calls `POST /project?OrganizationId={orgId}` | P1 | [ ] | None | FE-008 |

---

## Application Management

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-011 | Create `/dashboard/orgs/[orgId]/projects/[projectId]/apps/page.tsx` — fetch `GET /applications?projectId={id}`, ApplicationCard grid, empty state | P1 | [ ] | None | FE-001 |
| FE-012 | Create `ApplicationCard` — name, description, environment badge (production=red, staging=yellow, development=green), "Generate API Key" button | P1 | [ ] | None | FE-011 |
| FE-013 | Create `ApiKeyModal` — monospace key display, copy-to-clipboard (Copy→Check icon, 2s), clear state on close, one-time warning | P1 | [ ] | None | FE-012 |
| FE-014 | Add "New Application" modal — name, description, environment select; calls `POST /applications` with orgId + projectId from route | P1 | [ ] | None | FE-011 |

---

## Observability

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-015 | Create `/dashboard/orgs/[orgId]/projects/[projectId]/observability/page.tsx` — parallel fetch telemetry + logs, tabbed view | P1 | [ ] | None | FE-001, FE-016, FE-017 |
| FE-016 | Create `TelemetryTable` — columns: Trace ID, Application, Timestamp, Span Count; expandable rows with EventRow per span; application filter | P1 | [ ] | None | None |
| FE-017 | Create `LogsTable` — columns: Timestamp, Level badge, Message, Trace ID; level pill toggles; search input; virtual scroll for >100 rows | P1 | [ ] | None | None |

---

## AI Gateway

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-018 | Create `/dashboard/ai-gateway/page.tsx` — tenant list (local state), create tenant form, per-tenant doc upload | P2 | [ ] | None | FE-001 |
| FE-019 | Implement tenant creation — calls `POST /ai/tenant`, appends to local list | P2 | [ ] | None | FE-018 |
| FE-020 | Implement doc upload — calls `POST /ai/docs?TenantId={id}`, framer-motion progress bar, success/error toast | P2 | [ ] | None | FE-018, FE-021 |

---

## User Profile

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-021 | Create `/dashboard/profile/page.tsx` — read username from localStorage, fetch `GET /User?username=`, display avatar/username/email/GitHub ID/last login | P2 | [ ] | BE-007 | FE-001 |

---

## Toast System

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-022 | Create `Toast` component — bottom-right, framer-motion slide-in/out, auto-dismiss 4s, success/error variants | P1 | [ ] | None | None |
| FE-023 | Create `useToast` hook — trigger toasts from any component | P1 | [ ] | None | FE-022 |

---

## Quality & Testing

| ID | Task | Priority | Status | Blockers | Dependencies |
|---|---|---|---|---|---|
| FE-024 | Run `npm run build` and resolve all TypeScript/lint errors | P1 | [ ] | None | All FE tasks |
| FE-025 | Set up MSW (Mock Service Worker) for API mocking in tests | P2 | [ ] | None | None |
| FE-026 | Write unit tests for `filterLogs` utility function | P2 | [ ] | None | None |
| FE-027 | Write integration tests for org → project → app navigation flow | P2 | [ ] | FE-025 | FE-005 through FE-014 |
| FE-028 | Verify auth guard: `/dashboard/*` without token redirects to `/login` | P1 | [ ] | None | FE-001 |
| FE-029 | Verify API key modal clears state on close | P1 | [ ] | None | FE-013 |
