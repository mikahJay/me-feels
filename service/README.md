# me-feels service

Node.js 20 + TypeScript + Express backend for me-feels.

## Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 4 |
| Database | PostgreSQL 16 (via `pg`) |
| Auth | Google OAuth 2.0 + JWT |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| Tests | Jest + ts-jest + Supertest |

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or run via Docker — see root `docker-compose.yml`)
- Google OAuth credentials
- Anthropic API key

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST` | Postgres host (default: `localhost`) |
| `POSTGRES_PORT` | Postgres port (default: `5432`) |
| `POSTGRES_DB` | Database name (default: `mefeels`) |
| `POSTGRES_USER` | Database user (default: `mefeels`) |
| `POSTGRES_PASSWORD` | Database password |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | JWT expiry (default: `7d`) |
| `DEV_MODE` | Set `true` to skip Google OAuth and auto-login as `bob@local.dev` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (default: `http://localhost:3001/auth/google/callback`) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `SERVICE_PORT` | Port to listen on (default: `3001`) |

## Run

### Development (with live reload)
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Database migrations

Migrations in `src/db/migrations/` run automatically when the Docker container starts.
To run them manually against a local Postgres:
```bash
npm run build
npm run migrate
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Liveness check |
| `GET` | `/health/deep` | — | Dependency health (DB, Anthropic, Google) |
| `GET` | `/auth/google` | — | Start OAuth flow (or auto-login in dev mode) |
| `GET` | `/auth/google/callback` | — | OAuth callback |
| `GET` | `/auth/me` | JWT | Current user info |
| `POST` | `/auth/logout` | JWT | Logout |
| `POST` | `/emotions` | JWT | Log an emotion entry |
| `GET` | `/emotions` | JWT | List emotion entries |
| `GET` | `/emotions/:id` | JWT | Get a single entry |
| `DELETE` | `/emotions/:id` | JWT | Delete an entry |

## Tests

Tests are pure unit tests — no running database or external services required.

```bash
npm test                 # run all unit tests
npm run test:watch       # watch mode for active development
npm run test:coverage    # unit tests with coverage report (output: coverage/)
npm run test:smoke       # integration smoke tests (requires running containers)
```

### Smoke tests

Smoke tests hit the live service to verify it can reach its dependencies.
They require the Docker containers to be running and `.env` fully populated.

Override the target URL with `SERVICE_URL`:
```bash
SERVICE_URL=http://localhost:3001 npm run test:smoke
```

Coverage reports are written to `coverage/`. Open `coverage/index.html` in a browser for the full report.
