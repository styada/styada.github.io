.PHONY: dev-install dev-start

dev-install:
	@echo "Installing dependencies..."
	npm install

dev-start:
	@echo "Starting the development server..."
	npm run dev