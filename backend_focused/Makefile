COMPOSE := docker compose
SERVICE := backend

.DEFAULT_GOAL := help

.PHONY: help build up start down logs shell migrate seed seed-clear test format format-check django-check migrations-check check

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z_-]+:.*## / {printf "%-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the backend image
	$(COMPOSE) build

up: ## Build and run the API in the foreground
	$(COMPOSE) up --build

start: ## Build and run the API in the background
	$(COMPOSE) up --build --detach

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

seed-clear: migrate ## Replace existing fleet data with dummy data
	$(COMPOSE) run --rm $(SERVICE) python manage.py seed_data --clear

test: build ## Run the test suite
	$(COMPOSE) run --rm $(SERVICE) pytest

format: build ## Format the backend code with Black
	$(COMPOSE) run --rm $(SERVICE) black .

format-check: build ## Check formatting without changing files
	$(COMPOSE) run --rm $(SERVICE) black --check .

django-check: build ## Run Django system checks
	$(COMPOSE) run --rm $(SERVICE) python manage.py check

migrations-check: build ## Check for missing migrations
	$(COMPOSE) run --rm $(SERVICE) python manage.py makemigrations --check --dry-run

check: format-check test django-check migrations-check ## Run all project checks
