# Upblit Frontend — Task Tracker

> Agents: pick a task, mark it `[ IN PROGRESS ]`, complete it, mark it `[x]`.
> Never start a task whose dependencies are not `[x]`.
> Full implementation details for every task are in `design.md`.

---

## Status Legend

```
[ ] Not started
[~] In progress
[x] Done
[!] Blocked
```

---

## Bugs (fix before anything else)

| ID | Status | File | Description |
|----|--------|------|-------------|
| BUG-1 | [ ] | `components/team-switcher.tsx` | Stray `/` character renders visibly between logo and icon div |
| BUG-2 | [ ] | `components/nav-main.tsx` | Settings sub-items (General, Billing, Limits) never render — collapsible not implemented |
| BUG-3 | [ ] | `app/page.tsx` | Landing page is an empty stub with no content |

---

## Task 0 — Foundation

**Status:** [ ]  
**Depends on:** nothing  
**Must be done before:** Tasks 1–7

### Subtasks

- [x] **T0-A** Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8080`
- [x] **T0-B** Create `lib/types.ts` — all data models from Swagger schemas (`User`, `Organization`, `OrganizationDTO`, `ApplicationDTO`, `Logs`, `Event`, `Telemetry`, `TenantDTO`)
- [x] **T0-C** Create `lib/api.ts` — base fetch wrapper with `apiGet`, `apiPost`, `apiPostForm`, `apiDelete`, auth header injection
- [x] **T0-D** Create `hooks/use-org.ts` — Zustand store for orgs list + active org ID
- [x] **T0-E** Create `hooks/use-projects.ts` — Zustand store for projects keyed by org ID

---

## Task 1 — Landing Page

**Status:** [ ]  
**Depends on:** nothing (T0 not required)  
**Blocks:** nothing

### Subtasks

- [ ] **T1-A** Replace `app/page.tsx` with full dark landing page layout
- [ ] **T1-B** Top navbar — logo (`/logo.png`) + "Sign in with GitHub" button linking to `http://localhost:8080/oauth2/authorization/github`
- [ ] **T1-C** Hero section — headline, subheadline, CTA button
- [ ] **T1-D** Three feature cards below hero — Logs, Telemetry, AI Docs
- [ ] **T1-E** Footer with copyright

---

## Task 2 — Wire Dashboard to Real API

**Status:** [ ]  
**Depends on:** T0-A, T0-B, T0-C, T0-D, T0-E  
**Blocks:** Task 3

### Subtasks

- [x] **T2-A** Fetch `GET /org` on dashboard mount → populate `use-org` store
- [x] **T2-B** Update `components/team-switcher.tsx` to read from `use-org` store (remove hardcoded teams)
- [x] **T2-C** Update `components/app-sidebar.tsx` to pass org data from store to `TeamSwitcher`
- [x] **T2-D** Fetch `GET /project?OrganizationId={id}` when active org changes → populate `use-projects` store
- [x] **T2-E** Replace hardcoded `projects` array in `app/dashboard/page.tsx` with store data
- [x] **T2-F** Add loading skeleton while fetching (use `components/ui/skeleton.tsx`)
- [x] **T2-G** Add empty state UI when project list is empty
- [x] **T2-H** Wire "New project" button → Sheet panel with project name input
- [x] **T2-I** On sheet submit: `POST /project?OrganizationId={id}` → refetch projects → close sheet

---

## Task 3 — Project Detail Page + Applications

**Status:** [ ]  
**Depends on:** Task 2  
**Blocks:** Task 4, Task 6

### Subtasks

- [ ] **T3-A** Create `app/dashboard/[projectId]/page.tsx` with sidebar shell + breadcrumb
- [ ] **T3-B** Fetch `GET /applications?projectId={id}` on mount
- [ ] **T3-C** Render application cards grid (name, environment badge, description)
- [ ] **T3-D** Environment badge color-coding: production = red, staging = yellow, development = green
- [ ] **T3-E** "Generate API Key" button per card → `POST /apikey?ApplicationId={id}` → show key in copy-to-clipboard dialog
- [ ] **T3-F** Click card body → navigate to `/dashboard/[projectId]/[applicationId]`
- [ ] **T3-G** "New application" button → Sheet with form (name, description, environment select)
- [ ] **T3-H** On sheet submit: `POST /applications` with `ApplicationDTO` → refetch → close sheet
- [ ] **T3-I** Loading skeleton + empty state

---

## Task 4 — Application Detail: Logs & Telemetry

**Status:** [ ]  
**Depends on:** Task 3  
**Blocks:** nothing

### Subtasks

