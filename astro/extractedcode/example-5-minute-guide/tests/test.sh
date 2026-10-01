#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_LOG="$(mktemp)"
APP_PID=""

cleanup() {
  if [ -n "$APP_PID" ]; then
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
  fi
  rm -f "$APP_LOG"
}
trap cleanup EXIT

cd "$PROJECT_DIR"
npm ci --ignore-scripts --no-audit
node --check app.js
node --check < bin/www
node --check routes/index.js

PORT="$(node -e 'const server = require("node:net").createServer(); server.listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });')"
PORT="$PORT" CLIENT_ID=test-client CLIENT_SECRET=test-secret BASE_URL=http://localhost:9011 node bin/www >"$APP_LOG" 2>&1 &
APP_PID=$!

for attempt in $(seq 1 30); do
  if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/" 2>/dev/null | grep -q 'oauth2/authorize'; then
    break
  fi
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    cat "$APP_LOG" >&2
    exit 1
  fi
  if [ "$attempt" -eq 30 ]; then
    cat "$APP_LOG" >&2
    echo "Example app did not start" >&2
    exit 1
  fi
  sleep 1
done

curl -fsS "http://127.0.0.1:$PORT/" | grep -q 'client_id=test-client'
curl -fsS "http://127.0.0.1:$PORT/" | grep -q 'code_challenge_method=S256'
test "$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/logout")" = 302

echo "Five-minute example install, syntax, login link, and logout smoke test passed"
