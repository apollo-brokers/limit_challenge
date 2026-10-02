# Fleetline — Fleet Maintenance API

Take-home implementation of a fleet maintenance REST API (Django + DRF) with an optional Next.js frontend.

## Stack

- **Backend:** Python, Django 5.2, Django REST Framework, SQLite, Faker
- **Frontend:** Next.js 16, React 19, Material UI, Axios, TanStack React Query

## Project structure

```
backend_focused/
  backend/                 # Django project
    fleet/                 # Domain app (models, API, tests, seed)
    server/                # Settings & root URLs
  frontend/                # Next.js app (Fleetline UI)
  README.md
```

## Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_fleet --clear
python manage.py runserver 0.0.0.0:8000
```

API base: `http://localhost:8000/api/`

### Seed data

```bash
python manage.py seed_fleet --clear
# optional: --vehicles 40 --mechanics 12 --seed 42
```

Creates offices, vehicles, mechanics, and maintenance history (including overdue / never-maintained vehicles and one vehicle with a large history for details performance checks).

### Tests

```bash
cd backend
python manage.py test fleet -v 2
```

## Frontend setup

```bash
cd frontend
npm install
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Open `http://localhost:3000`.

### Frontend coverage (per challenge)

| Requirement | Implementation |
|-------------|----------------|
| Vehicle CRUD | Create / edit / delete vehicle dialogs |
| Vehicle search | Filters synced to URL query params |
| Additional endpoint | Vehicles needing maintenance |
| Extra polish | Details + maintenance history + office assign |

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/offices/` | Offices (`name`, `city`) |
| CRUD | `/api/vehicles/` | Vehicles |
| CRUD | `/api/mechanics/` | Mechanics |
| CRUD | `/api/maintenance-records/` | Maintenance records |
| GET | `/api/offices/summary/` | Active counts, 12‑month cost, last maintenance |
| GET | `/api/vehicles/search/` | Composable filters |
| GET | `/api/vehicles/{id}/details/` | Vehicle + office + history + mechanics |
| GET | `/api/vehicles/{id}/maintenance-history/` | Newest → oldest |
| POST | `/api/vehicles/{id}/assign/` | `{ "office_id": N }` |
| GET | `/api/mechanics/workload/` | Current-year records/cost, busiest first |
| GET | `/api/vehicles/needing-maintenance/` | Never serviced or last service > 365 days |
| POST | `/api/vehicles/duplicate-check/` | `{ "vin", "license_plate" }` → conflicts |

### Vehicle search query params

- `office` — office id
- `active` — `true` / `false`
- `make`, `model`
- `maintained_from`, `maintained_to` — `YYYY-MM-DD`
- `mechanic_certification` — certification number

Example:

```http
GET /api/vehicles/search/?office=1&active=true&make=Toyota&maintained_from=2025-01-01&maintained_to=2025-12-31
```

### Duplicate check example

```http
POST /api/vehicles/duplicate-check/
Content-Type: application/json

{ "vin": "1HGCM82633A004352", "license_plate": "ABC-1234", "is_active": true }
```

```json
{ "conflicts": ["vin", "license_plate"] }
```

## Domain rules implemented

- VIN is globally unique
- License plate is unique among **active** vehicles (inactive plates may be reused)
- Maintenance `cost` uses `DecimalField` (not float)
- Vehicle details uses `select_related` / `prefetch_related` for large histories

## Assumptions

- **Last 12 months** (office summary) = rolling 365 days ending today (inclusive)
- **Current year** (mechanic workload) = calendar year of the server’s local date
- **Needs maintenance** = active vehicles only; never-maintained sort first (`nulls_first`), then oldest last-maintenance date
- **Assign vehicle** updates only the `office` FK — no assignment history table (not required)
- **Duplicate check** treats plate conflicts only when `is_active` is true (default); VIN always conflicts
- No authentication (optional JWT skipped)
- SQLite for local evaluation simplicity
- Decimal monetary values may serialize as JSON strings (precise money handling)

## Limitations

- JWT auth not implemented (out of scope)
- Frontend focuses on vehicle CRUD, search, needing-maintenance, details, and assign — full admin UIs for offices/mechanics/maintenance-records are API-only
- Seed data and SQLite are for local evaluation, not production scale

## Design decisions / tradeoffs

- DRF viewsets for CRUD; `@action` for vehicle-specific endpoints; dedicated APIViews for office summary and mechanic workload
- Aggregations (`Count` / `Sum` / `Max` with filters) run in the database
- Partial unique constraint + serializer validation for clear license-plate errors
- Indexes only where query patterns need them (search, history, workload, summaries)
- Frontend scoped to vehicles + search + due list rather than full admin UIs for every resource

## Performance notes

- Office summary and mechanic workload use ORM aggregation, not Python loops
- Vehicle details prefetches maintenance records with mechanics in one related query set
- Search uses `distinct()` when joining maintenance filters to avoid duplicate vehicles
- History list endpoint remains paginated for lighter clients

## Deliverables checklist

- [x] Source code (backend + frontend)
- [x] Database migrations (`fleet/migrations/0001_initial.py`)
- [x] Seed management command (`seed_fleet`)
- [x] README (run / test / assumptions / tradeoffs)
- [x] Demo video (max 2 minutes) — [`fleet-tracker-demo.mp4`](./fleet-tracker-demo.mp4)

## Security / local-dev notes

- `DEBUG=True`, a development `SECRET_KEY`, `ALLOWED_HOSTS=["*"]`, and `CORS_ALLOW_ALL_ORIGINS=True` are intentional for this take-home.
- Do not deploy this configuration to a public production environment without hardening.
