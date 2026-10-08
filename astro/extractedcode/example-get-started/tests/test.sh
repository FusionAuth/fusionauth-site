#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
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
npm ci
npx tsc --noEmit

# Step 7 displays snippets from tests/example.spec.ts; this runner stays docs-only.
# These routes work without a FusionAuth instance and catch a broken copied app.
# The external example's Playwright workflow covers the complete login journey.
node --experimental-strip-types src/index.mts >"$APP_LOG" 2>&1 &
APP_PID=$!
for attempt in $(seq 1 30); do
  if curl -fsS --max-time 2 http://localhost:8080/ >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    cat "$APP_LOG" >&2
    exit 1
  fi
  if [ "$attempt" -eq 30 ]; then
    cat "$APP_LOG" >&2
    echo "Example app did not start on port 8080" >&2
    exit 1
  fi
  sleep 1
done

curl -fsS http://localhost:8080/ | grep 'href="/login"' > /dev/null
login_headers="$(curl -sS -D - -o /dev/null http://localhost:8080/login)"
printf '%s\n' "$login_headers" | grep -q '^HTTP/1.1 302'
printf '%s\n' "$login_headers" | grep -qi '^location: http://localhost:9011/oauth2/authorize?'
account_headers="$(curl -sS -D - -o /dev/null http://localhost:8080/account)"
printf '%s\n' "$account_headers" | grep -q '^HTTP/1.1 302'
printf '%s\n' "$account_headers" | grep -qi '^location: /login'

echo "Typecheck and logged-out app smoke test passed"
