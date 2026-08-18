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
  docker stop springboot-api 2>/dev/null || true
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

# FusionAuth answers on its root URL before Kickstart has finished creating the
# application, so both conditions have to be waited on separately.
kickstart_done() {
  curl -sf http://localhost:9011/api/application/e9fdb985-9173-4e01-9d73-ac2d60d1dc8e \
    -H "Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
}

# The API is protected, so an unauthenticated request returning 401 is what
# tells us it is up and enforcing authentication.
springboot_ready() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:8080/panic 2>/dev/null)" = "401" ]
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Building complete-application..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app maven:3.9-eclipse-temurin-17 mvn -q package -DskipTests

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" curl -sf http://localhost:9011

echo "Waiting for Kickstart to finish (application to exist)..."
wait_for "Kickstart" kickstart_done

echo "Starting Spring Boot API app..."
docker run --network host --name springboot-api --rm -v "$PROJECT_DIR/complete-application":/app -w /app maven:3.9-eclipse-temurin-17 mvn -q spring-boot:run &
until docker inspect springboot-api > /dev/null 2>&1; do
  sleep 1
done
docker logs -f springboot-api &
LOGS_PID=$!

echo "Waiting for Spring Boot API app to be ready..."
wait_for "Spring Boot API app" springboot_ready

echo "Running login/authorization tests..."
"$SCRIPT_DIR/login-test.sh"
TEST_EXIT_CODE=$?

kill $LOGS_PID 2>/dev/null || true

exit $TEST_EXIT_CODE
