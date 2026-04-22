#!/bin/bash

# This file contains useful Docker commands for the project

# ============================================
# PRODUCTION COMMANDS
# ============================================

# Build and run production container
docker build -t graph-query-api .
docker run -d -p 3000:3000 --name graph-api graph-query-api

# Run with custom port
docker run -d -p 8080:3000 --name graph-api graph-query-api

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --name graph-api \
  graph-query-api

# ============================================
# TESTING COMMANDS
# ============================================

# Build test image
docker build -f Dockerfile.test -t graph-query-test .

# Run all tests
docker run --rm graph-query-test npm test

# Run tests with coverage
docker run --rm \
  -v $(pwd)/coverage:/app/coverage \
  graph-query-test npm run test:coverage

# Run tests in watch mode
docker run --rm \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/tests:/app/tests \
  graph-query-test npm run test:watch

# Run specific test file
docker run --rm \
  graph-query-test npm test -- tests/unit/graph.service.test.ts

# ============================================
# DEVELOPMENT COMMANDS
# ============================================

# Build development image
docker build -f Dockerfile.dev -t graph-query-dev .

# Run development container with hot reload
docker run -d \
  -p 3000:3000 \
  -p 9229:9229 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/data:/app/data \
  --name graph-dev \
  graph-query-dev

# ============================================
# UTILITY COMMANDS
# ============================================

# View logs
docker logs -f graph-api

# Execute command in running container
docker exec -it graph-api sh

# Stop and remove container
docker stop graph-api && docker rm graph-api

# Clean up everything
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi graph-query-api graph-query-test graph-query-dev 2>/dev/null || true