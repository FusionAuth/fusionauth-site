#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=33052c8a-c283-4e96-9d2a-eb1215c69f8f-not-for-prod

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs device-limit-app 2>&1 | tail -40 || true
  fi
  echo "Cleaning up..."
  docker rm -f device-limit-app > /dev/null 2>&1 || true
  if [ "${status:-0}" -ne 0 ]; then (cd "$PROJECT_DIR" && docker compose logs --tail 80 2>&1) || true; fi
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
  curl -sfL http://localhost:9011/admin/ 2>/dev/null | grep -q "<title>Login"
}

# the tenant update is the last request in the kickstart
kickstart_done() {
  curl -sf http://localhost:9011/api/tenant/d7d09513-a3f5-401c-9685-34ab6c552453 -H "Authorization: $API_KEY" |
    python3 -c 'import json, sys; sys.exit(0 if json.load(sys.stdin)["tenant"].get("themeId") not in (None, "75a068fd-e94b-451a-9aeb-3ddb9a3b5987") else 1)'
}

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Pulling images..."
docker compose pull

echo "Starting FusionAuth..."
docker compose up -d

wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done
python3 "$SCRIPT_DIR/check-kickstart.py"

# a copy keeps node_modules out of the repo
echo "Starting the app..."
docker run -d --network host --name device-limit-app -v "$PROJECT_DIR/complete-application":/src:ro node:20 bash -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && npm run dev" > /dev/null
wait_for "the app" curl -sf http://localhost:8080/

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"

echo "Checking the login webhook refused the third device..."
docker logs device-limit-app 2>&1 | grep -q "User is not allowed to log in."
