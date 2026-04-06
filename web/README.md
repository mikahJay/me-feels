# me-feels web

React 18 + TypeScript + Vite frontend for me-feels.

## Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Routing | React Router 6 |
| HTTP | Axios |
| Auth | Google OAuth 2.0 (via redirect to service) |
| Tests | Vitest + React Testing Library |

## Prerequisites

- Node.js 20+
- me-feels service running (see `../service/README.md`)

## Setup

```bash
npm install
```

### Environment variables

Vite injects variables prefixed with `VITE_` at build time. Set these in the root `.env`:

| Variable | Description |
|----------|-------------|
| `VITE_SERVICE_URL` | Backend service URL (default: `http://localhost:3001`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (must match service value) |

## Run

### Development (with HMR)
```bash
npm run dev
```

Opens at http://localhost:3000. API requests to `/api/*` are proxied to the service at `http://localhost:3001`.

### Production build
```bash
npm run build    # type-check + Vite build → dist/
npm run preview  # serve the built output locally
```

## Dev mode (skip Google OAuth)

Set `DEV_MODE=true` in the root `.env` and restart the service. Clicking the login button will automatically authenticate as `bob@local.dev` without requiring real Google credentials.

## Tests

```bash
npm test                 # run all tests once
npm run test:watch       # watch mode for active development
npm run test:coverage    # run with coverage report (output: coverage/)
```

Tests use Vitest + React Testing Library with a jsdom environment. All external dependencies (API client, auth context) are mocked — no running service required.

Coverage reports are written to `coverage/`. Open `coverage/index.html` in a browser for the full report.
