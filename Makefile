.PHONY: help build up down logs test test-watch test-coverage clean dev prod shell

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build production Docker image
	docker-compose build api

build-dev: ## Build development Docker image
	docker-compose build dev

build-test: ## Build test Docker image
	docker-compose build test

up: ## Start production environment
	docker-compose up -d api

down: ## Stop all containers
	docker-compose down

logs: ## View logs
	docker-compose logs -f

dev: ## Start development environment with hot reload
	docker-compose up dev

prod: ## Start production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d api

test: ## Run all tests
	./scripts/run-tests.sh

test-watch: ## Run tests in watch mode
	./scripts/run-tests.sh --watch

test-coverage: ## Run tests with coverage report
	./scripts/run-tests.sh --coverage

test-specific: ## Run specific test (usage: make test-specific TEST=graph.service)
	./scripts/run-tests.sh --test "$(TEST)"

shell: ## Open shell in development container
	docker-compose exec dev sh

shell-prod: ## Open shell in production container
	docker-compose exec api sh

clean: ## Clean up Docker resources and coverage reports
	docker-compose down -v
	rm -rf coverage test-results
	docker system prune -f

restart: down up ## Restart production environment

logs-dev: ## View development logs
	docker-compose logs -f dev

logs-prod: ## View production logs
	docker-compose logs -f api

ps: ## List running containers
	docker-compose ps

inspect: ## Inspect running containers
	docker-compose ps -q | xargs docker inspect