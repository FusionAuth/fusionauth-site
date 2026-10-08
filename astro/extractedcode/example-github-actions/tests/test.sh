#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs github-actions-app 2>&1 | tail -40 || true
  fi
  echo "Cleaning up..."
  docker rm -f github-actions-app > /dev/null 2>&1 || true
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

# the workflow is the example, so check it before running the same steps it does
echo "Linting the example workflow..."
docker run --rm -v "$PROJECT_DIR":/repo -w /repo rhysd/actionlint:latest .github/workflows/test.yaml

echo "Validating docker compose config..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yml config > /dev/null

echo "Pulling images..."
docker compose pull

echo "Starting FusionAuth in Docker..."
docker compose up -d

wait_for "FusionAuth" fusionauth_ready
wait_for "Kickstart" kickstart_done
python3 "$SCRIPT_DIR/check-kickstart.py"

# node 18 matches the workflow's setup-node step; a copy keeps node_modules out of the repo
echo "Starting the app..."
docker run -d --network host --name github-actions-app -v "$PROJECT_DIR/app":/src:ro node:18 bash -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && npm run start" > /dev/null
wait_for "the app" curl -sf http://localhost:3000/

# the example's own Playwright tests, with the browsers its lockfile's Playwright version expects
echo "Running the example's Playwright tests..."
docker run --rm --network host -e CI=true -v "$PROJECT_DIR/app":/src:ro mcr.microsoft.com/playwright:v1.40.1-jammy bash -c \
  "cp -r /src /app && cd /app && npm ci --no-audit --no-fund --loglevel=error && npx playwright test --project=chromium"
