#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_PID=""
READINESS_TIMEOUT=300

cleanup() {
  echo "Cleaning up..."
  [ -n "$LOGS_PID" ] && kill "$LOGS_PID" 2>/dev/null || true
  docker stop testApp 2>/dev/null || true
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

fusionauth_ready() {
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "Login | FusionAuth"
}

create_lambda() {
  local api_key="$1"
  local fa_url="$2"

  curl -sfL -X POST "${fa_url}/api/lambda" \
    -H "Authorization: ${api_key}" \
    -H "Content-Type: application/json" \
    -d '{
      "lambda": {
        "id": "f3b3b547-7754-452d-8729-21b50d111505",
        "body": "function populate(jwt, user, registration) {\n  jwt.message = '\''Hello World!'\'';\n  console.info('\''Hello World!'\'');\n}",
        "debug": true,
        "engineType": "graalJS",
        "name": "[ATest]",
        "type": "JWTPopulate"
      }
    }'

  curl -sfL -X PATCH "${fa_url}/api/application/E9FDB985-9173-4E01-9D73-AC2D60D1DC8E" \
    -H "Authorization: ${api_key}" \
    -H "Content-Type: application/json" \
    -d '{
      "application": {
        "jwtConfiguration": {
          "enabled": true
        },
        "lambdaConfiguration": {
          "accessTokenPopulateId": "f3b3b547-7754-452d-8729-21b50d111505"
        }
      }
    }'
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Pulling latest FusionAuth image..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

echo "Installing Node.js app dependencies..."
docker run --rm -v "$PROJECT_DIR/complete-application:/app" -w /app node:26 sh -c \
  "npm install"

echo "Starting Node.js app..."
docker run --network host --name testApp --rm -v "$PROJECT_DIR/complete-application":/app -w /app \
  -e CLIENT_ID=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e \
  -e CLIENT_SECRET=super-secret-secret-that-should-be-regenerated-for-production \
  -e BASE_URL=http://localhost:9011 \
  node:26 sh -c "npm start" &
NODE_PID=$!
until docker inspect testApp > /dev/null 2>&1; do
  sleep 1
done
docker logs -f testApp &
LOGS_PID=$!

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready

echo "Creating lambda..."
create_lambda "lambda_testing_key" "http://localhost:9011"

echo "Waiting for Node.js app to be ready..."
wait_for "Node.js app" curl -sf http://localhost:3000

echo "Running Playwright tests..."
cd "$SCRIPT_DIR"
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"
TEST_EXIT_CODE=$?

exit $TEST_EXIT_CODE
