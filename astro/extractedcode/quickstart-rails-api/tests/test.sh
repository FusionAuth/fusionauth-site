#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

LOGS_PID=""

# Seconds to wait for a service to come up before giving up. Without this the
# readiness loops below can hang until the CI job's own time limit.
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop rails-api 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

# wait_for <description> <command...> - poll until the command succeeds or the
# timeout expires, failing loudly rather than hanging.
wait_for() {
  local description="$1"; shift
  local deadline=$(( SECONDS + READINESS_TIMEOUT ))
  until "$@" > /dev/null 2>&1; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "Timed out after ${READINESS_TIMEOUT}s waiting for ${description}." >&2
      return 1
    fi
    echo "  Waiting for ${description}..."
    sleep 5
  done
  echo "${description} is ready."
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Installing gems for complete-application..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app ruby:3.4.10 sh -c "bundle install --quiet"

echo "Syntax-checking complete-application Ruby files..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app ruby:3.4.10 sh -c \
  "find app config -name '*.rb' -print0 | xargs -0 -n1 ruby -c"

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Starting Rails API app..."
rm -f "$PROJECT_DIR/complete-application/tmp/pids/server.pid"
docker run --network host --name rails-api --rm -v "$PROJECT_DIR/complete-application":/app -w /app ruby:3.4.10 sh -c \
  "bundle install --quiet && bundle exec rails s -p 4001 -b 0.0.0.0" &
until docker inspect rails-api > /dev/null 2>&1; do
  sleep 1
done
docker logs -f rails-api &
LOGS_PID=$!

# Checks for the rendered login page rather than just an open port, so the test
# does not start before Kickstart has finished configuring FusionAuth.
fusionauth_ready() {
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"
}

# The API is protected, so an unauthenticated request returning 401 is what
# tells us it is up and enforcing authentication.
rails_ready() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4001/panic 2>/dev/null)" = "401" ]
}

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready

echo "Waiting for Rails API app to be ready..."
wait_for "Rails API app" rails_ready

echo "Running login/authorization tests..."
"$SCRIPT_DIR/login-test.sh"
TEST_EXIT_CODE=$?

kill $LOGS_PID 2>/dev/null || true

exit $TEST_EXIT_CODE
