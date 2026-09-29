COMPOSE := docker compose
SERVICE := backend

.DEFAULT_GOAL := help

.PHONY: help build up start down logs shell migrate seed seed-large seed-clear test load-test load-test-ui format format-check django-check migrations-check check

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z_-]+:.*## / {printf "%-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the backend image
	$(COMPOSE) build

up: ## Build and run the API in the foreground
	$(COMPOSE) up --build

start: ## Build and run the API in the background
	$(COMPOSE) up --build --detach --wait

down: ## Stop the containers
	$(COMPOSE) down

logs: ## Follow the backend logs
	$(COMPOSE) logs --follow $(SERVICE)

shell: build ## Open a shell in a temporary backend container
	$(COMPOSE) run --rm $(SERVICE) sh

migrate: build ## Apply database migrations
	$(COMPOSE) run --rm $(SERVICE) python manage.py migrate

seed: migrate ## Fill an empty database with dummy data
	$(COMPOSE) run --rm $(SERVICE) python manage.py seed_data

seed-large: migrate ## Fill an empty database with a performance testing dataset
	$(COMPOSE) run --rm $(SERVICE) python manage.py seed_data \
		--offices 20 \
		--vehicles 100 \
		--mechanics 30 \
		--maintenance-records 20000 \
		--seed 42

seed-clear: migrate ## Replace existing fleet data with dummy data
	$(COMPOSE) run --rm $(SERVICE) python manage.py seed_data --clear

test: build ## Run the test suite
	$(COMPOSE) run --rm $(SERVICE) pytest

load-test load-test-ui: export DJANGO_LOG_SQL = false

load-test: start ## Run the headless load test
	$(COMPOSE) --profile load-test run --rm locust \
		locust --locustfile load_tests/locustfile.py \
		--host http://backend:8000 \
		--headless \
		--users 20 \
		--spawn-rate 5 \
		--run-time 30s \
		--stop-timeout 5s \
		--only-summary

load-test-ui: start ## Open the Locust UI at http://localhost:8089
	$(COMPOSE) --profile load-test up locust

format: build ## Format the backend code with Black
	$(COMPOSE) run --rm $(SERVICE) black .

format-check: build ## Check formatting without changing files
	$(COMPOSE) run --rm $(SERVICE) black --check .

django-check: build ## Run Django system checks
	$(COMPOSE) run --rm $(SERVICE) python manage.py check

migrations-check: build ## Check for missing migrations
	$(COMPOSE) run --rm $(SERVICE) python manage.py makemigrations --check --dry-run

check: format-check test django-check migrations-check ## Run all project checks
