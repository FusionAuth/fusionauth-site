#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=33052c8a-c283-4e96-9d2a-eb1215c69f8f
WEBHOOK_ID=c8f5a3d4-6f1e-4b8a-9e2d-7a1b3c5d9e01
LISTENER_LOG="$(mktemp)"
LISTENER_PID=""

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    echo "Listener output:"
    cat "$LISTENER_LOG" || true
    (cd "$PROJECT_DIR" && docker compose logs --tail 80 2>&1) || true
  fi
  echo "Cleaning up..."
  if [ -n "$LISTENER_PID" ]; then kill "$LISTENER_PID" 2>/dev/null || true; wait "$LISTENER_PID" 2>/dev/null || true; fi
  rm -f "$LISTENER_LOG"
  cd "$PROJECT_DIR" && docker compose down -v 2>/dev/null || true
}
trap cleanup EXIT

# wait_for <description> <command...> - poll until the command succeeds or the timeout expires
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

# kickstart creates the webhook last, so its existence means kickstart finished
webhook_ready() {
  curl -sf -H "Authorization: $API_KEY" "http://localhost:9011/api/webhook/$WEBHOOK_ID"
}

echo "Checking listener syntax..."
for app in simple/app.js signature-verify/app.js event-context/app.js event-context/create-user.js; do
  node --check "$PROJECT_DIR/$app"
done

echo "Starting FusionAuth..."
(cd "$PROJECT_DIR" && docker compose up -d)
wait_for "FusionAuth Kickstart" webhook_ready

echo "Starting the event-context listener..."
(cd "$PROJECT_DIR/event-context" && npm install --silent)
node "$PROJECT_DIR/event-context/app.js" > "$LISTENER_LOG" 2>&1 &
LISTENER_PID=$!
wait_for "the listener" grep -q "running on port" "$LISTENER_LOG"

echo "Checking that the listener rejects requests without the webhook secret..."
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" \
  -d '{"event":{"type":"user.create","info":{"data":{"traceId":"forged"}}}}' http://localhost:3030/webhook)
if [ "$status" != "401" ]; then
  echo "FAIL: the listener returned $status for a request without the secret, expected 401" >&2
  exit 1
fi
if grep -q "forged" "$LISTENER_LOG"; then
  echo "FAIL: the listener processed a forged event" >&2
  exit 1
fi

echo "Creating a user with eventInfo.data..."
output=$(node "$PROJECT_DIR/event-context/create-user.js")
echo "  $output"
trace_id="${output##* }"

# FusionAuth sends the webhook asynchronously, so poll the listener output
deadline=$(( SECONDS + 30 ))
until grep -q "received user.create with traceId $trace_id from billing-service" "$LISTENER_LOG"; do
  if [ "$SECONDS" -ge "$deadline" ]; then
    echo "FAIL: the webhook never received traceId $trace_id in event.info.data" >&2
    exit 1
  fi
  sleep 1
done

echo "OK: the user.create webhook carried traceId $trace_id in event.info.data."
