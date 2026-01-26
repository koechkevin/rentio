.PHONY: help install dev build start clean docker-up docker-down docker-logs db-migrate db-studio db-seed lint format

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	yarn install

dev: ## Start development server
	yarn run dev

build: ## Build for production
	yarn run build

start: ## Start production server
	yarn start

clean: ## Clean build artifacts and dependencies
	rm -rf dist node_modules

up: ## Start Docker containers
	docker-compose --env-file .env up --build

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

rebuild: ## Rebuild and restart Docker containers
	docker-compose down -v
	docker-compose --env-file .env up --build

db-migrate: ## Run database migrations
	npx prisma migrate dev

db-studio: ## Open Prisma Studio
	npx prisma studio

db-seed: ## Seed database
	yarn run prisma:seed

db-reset: ## Reset database
	npx prisma migrate reset

lint: ## Run linter
	yarn run lint

format: ## Format code
	npm run format

setup: install docker-up db-migrate db-seed ## Complete project setup
	@echo "✅ Setup complete! Run 'make dev' to start the server"