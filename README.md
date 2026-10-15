# StackPulse ⚡

> **Developer Intelligence, Profile Analytics & Head-to-Head GitHub Developer Comparison Engine**
> 
> A full-stack web application engineered with **React, TypeScript, Express, and PostgreSQL** that enables users to inspect GitHub developer profiles, benchmark engineering metrics (total stars, language distribution, commit activity), curate repositories with custom tags and private notes, and save named comparisons.

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Technical Decisions & Trade-Offs](#-technical-decisions--trade-offs)
- [5-Increment Delivery Roadmap](#-5-increment-delivery-roadmap)
- [Database Schema (PostgreSQL)](#-database-schema-postgresql)
- [GitHub API & Performance Strategy](#-github-api--performance-strategy)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Increment 1 Release Notes](#-increment-1-release-notes)

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router | React + TypeScript ensures end-to-end type safety, modular component architecture, and responsive styling. Vite provides sub-second HMR and instant builds. |
| **Backend** | Node.js, Express, TypeScript | Lightweight, unopinionated REST API framework with asynchronous non-blocking I/O ideal for concurrent third-party API fetches. |
| **Database** | PostgreSQL, Prisma ORM | Relational schema strictly enforcing foreign keys, cascade deletes, and indexing on developers, repositories, pins, and comparisons. Prisma provides type-safe queries and automated migrations. |
| **Security** | Helmet, CORS, Express Rate Limit, bcryptjs, JWT | Protects against brute-force attacks, headers vulnerability, and enforces strict user data isolation. |
| **API Caching** | PostgreSQL Cache Table + Invalidation TTL | Caches developer profiles and repository metrics with a configurable TTL (`DEVELOPER_CACHE_TTL_MS`), safeguarding against GitHub's 60 / 5,000 req/hr rate limits and providing sub-50ms response times. |

---

## 💡 Technical Decisions & Trade-Offs

### 1. Dedicated Backend vs. Client-Only GitHub API Fetching
- **Decision:** Build an Express REST API backend with PostgreSQL persistence rather than querying GitHub directly from the browser.
- **Rationale:** 
  1. **Rate Limiting:** Unauthenticated client requests share IP pools and hit GitHub's 60 req/hr limit in minutes. A backend allows authenticated token pooling (5,000 req/hr) and shared database caching.
  2. **User Privacy:** User pins, custom notes, and saved comparisons must be strictly private and stored securely in PostgreSQL.
  3. **Heavy Aggregations:** Computing total stars across hundreds of repositories and parsing language bytes across repos is computed once on the server and cached.

### 2. Relational PostgreSQL Schema over Document Store
- **Decision:** Structured PostgreSQL schema with normalized tables: `users`, `developers`, `repos`, `repository_languages`, `comparisons`, `comparison_devs`, and `pins`.
- **Rationale:** The domain has relational integrity: comparisons reference multiple developers, pins link specific users to specific repositories, and repositories belong to specific developers. Cascade deletes guarantee clean data lifecycles.

### 3. Progressive 5-Increment Development
- **Decision:** The codebase is built in 5 distinct increments, establishing a clear, professional Git commit history that illustrates methodical software engineering.

---

## 🗺️ 5-Increment Delivery Roadmap

```
Increment 1: Project Foundation, Core Architecture & Database Schema  [CURRENT]
Increment 2: User Authentication & Privacy Layer (Bcrypt, JWT, Middleware)
Increment 3: GitHub API Ingestion Engine & Profile Dashboard (Caching & Metrics)
Increment 4: Side-by-Side Comparison Engine (Multi-Dev Matrix & Visual Charts)
Increment 5: Personal Curation (Pins, Notes, Tags), Mobile Polish & Final Docs
```

| Increment | Scope | Deliverables |
| :--- | :--- | :--- |
| **Increment 1** | **Foundation & Data Model** | Monorepo structure, Express server, PostgreSQL Prisma schema, TypeScript types, Vite React client, Tailwind CSS shell, Health check endpoint. |
| **Increment 2** | **Authentication & Privacy** | User registration, login, bcrypt password hashing, JWT session management, auth middleware, protected routes, user privacy isolation. |
| **Increment 3** | **GitHub Engine & Profiles** | Octokit/REST integration, profile & repo caching in PostgreSQL, star aggregation, language breakdown, commit activity stats, profile dashboard UI. |
| **Increment 4** | **Comparison View** | Multi-developer comparison computation, side-by-side metric tables, comparison charts, save named comparisons to database. |
| **Increment 5** | **Curations, Polish & Submission** | Pin/unpin repos, notes, tags, filter bookmarks, responsive mobile optimizations, final demo verification. |

---

## 🗄️ Database Schema (PostgreSQL)

```
+--------------------------------------------------------------+
|                            users                             |
+--------------------------------------------------------------+
| id (PK) | email (UQ) | password_hash | name | created_at      |
+--------------------------------------------------------------+
           | 1:N                                     | 1:N
           v                                         v
+------------------------+             +------------------------+
|      comparisons       |             |          pins          |
+------------------------+             +------------------------+
| id (PK)                |             | id (PK)                |
| user_id (FK -> users)  |             | user_id (FK -> users)  |
| name                   |             | repository_id (FK)     |
| description            |             | note                   |
| created_at             |             | tags (JSON / text)     |
+------------------------+             +------------------------+
           | 1:N                                     ^
           v                                         | 1:N
+------------------------+                           |
|    comparison_devs     |                           |
+------------------------+                           |
| id (PK)                |                           |
| comparison_id (FK)     |                           |
| developer_id (FK)      |                           |
+------------------------+                           |
           | N:1                                     |
           v                                         |
+--------------------------------------------------------------+
|                          developers                          |
+--------------------------------------------------------------+
| id (PK) | github_username (UQ) | avatar_url | followers      |
| following | public_repos | total_stars | fetched_at          |
+--------------------------------------------------------------+
           | 1:N
           v
+--------------------------------------------------------------+
|                            repos                             |
+--------------------------------------------------------------+
| id (PK) | developer_id (FK) | name | full_name | stars       |
| forks | primary_language | pushed_at | html_url              |
+--------------------------------------------------------------+
           | 1:N
           v
+--------------------------------------------------------------+
|                     repository_languages                     |
+--------------------------------------------------------------+
| id (PK) | repository_id (FK) | language | bytes              |
+--------------------------------------------------------------+
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL**: Local instance or cloud database (Supabase, Neon, AWS RDS, Docker)

### 1. Clone & Install Dependencies

```bash
# In the project root directory
npm install

# Install server and client packages
npm run install:all
```

### 2. Environment Configuration

Copy the example environment files:

```bash
# Root
cp .env.example .env

# Server
cp server/.env.example server/.env
```

Edit `server/.env` to point to your PostgreSQL database:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stackpulse?schema=public"
JWT_SECRET="your_strong_secret_key"
GITHUB_TOKEN="" # Optional: adds 5,000 req/hr rate limit
```

### 3. Database Initialization (Prisma)

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to PostgreSQL database
npm --prefix server run prisma:push
```

### 4. Run Development Environment

Start both the backend API and frontend Vite server concurrently:

```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Environment Variables

| Variable | Scope | Description | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Server | Express HTTP server port | `5000` |
| `NODE_ENV` | Server | Runtime environment (`development`, `production`) | `development` |
| `CLIENT_URL` | Server | Allowed CORS origin | `http://localhost:5173` |
| `DATABASE_URL` | Server | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Server | Secret key for signing authentication tokens | `stackpulse_secret` |
| `JWT_EXPIRES_IN` | Server | Token lifespan | `7d` |
| `GITHUB_TOKEN` | Server | Optional GitHub PAT for 5,000 req/hr rate limit | `""` |
| `DEVELOPER_CACHE_TTL_MS` | Server | Cache lifetime for fetched GitHub developer data | `3600000` (1h) |
| `VITE_API_URL` | Client | API root prefix for frontend fetch calls | `/api` |

---

## 📁 Project Structure

```
StackPulse/
├── package.json              # Monorepo scripts (concurrent dev, builds)
├── .gitignore                # Git ignore for node_modules, build, .env
├── .env.example              # Documented environment template
├── README.md                 # Project documentation & tech decisions
│
├── server/                   # Backend Express REST API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL schema (users, devs, repos, pins)
│   │   └── migrations/
│   │       └── init.sql      # Raw PostgreSQL DDL migration script
│   └── src/
│       ├── app.ts            # Express application factory & middleware
│       ├── index.ts          # Server entry point & connection lifecycle
│       ├── config/           # Environment loader & settings
│       ├── db/               # Prisma client wrapper & connection checker
│       ├── middleware/       # Error handling, rate limiting, request logging
│       ├── routes/           # REST endpoints (health, root)
│       └── types/            # Shared TypeScript interfaces
│
└── client/                   # Frontend React + TypeScript Client
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts        # Vite configuration with API proxy
    ├── tailwind.config.js    # Tailwind styling system
    ├── index.html
    └── src/
        ├── App.tsx           # Router & layout provider
        ├── main.tsx          # DOM entry point
        ├── index.css         # Tailwind & custom scrollbar styles
        ├── components/
        │   ├── common/       # Button, Card, Input, Badge components
        │   └── layout/       # Responsive Navbar & Footer
        ├── pages/            # Home, Profile, Compare, Curations, Auth
        ├── services/         # Axios API client & endpoints
        └── types/            # Frontend interfaces
```

---

## 📦 Increment 1 Release Notes

- **Full-stack Monorepo Foundation**: Configured simultaneous dev scripts via `concurrently`, TypeScript type check scripts, and modular build pipelines.
- **PostgreSQL Relational Schema**: Defined schema with cascade rules, indexes, and full support for `users`, `developers`, `repos`, `repository_languages`, `comparisons`, `comparison_devs`, and `pins`.
- **Express REST API Core**: Initialized with Helmet security headers, CORS origin protection, request logging with response timing, standard rate limiter, and central error handler.
- **Live Health Endpoint**: Implemented `/api/health` displaying service uptime, environment, and dynamic PostgreSQL connection status.
- **Responsive React UI Shell**: Built clean dark-theme layout with responsive navigation, mobile drawer, interactive search hero, feature highlights, and roadmap visualizer.
