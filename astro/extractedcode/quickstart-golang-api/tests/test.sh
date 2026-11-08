#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_DIR/complete-application"
APP_LOG="$SCRIPT_DIR/app.log"
BINARY="$APP_DIR/golang-api"
APP_PID=""

FA_URL="http://localhost:9011"
API_URL="http://localhost:9001"
APP_ID="e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"
API_KEY="this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"

pass() { echo "  ✓ $1"; }
fail() { echo "  ✗ $1"; exit 1; }

cleanup() {
  echo ""
  echo "Cleaning up..."
  if [ -n "$APP_PID" ]; then
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
  fi
  docker compose -f "$REPO_DIR/docker-compose.yml" --env-file "$REPO_DIR/.env" down -v --remove-orphans 2>/dev/null || true
  rm -f "$APP_LOG"
}
trap cleanup EXIT

# ── Preflight ──────────────────────────────────────────────────────────
echo "Validating docker compose config..."
docker compose -f "$REPO_DIR/docker-compose.yml" --env-file "$REPO_DIR/.env" config > /dev/null
pass "docker compose config is valid"

# ── Start FusionAuth stack ─────────────────────────────────────────────
echo ""
echo "Starting FusionAuth stack..."
docker compose -f "$REPO_DIR/docker-compose.yml" --env-file "$REPO_DIR/.env" up -d

echo "Waiting for FusionAuth to be ready (may take a few minutes)..."
for i in $(seq 1 60); do
  if curl -sf --max-time 5 "$FA_URL/api/status" > /dev/null 2>&1; then
    echo ""
    pass "FusionAuth ready (attempt $i/60)"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo ""
    echo "FusionAuth logs:"
    docker compose -f "$REPO_DIR/docker-compose.yml" logs --tail=30 fusionauth
    fail "FusionAuth did not start within 5 minutes"
  fi
  printf '.'
  sleep 5
done

# ── Verify kickstart created the application ──────────────────────────
# FA reports status 200 as soon as the HTTP server starts; kickstart runs shortly after.
echo ""
echo "Verifying kickstart..."
for i in $(seq 1 15); do
  app_status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    -H "Authorization: $API_KEY" \
    "$FA_URL/api/application/$APP_ID")
  if [ "$app_status" = "200" ]; then
    pass "Kickstart created application $APP_ID (attempt $i/15)"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "Application $APP_ID not found (HTTP $app_status) — kickstart may have failed"
    echo "FA logs:"
    docker compose -f "$REPO_DIR/docker-compose.yml" logs --tail=60 fusionauth
    fail "Kickstart did not create the application"
  fi
  printf '.'
  sleep 2
done

# ── Build the Go app ───────────────────────────────────────────────────
echo ""
echo "Building complete-application..."
(cd "$APP_DIR" && go mod tidy && go build -o "$BINARY" .) 2>&1
pass "go build succeeded"

# ── Start the app ─────────────────────────────────────────────────────
echo ""
echo "Starting app on port 9001..."
(cd "$APP_DIR" && "$BINARY") > "$APP_LOG" 2>&1 &
APP_PID=$!

echo "Waiting for app to be ready..."
for i in $(seq 1 30); do
  status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$API_URL/make-change?total=1.00" 2>/dev/null)
  if [ -n "$status" ] && [ "$status" != "000" ]; then
    echo ""
    pass "App ready on port 9001 (attempt $i/30)"
    break
  fi
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo ""
    echo "App output:"
    cat "$APP_LOG"
    fail "App exited unexpectedly"
  fi
  if [ "$i" -eq 30 ]; then
    echo ""
    fail "App did not start within 60 seconds"
  fi
  printf '.'
  sleep 2
done

# ── Helper: get a login token ──────────────────────────────────────────
get_token() {
  local email="$1"
  local password="$2"
  local tmpfile http_code
  tmpfile=$(mktemp)
  http_code=$(curl -s --max-time 10 \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"loginId\":\"$email\",\"password\":\"$password\",\"applicationId\":\"$APP_ID\"}" \
    -o "$tmpfile" -w '%{http_code}' \
    "$FA_URL/api/login")
  if [ "$http_code" != "200" ]; then
    echo "FA /api/login returned HTTP $http_code for $email: $(cat "$tmpfile")" >&2
    rm -f "$tmpfile"
    return 1
  fi
  python3 -c "import json,sys; print(json.load(sys.stdin)['token'])" < "$tmpfile"
  local rc=$?
  rm -f "$tmpfile"
  return $rc
}

# ── Tests ──────────────────────────────────────────────────────────────
echo ""
echo "Running tests..."
PASS=0
FAIL=0

run_test() {
  local desc="$1"; shift
  echo "  $desc"
  if "$@" 2>&1; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
}

status_of() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$@"
}

# Test 1: /make-change returns 401 without token
test_make_change_no_token() {
  local status
  status=$(status_of "$API_URL/make-change?total=1.00")
  [ "$status" = "401" ] || { fail "expected 401, got $status"; return 1; }
  pass "returned 401"
}

# Test 2: /panic returns 401 without token
test_panic_no_token() {
  local status
  status=$(status_of -X POST "$API_URL/panic")
  [ "$status" = "401" ] || { fail "expected 401, got $status"; return 1; }
  pass "returned 401"
}

# Test 3: FusionAuth admin UI is accessible
test_fusionauth_admin() {
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 10 "$FA_URL/admin")
  [ "$status" = "200" ] || { fail "expected 200, got $status"; return 1; }
  pass "FusionAuth admin UI returned 200"
}

# Test 4: teller can access /make-change
test_teller_make_change() {
  local token status
  token=$(get_token "teller@example.com" "password") || { fail "could not get teller token"; return 1; }
  status=$(status_of --cookie "app.at=$token" "$API_URL/make-change?total=1.02")
  [ "$status" = "200" ] || { fail "expected 200, got $status"; return 1; }
  pass "teller got 200 on /make-change"
}

# Test 5: teller can access /panic
test_teller_panic() {
  local token status
  token=$(get_token "teller@example.com" "password") || { fail "could not get teller token"; return 1; }
  status=$(status_of -X POST --cookie "app.at=$token" "$API_URL/panic")
  [ "$status" = "200" ] || { fail "expected 200, got $status"; return 1; }
  pass "teller got 200 on /panic"
}

# Test 6: customer can access /make-change
test_customer_make_change() {
  local token status
  token=$(get_token "customer@example.com" "password") || { fail "could not get customer token"; return 1; }
  status=$(status_of --cookie "app.at=$token" "$API_URL/make-change?total=3.24")
  [ "$status" = "200" ] || { fail "expected 200, got $status"; return 1; }
  pass "customer got 200 on /make-change"
}

# Test 7: customer cannot access /panic
test_customer_panic_forbidden() {
  local token status
  token=$(get_token "customer@example.com" "password") || { fail "could not get customer token"; return 1; }
  status=$(status_of -X POST --cookie "app.at=$token" "$API_URL/panic")
  [ "$status" = "401" ] || { fail "expected 401, got $status"; return 1; }
  pass "customer got 401 on /panic"
}

run_test "/make-change without token returns 401" test_make_change_no_token
run_test "/panic without token returns 401" test_panic_no_token
run_test "FusionAuth admin UI accessible" test_fusionauth_admin
run_test "teller can access /make-change" test_teller_make_change
run_test "teller can access /panic" test_teller_panic
run_test "customer can access /make-change" test_customer_make_change
run_test "customer cannot access /panic (401)" test_customer_panic_forbidden

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
echo "All tests passed!"
