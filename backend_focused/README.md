# Fleet Maintenance API Take-home Challenge

Build a REST API for managing a fleet of vehicles and their maintenance history.

Use Python, Django and Django REST Framework.

The API does not need authentication or a frontend.

## Domain

A company owns vehicles that are assigned to offices around the country.
Vehicles periodically receive maintenance services performed by mechanics.
A vehicle may have many maintenance records.
A mechanic may service many vehicles.
Each office has many vehicles.

Offices

An office has:
* name
* city

Vehicles

A vehicle has:
* VIN (Vehicle Identification Number)
* license plate
* make
* model
* year
* office
* active flag

A VIN must uniquely identify a vehicle.
A license plate cannot be shared by two active vehicles.

Provide CRUD endpoints.

A mechanic has:

name
certification number
active flag

Provide CRUD endpoints.

Maintenance Records

A maintenance record contains:

vehicle
mechanic
maintenance date
maintenance type
cost
notes

Provide CRUD endpoints.

## API endpoints

1. CRUD endpoints for offices, vehicles, mechanics and maintenance records.

2. Office summary

It should return every office together with:
* number of active vehicles
* total maintenance cost during the last 12 months
* date of the most recent maintenance performed on any vehicle in that office

Example:
[
    {
        "name": "New York",
        "city": "New York",
        "active_vehicle_count": 42,
        "maintenance_cost_last_year": 81250.50,
        "last_maintenance": "2025-02-18"
    }
]

3. Vehicle search

It should support optional filtering by any combination of:

* office
* active/inactive
* make
* model
* maintenance performed between two dates
* mechanic certification number

4. Vehicle details

Return vehicle details together with:
* office information
* complete maintenance history
* mechanic information for each maintenance record

The endpoint should perform well when a vehicle has hundreds of maintenance records.

5. Vehicle maintenance history

Provide an endpoint that returns the maintenance history for a single vehicle ordered from newest to oldest.

6. Assign vehicle

Provide an endpoint that moves a vehicle from one office to another.

The endpoint should record only the new office assignment.

7. Mechanic workload

It should return:
* mechanic name
* number of maintenance records completed during the current year
* total maintenance cost of work performed during the current year

Order mechanics from busiest to least busy.

8. Vehicles needing maintenance

It should return all active vehicles that satisfy either of the following:
* have never received maintenance
* last maintenance was more than 365 days ago

Order by oldest maintenance first.

9. Duplicate vehicle check

Given VIN and license plate, it should return whether another conflicting vehicle already exists and identifies the conflicting fields.

Example:

{
    "conflicts": [
        "vin",
        "license_plate"
    ]
}

## Front-end

If you know React, implement a front-end that uses the CRUD endpoints, the vehicle search one 
and another endpoint you choose.

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. 

## Error Handling

Return appropriate HTTP status codes for invalid requests.
Validation errors should include meaningful messages.

## Project Structure

- `backend/`: Django + DRF API (`fleet` app).
- `frontend/`: Empty Next.js app.

## Getting Started

### Backend

Requires Python 3.12. The database is SQLite, so no other services are needed.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_fleet          # optional demo data, safe to rerun
python manage.py createsuperuser     # user for the JWT token
python manage.py runserver
```

API docs (Swagger): http://localhost:8000/api/v1/docs/ — OpenAPI schema: http://localhost:8000/api/v1/schema/

Use `localhost` in the browser. `ALLOWED_HOSTS` is empty in development, so a `0.0.0.0` host is rejected.

#### Authentication (JWT)

Every application endpoint requires a bearer token. Only the docs, the schema and the token endpoints are public.

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "admin", "password": "<your-password>"}'
# -> {"refresh": "...", "access": "..."}

curl -s http://localhost:8000/api/v1/vehicles/ -H 'Authorization: Bearer <access>'
```

In Swagger, click **Authorize** and paste the access token. When the access token expires, send
`{"refresh": "<refresh>"}` to `POST /api/v1/auth/token/refresh/` to get a new one.

#### Tests

```bash
cd backend
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py spectacular --validate --fail-on-warn --file /dev/null
```

### Frontend

```bash
cd frontend
npm install
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:3000` in your web browser to run it.

## Deliverables

source code
database migrations
a Django management command that fills the database with dummy data to make manually testing your app easier (suggestion: use the faker Python library)
README describing:
  how to run the project
  how to run tests
  assumptions made
  chosen tradeoffs  
if front-end was implemented, record and share a brief video (max 2 minutes) demonstrating the frontend working end-to-end with the backend.

## Evaluation Criteria

