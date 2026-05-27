# Product Voice

> How Upblit communicates with developers. Use this when writing UI copy, documentation, error messages, CLI output, and marketing content.

---

## Brand Identity

**Upblit** is an open-source, AI-native cloud developer platform. The deployment product is branded **DeployX**.

Core tagline: **"Deploy. Observe. Scale."**

Hero copy (from the live frontend): **"ZERO-CONFIG INFRASTRUCTURE FOR DEVELOPERS"**

Sub-tagline: *"Deploy full-stack apps in seconds with GitHub integration, dynamic subdomains, and zero-config reverse proxying."*

---

## Voice Principles

### 1. Developer-first, not enterprise-first
Write for engineers, not managers. Assume technical literacy. Skip the buzzwords.

**Do**: "Deploy via Git, CLI, or API to VMs, Docker, or Kubernetes clusters"
**Don't**: "Leverage our enterprise-grade cloud orchestration platform"

### 2. Concrete over abstract
Show what the product does, not what it "enables" or "empowers."

**Do**: "Deploy your first project today"
**Don't**: "Unlock the power of cloud-native deployment"

### 3. Confident, not boastful
State facts. Let the product speak.

**Do**: "Precise logging, metrics, alerting, profiles, traces without any code changes"
**Don't**: "The world's best observability platform"

### 4. Friendly CLI tone
CLI output should be human-readable, use emoji sparingly and purposefully.

**Do**: `🔧 Starting DeployX Git init workflow...` / `✅ Deployment pushed to: <url>`
**Don't**: Walls of JSON or cryptic error codes without context

### 5. Error messages are helpful
Error messages should tell the user what went wrong AND what to do next.

**Do**: "Failed to generate API key. Try again or check your application permissions."
**Don't**: "Error 500"

---

## UI Copy Standards

### Buttons
- Primary actions: imperative verb + arrow → `Start Deploying →`, `New Project`, `Generate API Key`
- Secondary actions: noun or verb → `Documentation`, `View Apps`, `Cancel`
- Destructive actions: explicit → `Delete Organization`, `Revoke Key`

### Empty States
- Title: what's missing → `No Projects Found`
- Description: what to do → `Create a project to start deploying applications.`
- Action: clear CTA → `New Project`

### Loading States
- Use skeleton loaders, not spinners, for content areas
- Inline loading for button actions: disable button + show subtle indicator

### Toast Notifications
- Success: past tense → `Email sent`, `API key generated`, `Project created`
- Error: what failed + hint → `Failed to create project. Check your connection and try again.`
- Auto-dismiss: 4 seconds

### Form Validation
- Inline, below the field
- Present tense → `Name is required`, `File must be an image under 5 MB`

---

## Documentation Voice

- Second person (`you`, `your`) — not third person
- Active voice — not passive
- Short sentences — one idea per sentence
- Code examples for every concept
- No "simply", "just", "easy", "trivial" — these are condescending

---

## What to Avoid

| Avoid | Why |
|---|---|
| "Leverage" | Corporate jargon |
| "Seamless" | Meaningless |
| "Best-in-class" | Unverifiable claim |
| "Revolutionary" | Hyperbole |
| "Cutting-edge" | Dated cliché |
| "Empower" | Vague |
| Exclamation marks in errors | Inappropriate tone |
| All-caps outside hero headings | Aggressive |

---

## Feature Names (Canonical)

| Feature | Canonical Name | Notes |
|---|---|---|
| Deployment CLI | DeployX | Not "Upblit CLI" in user-facing copy |
| Observability dashboard | Observability | Not "monitoring", not "APM" |
| Distributed tracing | Traces | Not "spans" in UI (spans are internal) |
| Log viewer | Logs | Simple, direct |
| AI knowledge base | AI Gateway | As used in the frontend nav |
| Organization | Organization | Not "workspace", not "team" |
| Application | Application | Not "service", not "app" in formal copy |
