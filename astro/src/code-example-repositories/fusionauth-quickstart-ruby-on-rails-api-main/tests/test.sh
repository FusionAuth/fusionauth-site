#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cleanup() {
  echo "Cleaning up..."
  docker stop rails-api 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Installing gems for complete-application..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app ruby:2.7.5 sh -c "bundle install --quiet"

echo "Syntax-checking complete-application Ruby files..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app ruby:2.7.5 sh -c \
  "find app config -name '*.rb' -print0 | xargs -0 -n1 ruby -c"

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting Rails API app..."
rm -f "$PROJECT_DIR/complete-application/tmp/pids/server.pid"
docker run --network host --name rails-api --rm -v "$PROJECT_DIR/complete-application":/app -w /app ruby:2.7.5 sh -c \
  "bundle install --quiet && bundle exec rails s -p 4001 -b 0.0.0.0" &
until docker inspect rails-api > /dev/null 2>&1; do
  sleep 1
done
docker logs -f rails-api &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
until curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done
echo "FusionAuth is ready."

echo "Waiting for Rails API app to be ready..."
until [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4001/panic 2>/dev/null)" = "401" ]; do
  echo "  Waiting for Rails API app..."
  sleep 5
done
echo "Rails API app is ready."

echo "Running login/authorization tests..."
"$SCRIPT_DIR/login-test.sh"
TEST_EXIT_CODE=$?

kill $LOGS_PID 2>/dev/null || true

exit $TEST_EXIT_CODE