- [ ] **T4-A** Create `app/dashboard/[projectId]/[applicationId]/page.tsx` with sidebar shell + breadcrumb
- [ ] **T4-B** Build tab switcher UI (Logs / Telemetry) — plain buttons + conditional render
- [ ] **T4-C** Logs tab: fetch `GET /logs/project?id={projectId}`, filter by `applicationId`
- [ ] **T4-D** Logs table: columns Timestamp, Level, Message, TraceId
- [ ] **T4-E** Log level badge colors: ERROR = red, WARN = yellow, INFO = blue, DEBUG = gray
- [ ] **T4-F** Log level filter bar (All / ERROR / WARN / INFO / DEBUG)
- [ ] **T4-G** Auto-refresh logs every 30 seconds (`setInterval` in `useEffect`, clear on unmount)
- [ ] **T4-H** Telemetry tab: fetch `GET /ingest/telemetry`
- [ ] **T4-I** Telemetry trace rows: traceId, timestamp, applicationId
- [ ] **T4-J** Expandable rows showing `Event[]` span table (Span ID, Parent Span ID, Method, URL, Status, Duration)
- [ ] **T4-K** Loading skeleton + empty state for both tabs

---

## Task 5 — Settings Pages

**Status:** [ ]  
**Depends on:** T0-A, T0-B, T0-C  
**Blocks:** nothing

### Subtasks

- [ ] **T5-A** Create `app/settings/layout.tsx` — shared sidebar shell for all settings pages
- [ ] **T5-B** Create `app/settings/general/page.tsx` — org name edit form + logo upload with preview
- [ ] **T5-C** Wire general page save → `POST /org` with `OrganizationDTO` + file
- [ ] **T5-D** Danger zone section with disabled "Delete Organization" button
- [ ] **T5-E** Create `app/settings/billing/page.tsx` — placeholder card
- [ ] **T5-F** Create `app/settings/limits/page.tsx` — placeholder card

---

## Task 7 — Real Auth (GitHub OAuth)

**Status:** [ ]  
**Depends on:** Task 1, T0-C (api.ts for refresh interceptor)  
**Blocks:** nothing (but do last — other tasks work with hardcoded token)

### Subtasks

- [ ] **T7-A** Update `components/auth-initializer.tsx` — check URL for `?token=` param on mount
- [ ] **T7-B** If token found: call `setToken`, persist to `localStorage` key `upblit_token`, clean URL with `router.replace`
- [ ] **T7-C** If no URL token: read `localStorage`, validate `exp` vs `Date.now() / 1000`, call `setToken` if valid
- [ ] **T7-D** If no valid token: redirect unauthenticated users to `/`
- [ ] **T7-E** Update `useUserData.logout()` usage in `nav-user.tsx` — clear `localStorage`, redirect to `/`
- [ ] **T7-F** Add token refresh interceptor in `lib/api.ts` — if token expires within 5 min, call `GET /auth/refresh?refreshToken={token}` before the request

---

## Completion Summary

| Task | Subtasks | Done | Progress |
|------|----------|------|----------|
| Bugs | 3 | 0 | 0% |
| Task 0 — Foundation | 5 | 0 | 0% |
| Task 1 — Landing Page | 5 | 0 | 0% |
| Task 2 — Dashboard API | 9 | 0 | 0% |
| Task 3 — Project Detail | 9 | 0 | 0% |
| Task 4 — Logs & Telemetry | 11 | 0 | 0% |
| Task 5 — Settings | 6 | 0 | 0% |
| Task 6 — AI Docs | 8 | 0 | 0% |
| Task 7 — Real Auth | 6 | 0 | 0% |
| **Total** | **62** | **0** | **0%** |

---

## Dependency Graph

```
Task 0 ──────────────────────────────────────────────┐
  ├── Task 1 (no dep, can run in parallel)            │
  ├── Task 2 ──── Task 3 ──── Task 4                  │
  │                    └───── Task 6                  │
  ├── Task 5                                          │
  └── Task 7 (also needs Task 1)                      │
                                                      │
Bugs: fix independently, no dependencies              │
```

---

## Notes for Agents

- Read `design.md` for full implementation details on any task before starting
- Read `Swahher.json` for the complete OpenAPI spec
- Read `node_modules/next/dist/docs/` before writing any Next.js-specific code
- All UI must match the dark aesthetic in `app/dashboard/page.tsx` — use it as the reference
- Do not install new npm packages without checking if the functionality already exists in the current deps
- Current deps available: `zustand`, `jwt-decode`, `lucide-react`, `next-themes`, all `shadcn/ui` components in `components/ui/`
- Mark subtasks `[x]` as you complete them and update the Completion Summary table
