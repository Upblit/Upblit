# [Upblit](https://upblit.dev) : Centralized Observability Platform 

<p align="center">
  <img src="https://github.com/user-attachments/assets/73d51355-65f5-426d-b8f0-c268222da66c" width="2048" height="1152" alt="Upblit Banner">
</p>

<p align="center">
  <em>Open-source Observability Platform - Built with Java, Go, Next.js & Node.js.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/Debashismitra01/Upblit?style=for-the-badge&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/Debashismitra01/Upblit?style=for-the-badge&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/issues/Debashismitra01/Upblit?style=for-the-badge&color=orange" alt="Issues">
  <img src="https://img.shields.io/github/license/Debashismitra01/Upblit?style=for-the-badge&color=success" alt="License">
</p>

---

##  What is Upblit?

**Upblit** is an open-source **observability platform** that gives developers full visibility into their applications — traces, logs, metrics, and uptime — all in one place.

Instrument your app with one of the SDKs, point it at the ingestor, and get a live view of what's happening inside your services.

>  **Instrument → Ingest → Analyze → Alert**
> All in one platform. No proprietary lock-in.

---

##  Architecture

| Component | Language | Description |
|---|---|---|
|  **Backend** | Java + Spring Boot | REST API, auth, org/project management, uptime CRUD, telemetry query layer |
|  **Dashboard** | Next.js (TypeScript) | UI for traces, logs, metrics, monitors, and settings |
|  **Ingestor** | Go + Gin | Receives traces and logs via HTTP, publishes to Kafka, stores in MongoDB |
|  **Pinger** | Go | Polls uptime monitors every 30 seconds, writes results to MongoDB |
|  **Status Gate** | Next.js | Public status page for your services |
|  **SDKs** | JS/Go/Python | Middleware libraries to instrument your apps |
|  **Email** | Node.js | Transactional email sender (onboarding, verification, invites) |

---

##  Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=java,maven,go,nextjs,docker,kafka,mongodb,postgres,linux,git,github" alt="Tech Stack" />
</p>

- **Backend:** Java 21 + Spring Boot, Spring Security, JWT/OAuth2, PostgreSQL, MongoDB
- **Dashboard:** Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Ingestor:** Go, Gin, Kafka, NATS, MongoDB
- **Pinger:** Go, PostgreSQL, MongoDB
- **SDKs:** JavaScript (Express), Go, Python
- **Infrastructure:** Docker, docker-compose, Prometheus, Logstash, Filebeat

---

##  How It Works

```
Your App (instrumented with an Upblit SDK)
      │
      │  POST /ingest/traces
      │  POST /ingest/logs
      ▼
  [ Ingestor :9000 ]  ──Kafka──▶  Workers  ──▶  MongoDB
                                                   │
  [ Pinger :8085 ]  ──polls uptime──▶  MongoDB     │
                                                   │
  [ Backend :8080 ]  ◀──────── queries ────────────┘
      │
      ▼
  [ Dashboard :3000 ]  ──  view traces, logs, metrics, uptime
```

---

## 📦 SDKs

Upblit provides drop-in middleware for your existing stack:

| SDK | Location | What it does |
|---|---|---|
| **Express** | `sdk/express-sdk/` | Traces HTTP requests, batches and sends spans to the ingestor |
| **Go** | `sdk/go-sdk/` | Middleware for HTTP tracing, context propagation, span helpers |
| **Python** | `sdk/python-sdk/` | Middleware, transport layer, and trace types for Python apps |

---

##  Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- Go 1.21+
- Docker + Docker Compose
- Kafka (or use the provided compose stack)
- MongoDB + PostgreSQL

### Infrastructure

Spin up Kafka, MongoDB, PostgreSQL, and supporting services:

```bash
cd infrastructure
docker compose -f docker-compose.infra.yml up -d
```

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Ingestor

```bash
cd ingestor
go run main.go
```

Runs on `:9000`. Requires `MONGO_URI`, `KAFKAADR`, and optionally `NATS_URL` in `.env`.

### Pinger

```bash
cd pinger
go run ./cmd/upblitpinger
```

Runs on `:8085`. Requires `POSTGRES_URL` and `MONGODB_URI`.

### Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Status Page

```bash
cd status-gate
npm install
npm run dev
```

### CLI

```bash
cd UpblitCLI
go build -o upblit .

./upblit login
./upblit org list
```

---

##  Contributing

Contributions are highly appreciated!
We're part of **Hacktoberfest 2025**, so PRs with the `hacktoberfest` label count toward your badge 🎉

**Ways to contribute:**

-  Fix bugs and improve existing features
-  Add new SDK integrations or improve existing ones
-  Build new dashboard views or charts
-  Improve documentation or write tutorials
-  Extend alerting and notification channels

Read [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

##  Upblit Contributor Badge

Earn the `Upblit Contributor` badge by:

1. Submitting a meaningful PR that gets merged 
2. Following contribution and code standards 
3. Helping make observability smarter 
4. No spammy PRs — quality > quantity 

---

## 🪪 License

This project is licensed under the **Apache License 2.0**.
See [LICENSE](LICENSE) for details.

---

##  Code of Conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md) to ensure a respectful, harassment-free space.

---

##  Connect

<p align="center">
  <a href="https://github.com/Debashismitra01">
    <img src="https://img.shields.io/badge/GitHub-Debashismitra01-black?style=for-the-badge&logo=github" />
  </a>
  <a href="mailto:mdebashis268@gmail.com">
    <img src="https://img.shields.io/badge/Email-Contact-blue?style=for-the-badge&logo=gmail" />
  </a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,100:302b63&height=100&section=footer"/>
</p>

<p align="center">
  <em>"Built with Passion and a cup of coffee" </em>
</p>

