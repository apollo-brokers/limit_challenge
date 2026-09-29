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

Vehicle search supports `office`, `active`, `make`, `model`, maintenance date range, and mechanic certification number filters. Request examples are available in [`api.http`](./api.http).

## Performance testing

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

- SQLite keeps the project easy to run without an additional database service, but a production environment would benefit from a database such as PostgreSQL.
- Vehicle details include the complete maintenance history as requested, which can produce a large response. Related data is prefetched to keep the number of database queries constant, and a separate paginated history endpoint is also available.
- Vehicle conflicts are checked in the service to provide clear API messages and enforced again with database constraints for data integrity. This intentionally duplicates part of the rule across two layers.
