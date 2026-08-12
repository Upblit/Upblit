# [Upblit](https://upblit.dev) : `Think.Build.Deploy.Scale🧠`


<p align="center">

  <img src="https://github.com/user-attachments/assets/afe6181b-af66-4b3b-8d4e-eeb0d7c5f941" width="2048" height="1152" alt="Upblit Banner">
</p>

<p align="center">
  <em>Agentic Auto-Deployment Platform — Built with Java, Maven, Next.js & Go.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/Debashismitra01/Upblit?style=for-the-badge&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/Debashismitra01/Upblit?style=for-the-badge&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/issues/Debashismitra01/Upblit?style=for-the-badge&color=orange" alt="Issues">
  <img src="https://img.shields.io/github/license/Debashismitra01/Upblit?style=for-the-badge&color=success" alt="License">
</p>

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:0f0c29,100:302b63&height=2"/>
</p>

## 🧠 What is Upblit?

> 🔭 **Note:** Upblit is now focused purely on **observability** — monitoring, logging, and tracing for modern applications.

**Upblit** is an open-source **auto-deployment and build orchestration system** — built to simplify **modern fullstack deployment** using Java, Maven, and Go.  
It’s like Devops-team, but open, agentic, and customizable — empowering teams to deploy web apps, microservices, and AI models with zero manual ops.

> ⚙️ **Code → Build → Deploy → Scale**  
> All automated. All from your repo.

---

## 🧩 Core Architecture

| Component | Description |
|------------|-------------|
| 🖥️ **Backend (Java + Maven)** | Handles builds, environments, deploy triggers, and logs. |
| 🌐 **Frontend (Next.js)** | A dashboard for managing projects, deployments, and insights. |
| 💻 **CLI (Go)** | Command-line access to deploy, monitor, and interact with Upblit APIs. |
| 🧠 **Agentic Core (WIP)** | An AI-powered orchestrator for smart build predictions and scaling. |

---

## ⚙️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=java,maven,go,azure,nextjs,docker,kubernetes,postgres,linux,git,github" alt="Tech Stack" />
</p>

- **Backend:** Java + Maven (Spring Boot)
- **Frontend:** Next.js (TypeScript)
- **CLI:** Go
- **Containerization:** Docker, Kubernetes
- **Database:** PostgreSQL

---

## 🚀 Getting Started

### 🧰 Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+
- Docker
- Git

### ⚡ Setup

```bash
# Clone the repository
git clone https://github.com/Debashismitra01/Upblit.git
cd Upblit
````

#### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** to see the dashboard.

#### CLI

Build the `upblit` CLI (Go) and use it to authenticate, select orgs/projects/apps, generate API keys, and query recent telemetry:

```bash
cd Upblit/UpblitCLI
go build -o upblit .

# Login via browser
./upblit login

# List organizations
./upblit org list

# Create an app (requires a selected project)
./upblit app create my-service --env staging -d "Description"
```

---

---

## 🧑‍💻 Contributing

Contributions are highly appreciated!
We’re part of **Hacktoberfest 2025**, so PRs with the `hacktoberfest` label count toward your badge 🎉

**Ways to contribute:**

* 🐞 Fix bugs & enhance features
* 🚀 Add new deployment strategies
* 📖 Improve documentation or write tutorials
* 🧩 Extend CLI or Java module integrations

Read [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 🏆 Upblit Contributor Badge

Earn the `Upblit Contributor` badge by:

1. Submitting a meaningful PR that gets merged 🧩
2. Following contribution and code standards 🧠
3. Helping make deployments smarter 🚀
4. 🧰 No spammy PRs — quality > quantity 😎

---

## 🪪 License

This project is licensed under the **Apache License 2.0**.
See [LICENSE](LICENSE) for details.

---

## 💬 Code of Conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md) to ensure a respectful, harassment-free space.

---

## 🌐 Connect

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
  <em>“Deploy beyond limits — Upblit automates your journey from code to cloud.” </em> <img width="20" height="20" alt="imageedit_1_8143812801" src="https://github.com/user-attachments/assets/4fae4dc7-2d85-4fdf-ba40-0a48512bd020" />
</p>
