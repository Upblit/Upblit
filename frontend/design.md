# Upblit Frontend — Design & Implementation Plan

> This document is the single source of truth for agents working on this codebase.
> Read it fully before touching any file. Each section maps directly to a task an agent can execute independently.

---

## Project Overview

**Upblit** is an observability/monitoring platform. Users belong to Organizations, create Projects inside them, register Applications per project, ingest logs and telemetry from those applications, and use an AI assistant backed by uploaded docs.

**Stack**
- Next.js 16.2.4 (App Router) — read `node_modules/next/dist/docs/` before writing any Next.js code
- React 19
- TypeScript 5
- Tailwind CSS v4 + shadcn/ui components (already installed in `components/ui/`)
- Zustand 5 for global state
- `jwt-decode` for token parsing
- Backend: Spring Boot REST API at `http://localhost:8080` (see `Swahher.json` for full OpenAPI spec)

**Design language**
- Dark-first UI. Background `#0a0a0a`, cards `#111111`, borders `white/[0.08]`
- Accent blue: `#118896` / `#07a1c1`
- Font: Space Grotesk (headings), Raleway (body)
- All new pages must follow the existing dashboard aesthetic

---

## Current State (already built)

| File | Status |
|---|---|
| `app/layout.tsx` | ✅ Done — fonts, ThemeProvider, TooltipProvider, AuthInitializer |
| `app/page.tsx` | ⚠️ Stub — navbar shell only, empty nav items |
| `app/dashboard/page.tsx` | ✅ Done — project grid UI with hardcoded data |
| `components/app-sidebar.tsx` | ⚠️ Hardcoded teams, needs real org data |
| `components/auth-initializer.tsx` | ⚠️ Uses hardcoded JWT — needs real OAuth |
| `components/nav-main.tsx` | ⚠️ Missing collapsible sub-items for Settings |
| `components/nav-user.tsx` | ✅ Done |
| `components/team-switcher.tsx` | ⚠️ Hardcoded teams + stray `/` rendering bug |
| `hooks/use-userData.ts` | ✅ Done — Zustand store, JWT decode |
| `lib/utils.ts` | ✅ Done |

---

## Known Bugs to Fix (do these first)

### BUG-1 — Stray slash in TeamSwitcher
**File:** `components/team-switcher.tsx`  
**Problem:** There is a literal `/` character between the `<img>` tag and the icon `<div>` that renders visibly in the UI.  
**Fix:** Remove the `/` between `<img src="/logo.png" ... />` and the next `<div>`.

### BUG-2 — NavMain missing collapsible sub-items
**File:** `components/nav-main.tsx`  
**Problem:** The `items` type only accepts `title`, `url`, `icon`. The Settings nav item in `app-sidebar.tsx` passes nested `items` (General, Billing, Usage & Limits) but `NavMain` ignores them — they never render.  
**Fix:** Extend the item type to include optional `items: { title: string; url: string }[]`. When present, render a `Collapsible` wrapper using `components/ui/collapsible.tsx` with nested `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` from the sidebar primitives.

### BUG-3 — Landing page is empty
**File:** `app/page.tsx`  
**Problem:** Only renders a navbar div with empty `<li>` elements.  
**Fix:** See Task 1 below.

---

## Environment Setup

### Task 0 — Environment variables & API client

**Files to create:**
- `.env.local`
- `lib/api.ts`

**`.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**`lib/api.ts`** — base fetch wrapper. Must:
1. Read `NEXT_PUBLIC_API_URL` from `process.env`
2. Import `useUserData` store and read `accessToken`
3. Export typed helper functions: `apiGet<T>`, `apiPost<T>`, `apiDelete<T>`
4. Attach `Authorization: Bearer <token>` header on every request when token exists
5. Handle non-2xx responses by throwing an error with the response status and body

```ts
// Shape to implement
export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T>
export async function apiPost<T>(path: string, body?: unknown): Promise<T>
export async function apiPostForm<T>(path: string, formData: FormData): Promise<T>
export async function apiDelete<T>(path: string, params?: Record<string, string | number>): Promise<T>
```

> Note: `apiPostForm` is needed for file upload endpoints (`POST /org`, `POST /ai/docs`).

---

## Data Models (from Swagger `components/schemas`)

Define these in `lib/types.ts`. Do not redefine them elsewhere.

```ts
export type User = {
  id: number;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  lastLogin: string; // ISO datetime
};

export type Organization = {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  createdDate: string; // ISO datetime
  createdBy: User;
  users: User[];
};

export type OrganizationDTO = {
  name: string;
  description: string;
};

export type ApplicationDTO = {
  name: string;
  description: string;
  environment: string;
  organizationId: number;
  projectId: number;
};

