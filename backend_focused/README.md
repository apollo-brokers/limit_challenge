# Fleet Maintenance API

REST API for managing offices, vehicles, mechanics, and vehicle maintenance history.

The original take-home assignment is available in [CHALLENGE.md](./CHALLENGE.md).

## Running the project

Docker and Docker Compose are required.

```bash
make start
make seed
```

The API will be available at `http://localhost:8000/api/`.

- API documentation: `http://localhost:8000/docs/`
- OpenAPI schema: `http://localhost:8000/api/schema/`
- Health check: `http://localhost:8000/health/`

To stop the project:

```bash
make down
```

## Frontend

With the API running, start the Next.js interface in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [Fleet Tracker at localhost:3000](http://localhost:3000). The frontend uses the local API at `http://localhost:8000/api` by default. See [frontend/README.md](./frontend/README.md) for API type generation, configuration, architecture, and checks.

## Demo

Watch the [silent end-to-end frontend demonstration](./docs/fleet-tracker-demo.mp4) (1 minute 59 seconds).

## Tests

```bash
make test
```

Run formatting, tests, Django checks, and migration checks together:

```bash
make check
```

## Seed data

Create a small dataset:

```bash
make seed
```

Create a larger dataset for performance testing:

```bash
make seed-large
```

Add four clearly named vehicles with large maintenance histories, preserving existing data:

```bash
make seed-performance
```

This adds `Veiculo 1 mil registros`, `Veiculo 10 mil registros`, `Veiculo 50 mil registros`, and `Veiculo 100 mil registros`: 161,000 maintenance records in total. Vehicles are listed newest first; the command creates them in reverse size order so these four initially appear at the top, from smallest to largest. Search for `Veiculo` or the specific model to find them again after other vehicles are added.

The command is repeatable: it reuses its reserved VINs and only fills missing records, without resetting the database or deleting extra records added later. Inserts are batched inside a transaction. SQL logging and Django debug query collection are disabled for this seed process, not the running API. With the API already running, the equivalent command is:

```bash
docker compose exec -T -e DJANGO_LOG_SQL=false -e DJANGO_DEBUG=false backend python manage.py seed_performance
```

Vehicle details return the entire history in one response. Rendering 50,000–100,000 table rows can be expensive in the browser; these deliberately large datasets stress both API response size and frontend rendering, beyond the challenge's hundreds-of-records scenario.

Replace existing data with a new dataset:

```bash
make seed-clear
```

## Main endpoints

| Resource | Endpoint |
| --- | --- |
| Offices CRUD | `/api/offices/` |
| Office summary | `/api/offices/summary/` |
| Vehicles CRUD and search | `/api/vehicles/` |
| Vehicle details | `/api/vehicles/{id}/` |
| Maintenance history | `/api/vehicles/{id}/maintenance-history/` |
| Assign office | `/api/vehicles/{id}/assign-office/` |
| Vehicles needing maintenance | `/api/vehicles/needing-maintenance/` |
| Duplicate vehicle check | `/api/vehicles/duplicate-check/` |
| Mechanics CRUD | `/api/mechanics/` |
| Mechanic workload | `/api/mechanics/workload/` |
| Maintenance records CRUD | `/api/maintenance-records/` |

Vehicle search supports free text (`search`: VIN, plate, make or model), `office`, `active`, `make`, `model`, maintenance date range, and mechanic certification number filters. Request examples are available in [`api.http`](./api.http).

Additional list filters support the frontend search forms:

- Offices: `search` by name or city.
- Mechanics: `search` by name or certification number, plus `active`.
- Maintenance records: `search` by service, notes, vehicle or mechanic; `vehicle`, `mechanic`, `maintenance_date_after`, and `maintenance_date_before`.

Filters combine and run before pagination. Date limits are inclusive. Summary and workload endpoints remain unfiltered.

## Performance testing

Locust was not required by the challenge. It was added to make load and stress testing repeatable, especially for endpoints that handle large maintenance histories.

Run the default Locust test:

```bash
make load-test
```

Open the Locust web interface:

```bash
make load-test-ui
```

## Assumptions

- Pagination was not explicitly required, so list endpoints and the maintenance history endpoint use page-number pagination with 10 records per page. Vehicle details still return the complete maintenance history as requested.
- No license plate format was specified, so the API accepts any non-empty value up to 20 characters instead of enforcing a country-specific pattern. Plate conflicts are checked without distinguishing uppercase and lowercase letters.
- The project structure was not specified, so the domain was divided into three Django apps: `offices`, `fleet`, and `maintenance`.

## Trade-offs

- Docker Compose was not required, but it provides a reproducible setup with a small number of commands. This makes the project easier to evaluate at the cost of requiring Docker.
- Locust was not required, but it provides a repeatable way to validate API performance. It is kept as a development dependency and its container only runs through the optional `load-test` profile.
- SQLite keeps the project easy to run without an additional database service, but a production environment would benefit from a database such as PostgreSQL.
- Vehicle details include the complete maintenance history as requested, which can produce a large response. Related data is prefetched to keep the number of database queries constant, and a separate paginated history endpoint is also available.
- Vehicle conflicts are checked in the service to provide clear API messages and enforced again with database constraints for data integrity. This intentionally duplicates part of the rule across two layers.
