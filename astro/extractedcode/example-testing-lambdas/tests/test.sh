#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(cd "$PROJECT_DIR/../../.." && pwd)"
READINESS_TIMEOUT=300

# the same file readers download from /docs/docker-compose.yml, so the image follows fusionauth-version
compose() {
  INSTALLATION_SOURCE=fusionauth-example-testing-lambdas \
    docker compose -f "$REPO_ROOT/astro/public/docs/docker-compose.yml" --project-directory "$PROJECT_DIR" "$@"
}

cleanup() {
  echo "Cleaning up..."
  compose down -v 2>/dev/null || true
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
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep "<title>Login</title>" > /dev/null
}

create_lambda() {
  local api_key="$1"
  local fa_url="$2"
  local response http_code body lambda_id
  response=$(jq -n --rawfile body "$PROJECT_DIR/complete-application/role-permissions.js" \
      '{lambda: {body: $body, name: "[ATest]", type: "JWTPopulate"}}' |
    curl -s -X POST "${fa_url}/api/lambda/f3b3b547-7754-452d-8729-21b50d111505" \
      -H "Authorization: ${api_key}" \
      -H "Content-Type: application/json" \
      -w "\n%{http_code}" \
      -d @-)
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
    echo "Failed to create lambda (HTTP $http_code): $body" >&2
    return 1
  fi
  response=$(curl -s -X PATCH "${fa_url}/api/application/E9FDB985-9173-4E01-9D73-AC2D60D1DC8E" \
    -H "Authorization: ${api_key}" \
    -H "Content-Type: application/json" \
    -w "\n%{http_code}" \
    -d '{
      "application": {
        "lambdaConfiguration": {
          "accessTokenPopulateId": "f3b3b547-7754-452d-8729-21b50d111505"
        }
      }
    }')
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
    echo "Failed to configure application (HTTP $http_code): $body" >&2
    return 1
  fi
}

echo "Validating docker compose config..."
compose config > /dev/null

echo "Pulling the FusionAuth image..."
compose pull

echo "Starting FusionAuth..."
compose up -d

# lambda.test.mjs imports the harness from the lambda examples
echo "Copying the lambda harness..."
rm -rf "$PROJECT_DIR/complete-application/harness" "$PROJECT_DIR/complete-application/lambdas"
cp -R "$REPO_ROOT/astro/extractedcode/example-lambdas/harness" "$PROJECT_DIR/complete-application/harness"

echo "Waiting for FusionAuth to be ready..."
wait_for "FusionAuth" fusionauth_ready

echo "Creating lambda..."
create_lambda "lambda_testing_key" "http://localhost:9011"

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js -v "$PROJECT_DIR/complete-application":/app -w /tests mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && cd /app && npm install && cd /tests && npx playwright test"
