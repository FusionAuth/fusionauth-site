#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cleanup() {
  echo "Cleaning up..."
  docker stop springboot-api 2>/dev/null || true
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Building complete-application..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app maven:3.9-eclipse-temurin-17 mvn -q package -DskipTests

echo "Starting FusionAuth..."
docker compose up -d

echo "Waiting for FusionAuth to be ready..."
until curl -sf http://localhost:9011 > /dev/null 2>&1; do
  echo "  Waiting for FusionAuth..."
  sleep 5
done

echo "Waiting for Kickstart to finish (application to exist)..."
until curl -sf http://localhost:9011/api/application/e9fdb985-9173-4e01-9d73-ac2d60d1dc8e \
  -H "Authorization: this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works" > /dev/null 2>&1; do
  echo "  Waiting for Kickstart..."
  sleep 5
done
echo "FusionAuth is ready."

echo "Starting Spring Boot API app..."
docker run --network host --name springboot-api --rm -v "$PROJECT_DIR/complete-application":/app -w /app maven:3.9-eclipse-temurin-17 mvn -q spring-boot:run &
until docker inspect springboot-api > /dev/null 2>&1; do
  sleep 1
done
docker logs -f springboot-api &
LOGS_PID=$!

echo "Waiting for Spring Boot API app to be ready..."
until [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:8080/panic 2>/dev/null)" = "401" ]; do
  echo "  Waiting for Spring Boot API app..."
  sleep 5
done
echo "Spring Boot API app is ready."

echo "Running login/authorization tests..."
"$SCRIPT_DIR/login-test.sh"
TEST_EXIT_CODE=$?

kill $LOGS_PID 2>/dev/null || true

exit $TEST_EXIT_CODE
