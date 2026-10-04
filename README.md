<div align="center">

```
╔═══════════════════════════════════════════════════════════╗
║  __ /  __ \  __/   __|  |   /\ \      / /  ____|  __ \  ║
║ | |  | |  | |_    _|    |  /  \ \ /\ / /| |__   | |__) |║
║   |  |    | __\  |      | / /\ \ V  V / |  __|  |  _  / ║
║   |  | |  | |    |____  |/ /  \ \_  _/  | |____ | | \ \ ║
║  _|  |_|  |_|   _______/_/ ___ \|__|  __|______||_|  \_\║
║          |__/                                             ║
╚═══════════════════════════════════════════════════════════╝
```

# 404: LAST REQUEST

**A narrative puzzle game where you debug a broken web app before its final deployment — or it's gone forever.**

<br/>

[![License](https://img.shields.io/badge/license-Educational-blueviolet?style=flat-square)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)
[![Vue](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)](./CONTRIBUTING.md)

<br/>

[**▶ Play Now**](#-getting-started) · [**📖 Docs**](./docs/) · [**🐛 Report Bug**](https://github.com/FerrDxD/last-request/issues) · [**💡 Request Feature**](https://github.com/FerrDxD/last-request/issues)

</div>

---

## 🎮 What Is This?

**404: LAST REQUEST** is a browser-based detective game for developers.

You inherit a web application hours before its final deployment. It looks fine — until it isn't. Somewhere in the code, something is broken. You have the tools. You have the time. You have the skill.

> *"I'm debugging a real application."*

That's the feeling this game is built to give you.

Each **Case** is a self-contained debugging challenge. You'll open the console, inspect network requests, read through source files, and apply patches — just like you would in real development. Except here, the stakes are narrative, the bugs are curated, and the satisfaction is guaranteed.

<br/>

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Simulated Dev Tools** | Console, Network tab, File explorer, DOM Inspector — all fake, all functional |
| 🧩 **6 Escalating Cases** | From broken auth to race conditions to a full production launch |
| 📖 **Narrative Layer** | Each bug tells a story. Read between the lines. |
| 🏆 **Scoring System** | Hints cost points. Speed earns them. Find the solution efficiently. |
| 🔄 **Data-Driven Cases** | Every case is a JSON-like definition — fully deterministic, fully testable |
| 💾 **Progress Persistence** | Your progress is saved. Come back anytime. |

<br/>

## 🗺️ The Cases

```
┌─────────────────────────────────────────────────────────┐
│  CASE 01 · Broken Auth          ████░░░░░░  Rookie      │
│  CASE 02 · The Missing Profile  ████████░░  Apprentice  │
│  CASE 03 · Wrong Data           ██████████  Detective   │
│  CASE 04 · The Dashboard Lies   ██████████  Detective   │
│  CASE 05 · The Race Condition   ██████████  Senior Dev  │
│  CASE 06 · Production Launch    ██████████  FINAL BOSS  │
└─────────────────────────────────────────────────────────┘
```

<br/>

## 🏗️ Architecture

```
last-request/
├── apps/
│   ├── web/            # Vue 3 + TypeScript + Vite (frontend)
│   └── server/         # Express.js + TypeScript (backend API)
├── packages/
│   └── shared/         # Shared types, interfaces, enums
├── docs/               # PRD, Architecture, Agent guides
├── design_reference/   # UI mockups & design assets
└── package.json        # Monorepo root (npm workspaces)
```

### Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>Vue 3, TypeScript, Vite</td>
    <td>Game UI, case runtime, puzzle interaction</td>
  </tr>
  <tr>
    <td>State</td>
    <td>Pinia, Vue Router</td>
    <td>Global state, navigation between cases</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Express.js, TypeScript</td>
    <td>Case management, scoring, progress API</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>MongoDB + Prisma ORM</td>
    <td>Case definitions, player progress, scores</td>
  </tr>
  <tr>
    <td>Shared</td>
    <td>TypeScript Package</td>
    <td>Types and interfaces across frontend/backend</td>
  </tr>
</table>

<br/>

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | `>= 18.0.0` |
| npm | `>= 9.0.0` |
| MongoDB | Atlas (cloud) or local instance |

### 1. Clone the Repository

```bash
git clone https://github.com/FerrDxD/last-request.git
cd last-request
```

### 2. Install Dependencies

```bash
npm install
npm run install:all
```

> `install:all` installs dependencies for all workspaces: `packages/shared`, `apps/web`, and `apps/server`.

### 3. Configure Environment Variables

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env`:

```env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/404-last-request?retryWrites=true&w=majority"
PORT=3000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

> **⚠️ Never commit `.env` to version control.** It is already listed in `.gitignore`.

#### Getting MongoDB Atlas Credentials

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/) → create or select a project and cluster
2. In **Database Access** → add a database user → save username & password *(separate from your Atlas login)*
3. In **Network Access** → add your current IP address
4. Open **Connect** → **Drivers** → select Node.js → copy the connection string
5. Replace placeholders in your `.env` — add `/404-last-request` before `?retryWrites` if not present

> If your password contains `@`, `:`, `/`, `?`, or `#` — **percent-encode them** before putting in the URL.

### 4. Set Up the Database

```bash
# From the server directory
cd apps/server

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed initial case data
npm run prisma:seed
```

### 5. Start Development

```bash
# From root — starts both frontend and backend concurrently
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

<br/>

## 🧰 Available Scripts

Run these from the **root** of the repository:

```bash
# Development
npm run dev              # Start frontend + backend (concurrent)
npm run dev:web          # Start frontend only
npm run dev:server       # Start backend only

# Build
npm run build            # Build shared → web → server (in order)
npm run build:shared     # Build shared package only
npm run build:web        # Build Vue frontend only
npm run build:server     # Build Express backend only

# Quality
npm run test             # Run test suite (no DB required)
npm run typecheck        # Type-check all workspaces
npm run lint             # Lint all workspaces
```

<br/>

## 🧪 Testing

```bash
npm run test
```

The test suite covers:

- ✅ All 6 case definitions
- ✅ Case evaluation outcomes
- ✅ Multi-patch behavior
- ✅ Score calculations

> **No database connection required** for tests — cases are evaluated in-memory.

<br/>

## 🎯 Game Mechanics

The game simulates a real developer workflow:

```
OBSERVE → INVESTIGATE → HYPOTHESIZE → TEST → VERIFY
```

1. **Observe** — The broken application state is presented
2. **Investigate** — Use simulated dev tools: Console, Network, Files, Inspector
3. **Hypothesize** — Form a theory about the root cause
4. **Test** — Apply a patch from the available options
5. **Verify** — Run the test suite to confirm the fix

Each case has:
- 📋 A clear **objective**
- 🗂️ **Evidence** scattered across console logs, network tabs, and files
- 💡 **3-level hint system** (hints cost score points)
- ✅ **Deterministic solutions** — there is always one correct answer

<br/>

## 🤝 Contributing

We welcome contributions! Please read our **[Contributing Guide](./CONTRIBUTING.md)** before submitting a pull request.

Key principles:
- 🎮 Gameplay first — every change should serve the player experience
- 🧹 Keep it simple — no premature abstractions
- 📊 Data-driven — new cases go in the case definitions, not hardcoded
- ✅ Deterministic — solutions must be testable and verifiable

<br/>

## 🛡️ Security

Found a vulnerability? Please read our **[Security Policy](./SECURITY.md)** for responsible disclosure guidelines.

<br/>

## 📜 Code of Conduct

This project adheres to a **[Code of Conduct](./CODE_OF_CONDUCT.md)**. By participating, you are expected to uphold it.

<br/>

## 📄 License

This project is for **educational purposes**. See [LICENSE](./LICENSE) for details.

<br/>

---

<div align="center">

Made with ☕ and too many console.log statements.

**[FerrDxD](https://github.com/FerrDxD)** · [maulanaferdi0678@gmail.com](mailto:maulanaferdi0678@gmail.com)

</div>
