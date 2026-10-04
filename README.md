# 404: LAST REQUEST

A narrative puzzle game where players investigate and fix a broken web application before its final deployment.

## Project Overview

This is a browser-based debugging puzzle game built with:
- **Frontend**: Vue.js, TypeScript, Vite, Vue Router, Pinia
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Prisma ORM
- **Architecture**: Monorepo with separate frontend, backend, and shared-package dependencies

## Project Structure

```
404-last-request/
├── apps/
│   ├── web/           # Vue.js frontend
│   └── server/        # Express.js backend
├── packages/
│   └── shared/        # Shared TypeScript types
├── docs/              # Project documentation
├── package.json       # Root package with workspaces
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or MongoDB Atlas)

## Setup

### 1. Install Dependencies

```bash
npm install
npm run install:all
```

The root install provides the monorepo scripts; `install:all` installs dependencies for the shared package, web app, and server.

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` and configure:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/404-last-request?retryWrites=true&w=majority"
PORT=3000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

Replace the placeholders with the MongoDB **database user's** credentials and the host from your Atlas cluster. Keep `/404-last-request` (the database name) before the `?` query string. Do not include the angle brackets. If the password contains reserved URL characters such as `@`, `:`, `/`, `?`, or `#`, percent-encode those characters before putting it in the URL. Keep `.env` private; never commit or share its credentials.

#### Get MongoDB Atlas credentials

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/) and create or select a project and cluster.
2. In **Database Access**, add a database user and save its username and password. These are separate from your Atlas website login.
3. In **Network Access**, add your current IP address. Avoid allowing access from every IP except for temporary, controlled testing.
4. Open the cluster's **Connect** dialog, choose **Drivers**, select Node.js, and copy the connection string.
5. Replace the username, password, and `<cluster-host>` in `apps/server/.env`; add `/404-last-request` before `?retryWrites=true&w=majority` if the copied URL has no database name.

### 3. Setup Database

Generate Prisma client:

```bash
cd apps/server
npm run prisma:generate
```

Push schema to database:

```bash
npm run prisma:push
```

Seed the database with initial cases:

```bash
npm run prisma:seed
```

### 4. Build the Project

```bash
npm run build
```

This builds the shared package, frontend, and backend in dependency order.

## Development

### Start Both Frontend and Backend

```bash
npm run dev
```

This starts:
- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Start Frontend Only

```bash
npm run dev:web
```

### Start Backend Only

```bash
npm run dev:server
```

## Build

```bash
npm run build
```

This builds:
- Shared package
- Frontend (Vue)
- Backend (TypeScript)

## Testing

```bash
npm run test
```

The test suite validates all six case definitions, case-evaluation outcomes, multi-patch behavior, and score calculations. It does not require a database connection.

## Linting

```bash
npm run lint
```

## Type Checking

```bash
npm run typecheck
```

## Game Mechanics

The game simulates a developer environment where players:

1. **Observe** - See the broken application
2. **Investigate** - Use simulated developer tools (Console, Network, Files, Inspector)
3. **Hypothesize** - Form theories about what's wrong
4. **Test** - Attempt fixes
5. **Verify** - Run tests to confirm the solution

Each case represents a debugging challenge with increasing difficulty.

## Case Structure

Cases are data-driven and include:
- Objective
- Application state
- Available tools
- Evidence (console logs, network requests, files)
- Solution requirements
- Hints (3 levels)

## Contributing

- Keep it simple
- Gameplay first
- No premature abstraction
- Data-driven cases
- Deterministic solutions

## License

This project is for educational purposes.
