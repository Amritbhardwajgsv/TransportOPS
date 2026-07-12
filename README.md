# TransitOps

A role-based transport operations platform — vehicles, drivers, trips, maintenance, fuel, expenses, and compliance in one live system.

**Live:** [oddohack.site](https://oddohack.site)

## What it does

TransitOps runs the full lifecycle of a delivery fleet: registering vehicles and drivers, planning and dispatching trips, tracking maintenance and fuel/expenses, and keeping an eye on compliance (licenses, safety scores, service intervals) — with every screen tailored to the role using it.

### Roles

| Role | Can do |
|---|---|
| **Fleet Manager** | Full CRUD on vehicles/drivers, manage depots (cities), dispatch/close trips, close maintenance, view fleet-wide reports |
| **Driver** | Self-service dispatch — register a route, pick an available vehicle/driver, dispatch and complete their own trips |
| **Safety Officer** | Monitor driver compliance, safety scores, license expiries; receives automated email alerts |
| **Financial Analyst** | Read-only access to vehicles/trips; track fuel logs, expenses, and cost reports |

### Core features

- **Vehicles, Drivers, Trips, Maintenance, Fuel & Expenses** — full CRUD with search, column sorting, and status/category filters on every list
- **Dashboard KPIs + charts** — fleet status breakdown, expense-by-category, and driver safety-score charts (Recharts)
- **Live fleet map** — vehicle locations plotted with Leaflet/OpenStreetMap, no API key required
- **Depots (cities)** — fleet managers add operational locations through the UI; trip distances are auto-computed (haversine) from city coordinates stored in the database, not hardcoded
- **Vehicle documents** — upload/download/delete RC, Insurance, PUC, and Permit scans per vehicle (stored as base64 in Postgres)
- **Email notifications** — role-based welcome email on registration, and a daily job that emails Safety Officers a table of expired/expiring driver licenses (also triggerable on demand)
- **4 role-specific home dashboards** — Fleet Command, Dispatch Desk, Compliance Watch, Cost Console
- **Public landing page** — typewriter headline, scroll-animated per-role sections, no forced redirect to login

### Business rules enforced

- Vehicle registration numbers are unique; retired/in-shop vehicles can't be dispatched
- Expired or suspended driver licenses block dispatch
- A vehicle/driver already on a trip can't be double-booked
- Cargo weight can't exceed a vehicle's max load (with a non-blocking 90–100% capacity warning)
- A vehicle must physically be at the trip's source city to be dispatched from it
- Dispatch → On Trip, Complete/Cancel → Available, Maintenance open → In Shop, Maintenance close → Available (unless the vehicle was retired mid-repair)
- Drivers get a mandatory rest window between trips; vehicles due for service (10,000 km) are blocked from dispatch; underutilized vehicles are flagged on the dashboard

## Tech stack

**Backend:** Node.js, Express 5, PostgreSQL (AWS RDS), Redis (JWT blacklist for logout), JWT auth with role claims, nodemailer + node-cron

**Frontend:** React 19, Vite, Tailwind CSS v4, Recharts, Leaflet/react-leaflet, jsPDF (fleet report export)

**Infra:** GitHub Actions → EC2 (build frontend, scp to nginx, SSH + `pm2 restart` the backend) on every push to `main`

## Project structure

```
src/
  app.js                 Express app + route mounting
  routes/ controllers/ models/   REST resources, one set per domain (vehicles, drivers, trips, ...)
  middlewares/           JWT auth + role-based access control
  jobs/                  Scheduled/triggerable jobs (license reminders, welcome email)
  services/              Cross-cutting integrations (email)
  db/migrations/         Idempotent SQL migrations, re-run in order on every migrate
frontend/
  src/pages/             One page per resource, plus homes/ for the 4 role dashboards
  src/components/        Shared UI (DataTable, Modal, Drawer, FleetMap, ...)
scripts/
  seed-demo-data.js       Seeds vehicles/drivers/trips/maintenance/fuel/expenses
```

## Getting started

**Prerequisites:** Node 22+, a PostgreSQL database, Redis.

```bash
# Backend
cp .env.example .env        # fill in DB, Redis, JWT, and Gmail SMTP credentials
npm install
npm run migrate             # runs every migration in src/db/migrations, idempotently
npm run dev                 # starts on PORT from .env

# Frontend
cd frontend
npm install
npm run dev                 # proxies /api to http://localhost:<BACKEND_PORT || 8080>
```

Register an account from the landing page and pick a role — each role lands on its own dashboard immediately.

### Environment variables

See `.env.example` for the full list. Notably:
- `PGHOST` / `PGPORT` / `PGDATABASE` / `PGUSER` / `PGPASSWORD` / `DB_SSL_CA_PATH` — Postgres connection
- `REDIS_URL` — Redis connection (JWT logout blacklist)
- `JWT_SECRET` / `JWT_EXPIRES_IN` — auth
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — SMTP for welcome emails and license reminders (any Gmail account + an [App Password](https://myaccount.google.com/apppasswords), no custom domain needed)

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`: builds the frontend, copies the static bundle to the server, then SSHes in to `git pull`, `npm install`, and `pm2 restart` the backend.
