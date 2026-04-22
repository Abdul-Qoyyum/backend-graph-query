#!/bin/bash

set -e

echo "🧪 Running tests in Docker..."

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up..."
    docker compose -f docker-compose.yml down -v
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Parse arguments
COVERAGE=false
WATCH=false
SPECIFIC_TEST=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --coverage) COVERAGE=true ;;
        --watch) WATCH=true ;;
        --test) SPECIFIC_TEST="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Build test image
echo "📦 Building test image..."
docker compose -f docker-compose.yml build test

# Run tests based on options
if [ "$WATCH" = true ]; then
    echo "👀 Running tests in watch mode..."
    docker compose -f docker-compose.yml run --rm test-watch
elif [ "$COVERAGE" = true ]; then
    echo "📊 Running tests with coverage..."
    docker compose -f docker-compose.yml run --rm test-coverage
    echo "✅ Coverage report generated in ./coverage directory"
elif [ -n "$SPECIFIC_TEST" ]; then
    echo "🎯 Running specific test: $SPECIFIC_TEST"
    docker compose -f docker-compose.yml run --rm test npm test -- "$SPECIFIC_TEST"
else
    echo "🚀 Running all tests..."
    docker compose -f docker-compose.yml run --rm test
fi

echo "✨ Tests completed!"