export type Logs = {
  id: string;
  projectId: number;
  applicationId: number;
  traceId: string;
  level: string;
  message: string;
  timestamp: string; // ISO datetime
};

export type Event = {
  timestamp: string;
  requestMethod: string;
  requestURL: string;
  responseStatus: string;
  traceId: string;
  spanId: string;
  duration: string;
  parentSpanId: string;
  applicationId: number;
};

export type Telemetry = {
  id: string;
  projectId: number;
  applicationId: number;
  traceId: string;
  timestamp: string;
  telemetry: Event[];
};

export type TenantDTO = {
  name: string;
  organizationId: number;
};
```

---

## Zustand Stores

### Existing: `hooks/use-userData.ts`
Already handles user + accessToken. Do not modify the shape — only extend if needed.

### New: `hooks/use-org.ts`
```ts
type OrgState = {
  orgs: Organization[];
  activeOrgId: number | null;
  setOrgs: (orgs: Organization[]) => void;
  setActiveOrg: (id: number) => void;
};
```

### New: `hooks/use-projects.ts`
```ts
type ProjectState = {
  projects: Record<number, unknown[]>; // keyed by orgId
  setProjects: (orgId: number, projects: unknown[]) => void;
};
```

> The backend returns `type: object` for project responses — use `unknown[]` until the backend schema is finalized, then narrow the type.

---

## Page & Route Map

```
/                          → Landing page (Task 1)
/dashboard                 → Projects list (Task 2 — currently hardcoded)
/dashboard/[projectId]     → Project detail + Applications list (Task 3)
/dashboard/[projectId]/[applicationId]  → App detail + Logs + Telemetry (Task 4)
/settings                  → Settings shell (Task 5)
/settings/general          → General settings
/settings/billing          → Billing
/settings/limits           → Usage & Limits
```

---

## Tasks

---

### Task 1 — Landing Page (`app/page.tsx`)

**Goal:** Replace the stub with a proper marketing/login landing page.

**Requirements:**
- Full-width dark layout matching the dashboard aesthetic (`bg-[#0a0a0a]`)
- Top navbar with logo (`/logo.png`, width 120) and a "Sign in with GitHub" button on the right
- Hero section: headline, subheadline, CTA button that links to the GitHub OAuth URL
- The GitHub OAuth URL is `http://localhost:8080/oauth2/authorization/github` (standard Spring Security OAuth2 path — confirm with backend if different)
- Below the hero: three feature cards (Logs, Telemetry, AI Docs) with brief descriptions
- Footer with copyright

**No auth logic needed here** — clicking "Sign in" just navigates to the backend OAuth URL. The backend will redirect back to the frontend after auth.

---

### Task 2 — Wire Dashboard to Real API

**File:** `app/dashboard/page.tsx`

**Goal:** Replace hardcoded `projects` array and hardcoded `teams` in `app-sidebar.tsx` with live API data.

**Steps:**

1. On mount, call `GET /org` → populate `use-org` store with the list of organizations
2. `TeamSwitcher` reads from `use-org` store instead of the hardcoded `data.teams` array
   - Map `Organization` → `{ name: org.name, logo: <img src={org.logoUrl} />, plan: org.description }`
   - When user switches team, call `setActiveOrg(org.id)`
3. When `activeOrgId` changes, call `GET /project?OrganizationId={activeOrgId}` → update `use-projects` store
4. Dashboard project grid reads from `use-projects` store
5. Show a loading skeleton (use `components/ui/skeleton.tsx`) while fetching
6. Show an empty state ("No projects yet. Create one.") when the list is empty
7. "New project" button opens a modal/sheet:
   - Single text input: Project name (the body is `type: string` per the Swagger)
   - On submit: `POST /project?OrganizationId={activeOrgId}` with the name as a JSON string body
   - On success: refetch projects and close modal
   - Use `components/ui/sheet.tsx` for the slide-in panel

**API calls:**
```
GET  /org                              → list orgs
GET  /project?OrganizationId={id}      → list projects for active org
POST /project?OrganizationId={id}      body: "project name" (JSON string)
```

---

### Task 3 — Project Detail Page + Applications

**File to create:** `app/dashboard/[projectId]/page.tsx`

**Goal:** Clicking a project card navigates to this page. Shows the project's applications.

**Layout:** Reuse the same `SidebarProvider` + `AppSidebar` + `SidebarInset` shell from the dashboard page.

**Breadcrumb:** `Projects > {projectName}`

**Content:**
- Page title: project name
- Same toolbar pattern as dashboard (search, sort, grid/list toggle, "New application" button)
- Application cards grid — each card shows:
  - `name`
  - `environment` badge (e.g. "production", "staging") — color-code: production = red/destructive, staging = yellow, development = green
  - `description`
  - A "Generate API Key" button (calls `POST /apikey?ApplicationId={id}`, displays the returned key in a copy-to-clipboard dialog)
  - Click card body → navigate to `/dashboard/[projectId]/[applicationId]`
- "New application" button opens a sheet with a form:
  - Fields: name (text), description (text), environment (select: production / staging / development)
  - Hidden fields auto-filled: `organizationId` from active org, `projectId` from URL param
  - On submit: `POST /applications` with `ApplicationDTO` body
  - On success: refetch applications

**API calls:**
```
GET  /applications?projectId={id}      → list applications
POST /applications                     body: ApplicationDTO
POST /apikey?ApplicationId={id}        → generate API key (returns string key)
```

---

### Task 4 — Application Detail: Logs & Telemetry

**File to create:** `app/dashboard/[projectId]/[applicationId]/page.tsx`

**Goal:** Show logs and telemetry for a specific application.

**Layout:** Same sidebar shell. Breadcrumb: `Projects > {projectName} > {appName}`

**Tabs:** Two tabs — "Logs" and "Telemetry" — using a simple tab UI (can be built with plain buttons + conditional render, no extra library needed).

#### Logs Tab
- Fetch `GET /logs/project?id={projectId}` on mount, filter client-side by `applicationId`
- Table columns: Timestamp, Level, Message, TraceId
- Level badge colors: ERROR = red, WARN = yellow, INFO = blue, DEBUG = gray
- Auto-refresh every 30 seconds (use `setInterval` in a `useEffect`, clear on unmount)
- Filter bar: filter by log level (All / ERROR / WARN / INFO / DEBUG)

#### Telemetry Tab
- Fetch `GET /ingest/telemetry` on mount (note: this endpoint returns a plain string per the Swagger — render as-is or parse if JSON)
- For each `Telemetry` record, show a trace row: traceId, timestamp, applicationId
- Expanding a row shows the `Event[]` array as a span timeline table:
  - Columns: Span ID, Parent Span ID, Method, URL, Status, Duration
- Use a simple accordion pattern (toggle `open` state per row)

**API calls:**
```
GET  /logs/project?id={projectId}      → array of Telemetry (used for logs tab)
GET  /ingest/telemetry                 → telemetry data
```

---

### Task 5 — Settings Pages

**Files to create:**
- `app/settings/layout.tsx`
- `app/settings/general/page.tsx`
- `app/settings/billing/page.tsx`
- `app/settings/limits/page.tsx`

**Goal:** Stub pages with the correct layout. Full functionality is out of scope for now.

**`app/settings/layout.tsx`:** Wrap with `SidebarProvider` + `AppSidebar` + `SidebarInset`. This layout is shared by all settings sub-pages.

**`app/settings/general/page.tsx`:**
- Organization name edit form (text input + save button) — calls `POST /org` with updated `OrganizationDTO` and logo upload
- Logo upload: file input (accepts image/*), previews the selected image before upload
- Danger zone: "Delete Organization" button (disabled for now, just show it grayed out)

**`app/settings/billing/page.tsx`:** Placeholder card — "Billing coming soon."

**`app/settings/limits/page.tsx`:** Placeholder card — "Usage & Limits coming soon."

---

### Task 6 — AI Docs Feature

**Files to create:** `app/dashboard/[projectId]/ai/page.tsx`

**Goal:** Allow users to upload documents for the AI assistant and manage them.

**Add to sidebar nav** (in `app-sidebar.tsx`): Add a "AI Docs" nav item under each project, or as a top-level item with a `BotIcon`.

**Page content:**
- Section: "Upload Document"
  - File input (accepts PDF, DOCX, TXT)
  - "Tenant" selector — on mount fetch or create a tenant via `POST /ai/tenant` with `{ name: orgName, organizationId: activeOrgId }`
  - Upload button → `POST /ai/docs?TenantId={tenantId}` with `multipart/form-data` containing the file
  - Show upload progress (use a simple state: idle / uploading / success / error)
- Section: "Uploaded Documents"
  - List of uploaded docs (no GET endpoint exists in the Swagger — show optimistic list from successful uploads in session, or leave as TODO)
  - Each doc has a "Delete" button → `DELETE /ai/docs?docs_id={id}`

**API calls:**
```
POST /ai/tenant                        body: TenantDTO
POST /ai/docs?TenantId={id}            body: multipart file
DELETE /ai/docs?docs_id={id}
```

---

### Task 7 — Auth: Replace Hardcoded Token

**File:** `components/auth-initializer.tsx`

**Goal:** Replace the hardcoded JWT with real GitHub OAuth flow.

**How it works:**
1. On app load, `AuthInitializer` checks for a `token` query param in the URL (the backend redirects to `/?token=<jwt>` after OAuth)
2. If found: call `setToken(token)`, then remove the param from the URL using `router.replace` (clean URL)
3. If not found: check `localStorage` for a previously stored token, validate it isn't expired (check `exp` field from decoded JWT vs `Date.now() / 1000`), and call `setToken` if valid
4. If neither: user is unauthenticated — redirect to `/` (landing page)
5. On `logout`: clear `localStorage`, call `useUserData.logout()`, redirect to `/`

**Token refresh:**
- Before any API call, check if the token expires within 5 minutes
- If so, call `GET /auth/refresh?refreshToken={token}` and update the store with the new token
- The refresh logic should live in `lib/api.ts` as a pre-request interceptor

**Storage:** Use `localStorage` key `upblit_token`.

---

## Component Conventions

- All page-level components are `"use client"` since they use hooks and interactivity
- Server components are only used for static/layout files with no hooks
- All forms use controlled inputs with `useState` — no form library needed for now
- Loading states: always show `Skeleton` from `components/ui/skeleton.tsx`
- Error states: show a simple red text message below the relevant section
- Modals/panels: use `Sheet` from `components/ui/sheet.tsx` (slide-in from right)
- Confirmation dialogs: use a simple inline confirmation pattern (show "Are you sure? Yes / Cancel" inline) — no dialog component needed

---

## File Structure (target state)

```
app/
  page.tsx                          ← Task 1
  layout.tsx                        ← ✅ done
  globals.css                       ← ✅ done
  dashboard/
    page.tsx                        ← Task 2
    [projectId]/
      page.tsx                      ← Task 3
      ai/
        page.tsx                    ← Task 6
      [applicationId]/
        page.tsx                    ← Task 4
  settings/
    layout.tsx                      ← Task 5
    general/page.tsx                ← Task 5
    billing/page.tsx                ← Task 5
    limits/page.tsx                 ← Task 5

components/
  app-sidebar.tsx                   ← update in Task 2
  auth-initializer.tsx              ← Task 7
  nav-main.tsx                      ← fix BUG-2
  team-switcher.tsx                 ← fix BUG-1

hooks/
  use-userData.ts                   ← ✅ done
  use-org.ts                        ← Task 0
  use-projects.ts                   ← Task 0

lib/
  utils.ts                          ← ✅ done
  api.ts                            ← Task 0
  types.ts                          ← Task 0
```

---

## API Reference Summary

| Method | Path | Query Params | Body | Used In |
|--------|------|-------------|------|---------|
| GET | `/org` | — | — | Task 2 |
| POST | `/org` | `orgDTO` (OrganizationDTO) | multipart file | Task 5 |
| GET | `/project` | `OrganizationId` | — | Task 2 |
| POST | `/project` | `OrganizationId` | `string` (project name) | Task 2 |
| GET | `/project/id` | `OrganizationId` | `int64` (project id) | Task 3 |
| GET | `/applications` | `projectId` | — | Task 3 |
| POST | `/applications` | — | `ApplicationDTO` | Task 3 |
| POST | `/apikey` | `ApplicationId` | — | Task 3 |
| GET | `/logs` | `id` (user id) | — | Task 4 |
| GET | `/logs/project` | `id` (project id) | — | Task 4 |
| POST | `/ingest/logs` | — | `Logs` | SDK (not frontend) |
| GET | `/ingest/telemetry` | — | — | Task 4 |
| POST | `/ai/tenant` | — | `TenantDTO` | Task 6 |
| POST | `/ai/docs` | `TenantId` | multipart file | Task 6 |
| DELETE | `/ai/docs` | `docs_id` | — | Task 6 |
| GET | `/auth/refresh` | `refreshToken` | — | Task 7 |
| GET | `/User` | `username` | — | Task 7 |
| POST | `/User` | — | `User` | Task 7 |
| GET | `/token` | — | — | Task 7 |

---

## Order of Execution

Agents should work in this order to avoid blockers:

1. **Task 0** — `lib/types.ts`, `lib/api.ts`, `.env.local`, `hooks/use-org.ts`, `hooks/use-projects.ts`
2. **BUG-1, BUG-2, BUG-3** — quick fixes, unblock visual correctness
3. **Task 1** — landing page (no API dependency)
4. **Task 2** — wire dashboard to API (depends on Task 0)
5. **Task 3** — project detail + applications (depends on Task 2)
6. **Task 4** — logs & telemetry (depends on Task 3)
7. **Task 5** — settings pages (depends on Task 0)
8. **Task 6** — AI docs (depends on Task 0)
9. **Task 7** — real auth (depends on all other tasks being stable)
