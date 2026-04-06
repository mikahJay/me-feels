# me-feels

A web application to express, retain, manage and understand your emotions — with a little help from AI (Claude).

## Architecture

| Layer | Technology |
|-------|-----------|
| Web App | React 18 + TypeScript + Vite |
| Service | Node.js 20 + TypeScript + Express |
| Database | PostgreSQL 16 |
| Auth | Google OAuth 2.0 |
| AI | Anthropic Claude |
| Containers | Docker + Docker Compose |
| Analytics | dbt (Snowflake-ready) |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose)
- [Node.js 20+](https://nodejs.org/)
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com/))
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com/))

## Quick Start

### macOS / Linux
```bash
chmod +x scripts/*.sh
./scripts/setup.sh   # installs deps, copies .env.example → .env
# Edit .env with your credentials
./scripts/start.sh   # docker compose up --build -d
```

### Windows (PowerShell)
```powershell
.\scripts\setup.ps1
# Edit .env with your credentials
.\scripts\start.ps1
```

Then open:
- **Web app**: http://localhost:3000
- **API**: http://localhost:3001
- **Health**: http://localhost:3001/health

## Project Structure

```
me-feels/
├── service/          # Node.js + Express backend
│   └── src/
│       ├── db/       # PostgreSQL pool + migrations
│       ├── middleware/
│       ├── routes/
│       ├── services/ # Business logic + AI integration
│       └── types/
├── web/              # React + Vite frontend
│   └── src/
│       ├── api/
│       ├── auth/
│       ├── emotions/
│       └── pages/
├── dbt/              # Analytics models (Snowflake)
└── scripts/          # Setup & start scripts
```

## Development

### Run service locally
```bash
cd service
npm install
npm run dev
```

### Run web locally
```bash
cd web
npm install
npm run dev
```

### Run tests

Tests are unit tests only — no running containers required.

**Service** (Jest + ts-jest):
```bash
cd service
npm test                  # run all unit tests
npm run test:watch        # watch mode for active development
npm run test:coverage     # run with coverage report (output: service/coverage/)
npm run test:smoke        # integration smoke tests (requires running containers)
```

**Web** (Vitest + React Testing Library):
```bash
cd web
npm test                  # run all tests once
npm run test:watch        # watch mode for active development
npm run test:coverage     # run with coverage report (output: web/coverage/)
```

Open `coverage/index.html` in a browser for a full interactive report.

> **Smoke tests** hit the live service at `http://localhost:3001` (override with `SERVICE_URL` env var).
> They require Docker containers to be running and `.env` fully populated with real credentials.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `POSTGRES_*` | PostgreSQL connection settings |
| `JWT_SECRET` | Secret for signing JWTs (change in production!) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `VITE_SERVICE_URL` | Frontend → backend URL |

## Database Migrations

Migrations in `service/src/db/migrations/` run automatically on first Docker startup via `docker-entrypoint-initdb.d`.

| File | Description |
|------|-------------|
| `001_init.sql` | `auth` schema + `users` table |
| `002_emotions.sql` | `emotions` schema + `entries` table |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/auth/google` | — | Redirect to Google OAuth |
| GET | `/auth/google/callback` | — | OAuth callback |
| GET | `/auth/me` | ✓ | Current user |
| POST | `/auth/logout` | ✓ | Logout |
| POST | `/emotions` | ✓ | Create emotion entry |
| GET | `/emotions` | ✓ | List entries |
| GET | `/emotions/:id` | ✓ | Get single entry |
| DELETE | `/emotions/:id` | ✓ | Delete entry |
