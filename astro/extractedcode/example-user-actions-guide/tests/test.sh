#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=user-actions-guide-test-api-key-not-for-production
USER_ID=00000000-0000-0000-0000-111111111111
ADMIN_ID=00000000-0000-0000-0000-000000000001
BAN_ACTION_ID=b96a0548-e87c-42dd-887c-31294ca10c8b

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs user-actions-app 2>&1 | tail -40 || true
  fi
  echo "Cleaning up..."
  docker rm -f user-actions-app > /dev/null 2>&1 || true
  if [ "${status:-0}" -ne 0 ]; then docker compose -f "$SCRIPT_DIR/docker-compose.yml" logs --tail 80 2>&1 || true; fi
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" down -v 2>/dev/null || true
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

# the expiry reason is the last request in the test kickstart
kickstart_done() {
  curl -sf http://localhost:9011/api/user-action-reason/28b0dd40-3a65-48ae-8eb3-4d63d253180a -H "Authorization: $API_KEY"
}

post_json() {
  curl -sf -o /dev/null -w '%{http_code}' -X POST "http://localhost:3000$1" -H 'Content-Type: application/json' -d "$2"
}

echo "Checking the app's syntax..."
docker run --rm -v "$PROJECT_DIR":/app:ro -w /app node:20 bash -c 'node --check app.js && node --check routes/index.js && node --check bin/www'

# the guide assumes readers already have FusionAuth set up, so the test brings its own (tests/kickstart)
echo "Starting FusionAuth..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" pull --quiet
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
wait_for "FusionAuth" kickstart_done

# a copy keeps node_modules out of the repo; the environment overrides the .env.sample placeholders
echo "Starting the app..."
docker run -d --network host --name user-actions-app -v "$PROJECT_DIR":/src:ro \
  -e CLIENT_ID=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e -e CLIENT_SECRET=super-secret-secret-that-should-be-regenerated-for-production \
  -e BASE_URL=http://localhost:9011 -e API_KEY="$API_KEY" node:20 bash -c \
  "cp -r /src /app && cd /app && cp .env.sample .env && npm ci --no-audit --no-fund --loglevel=error && npm start" > /dev/null
wait_for "the app" curl -sf http://localhost:3000/

echo "Running Playwright tests..."
docker run --network host --name playwright-test --rm -e NODE_PATH=/usr/lib/node_modules -v "$SCRIPT_DIR/integration.spec.js":/tests/integration.spec.js \
  mcr.microsoft.com/playwright:v1.62.0 bash -c "npm install -g @playwright/test@1.62.0 && playwright test /tests/integration.spec.js"

# FusionAuth posts user action events to these webhooks; the Intercom and Slack ones stand in for those services and log what they get
echo "Sending sample events to the Intercom and Slack webhooks..."
[ "$(post_json /intercom '{"event": {"type": "user.action", "action": "Subscribe", "phase": "start"}}')" = 200 ]
[ "$(post_json /slack '{"event": {"type": "user.action", "action": "Subscribe", "phase": "start"}}')" = 200 ]
docker logs user-actions-app 2>&1 | grep "Incoming Request to Intercom:" > /dev/null
docker logs user-actions-app 2>&1 | grep "Incoming Request to Slack:" > /dev/null

echo "Ending the subscription, which should ban the user..."
expire_event="$(printf '{"event": {"type": "user.action", "action": "Subscribe", "phase": "end", "actioneeUserId": "%s", "actionerUserId": "%s"}}' "$USER_ID" "$ADMIN_ID")"
[ "$(post_json /expire "$expire_event")" = 200 ]
docker logs user-actions-app 2>&1 | grep "User banned successfully" > /dev/null
curl -sf "http://localhost:9011/api/user/action?userId=$USER_ID&active=true" -H "Authorization: $API_KEY" |
  python3 -c 'import json, sys; actions = json.load(sys.stdin).get("actions", []); assert any(a["userActionId"] == sys.argv[1] for a in actions), actions' "$BAN_ACTION_ID"

echo "All user actions checks passed."