- **Backend (50%)** – API design, database queries performance, appropriate use of Django and Django Rest Framework
- **Frontend (25%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Code Quality (15%)** – Code structure, testing where it adds value, documentation/readability, naming
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details (if front-end is implemented)

## Optional Bonus

Authentication using JWT is not required but welcome if time allows.

## Backend Implementation Notes

### Endpoints

All Fleet API endpoints are under `/api/v1/` and return JSON. Lists are paginated with `?page=` (10 per page) unless noted.

| Requirement | Endpoint |
|---|---|
| CRUD | `offices/`, `vehicles/`, `mechanics/`, `maintenance-types/`, `maintenance-records/` (`GET`/`POST` on the collection, `GET`/`PUT`/`PATCH`/`DELETE` on `{id}/`) |
| Office summary | `GET offices/summary/` (plain list) |
| Vehicle search | `GET vehicles/?office=&active=&make=&model=&maintained_from=&maintained_to=&mechanic_certification=` |
| Vehicle details | `GET vehicles/{id}/` (office + full history + mechanic) |
| Maintenance history | `GET vehicles/{id}/maintenance-records/` (newest first) |
| Assign vehicle | `PUT vehicles/{id}/office/` with `{"office_id": 2}` |
| Mechanic workload | `GET mechanics/workload/` (plain list, busiest first) |
| Vehicles needing maintenance | `GET vehicles/maintenance-due/` |
| Duplicate vehicle check | `GET vehicles/duplicate-check/?vin=&license_plate=` |

Relations are nested objects on read and `*_id` fields on write (`office_id`, `vehicle_id`, `mechanic_id`, `type_id`).

Errors: `400` with field messages, `401` without a token, `404` for unknown ids, and `409` when you delete an office, mechanic or maintenance type that other records still reference.

### Seed data

`seed_fleet` creates a small, deterministic dataset where each record covers one scenario:
3 offices, 5 vehicles, 3 mechanics (one inactive), 4 maintenance types and 3 maintenance records.
It includes a vehicle that was never maintained, one with recent maintenance from two mechanics,
one whose last maintenance was more than 365 days ago, and one active and one inactive vehicle
sharing a license plate. Dates are relative to today. Reruns update the seeded fixtures in place
and preserve unrelated data, including manually added maintenance records.

### Assumptions

- JWT (the optional bonus) protects every application endpoint.
- Maintenance type is its own resource with CRUD, so type names stay consistent.
- Maintenance cost must be `>= 0`; zero is allowed.
- Office summary: "last 12 months" goes from the same calendar date one year ago to today,
  inclusive (Feb 29 maps to Feb 28). All maintenance on a vehicle counts toward its *current*
  office, including inactive vehicles and work done before a move, because assignment history is
  not stored.
- Mechanic workload: "current year" means Jan 1 to today.
- Reports and maintenance-due ignore records dated after today. Exactly 365 days ago is not due
  yet, and never-maintained vehicles come first.
- Search: `make`/`model` match the whole value, ignoring case. The date range and certification
  must match the same maintenance record. Empty parameters are ignored. An unknown `office`
  returns 400.
- Duplicate check: a VIN conflicts with any vehicle, a plate only with active vehicles. HTTP inputs
  are trimmed by DRF, then compared case-sensitively against stored values.
- Dates use the server time zone (UTC).

### Design decisions and tradeoffs

- CRUD stays in DRF viewsets. Report and filter queries live in `fleet/selectors.py`. There is no
  service or repository layer, because the logic does not need one.
- The active-plate rule is a partial unique constraint in the database, plus a serializer check
  for a clear 400 message. Two concurrent requests can both pass validation, and then the database
  rejects the second with a 500. This race is not translated on purpose.
- Vehicle details return the full history in two queries (vehicle + one prefetch with mechanic and
  type), whatever the number of records. The history endpoint is paginated for clients that want
  pages.
- Search runs its maintenance filters as a single `EXISTS` subquery, so there are no duplicate
  rows and no `distinct()`. Office summary and workload are one aggregate query each.
  Maintenance-due reads each vehicle's latest record with a correlated subquery.
- Indexes follow the query paths: `(vehicle, -performed_on, -id)` for history and the latest
  record, `(mechanic, performed_on)` for workload, `(performed_on)` for the default record
  ordering, and `(office, active)` for office filters.
- Summary and workload return plain lists (one row per office or mechanic, like the example).
  Other collections are paginated.
- Deleting a vehicle deletes its maintenance history. Set `active=false` to retire a vehicle
  instead.
- The seed is small and scenario-focused instead of large random data (no Faker), so it is
  deterministic and easy to check by hand.

### Left out on purpose (production concerns)

PostgreSQL and deployment, secrets and settings from the environment (`SECRET_KEY`, `DEBUG`,
`ALLOWED_HOSTS`, CORS, which currently allows all origins), JWT lifetime/rotation tuning, rate
limiting, monitoring, turning concurrent unique-constraint errors into 400s, stronger input
normalization, and office assignment history.
