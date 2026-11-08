#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_DIR/complete-application"
APP_LOG="$SCRIPT_DIR/app.log"
BINARY="$APP_DIR/changebank"
APP_PID=""

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
  if curl -sf --max-time 5 http://localhost:9011/api/status > /dev/null 2>&1; then
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

# ── Build the Go app ───────────────────────────────────────────────────
echo ""
echo "Building complete-application..."
(cd "$APP_DIR" && go mod tidy && go build -o "$BINARY" .) 2>&1
pass "go build succeeded"

# ── Start the app ─────────────────────────────────────────────────────
echo ""
echo "Starting app on port 8080..."
(cd "$APP_DIR" && "$BINARY") > "$APP_LOG" 2>&1 &
APP_PID=$!

echo "Waiting for app to be ready..."
for i in $(seq 1 30); do
  if curl -sf --max-time 3 http://localhost:8080/ > /dev/null 2>&1; then
    echo ""
    pass "App ready on port 8080 (attempt $i/30)"
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

# Helper: fetch response headers for a URL (no redirect follow)
headers_of() {
  curl -sD - -o /dev/null --max-time 10 "$1"
}

status_of() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$1"
}

# Test 1: Home page returns 200
test_home_page() {
  local status
  status=$(status_of "http://localhost:8080/")
  [ "$status" = "200" ] || { fail "expected 200, got $status"; return 1; }
  pass "returned 200"
}

# Test 2: /account redirects unauthenticated users to /
test_account_unauthenticated() {
  local headers status location
  headers=$(headers_of "http://localhost:8080/account")
  status=$(echo "$headers" | grep '^HTTP/' | awk '{print $2}')
  location=$(echo "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  [ "$status" = "302" ] || { fail "expected 302, got $status"; return 1; }
  echo "$location" | grep -qE '^/$|^http://localhost:8080/$' || { fail "expected redirect to /, got: $location"; return 1; }
  pass "302 → /"
}

# Test 3: /make-change redirects unauthenticated users to /
test_make_change_unauthenticated() {
  local headers status location
  headers=$(headers_of "http://localhost:8080/make-change")
  status=$(echo "$headers" | grep '^HTTP/' | awk '{print $2}')
  location=$(echo "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  [ "$status" = "302" ] || { fail "expected 302, got $status"; return 1; }
  echo "$location" | grep -qE '^/$|^http://localhost:8080/$' || { fail "expected redirect to /, got: $location"; return 1; }
  pass "302 → /"
}

# Test 4: /login redirects to FusionAuth OAuth authorize endpoint
test_login_redirect() {
  local headers status location
  headers=$(headers_of "http://localhost:8080/login")
  status=$(echo "$headers" | grep '^HTTP/' | awk '{print $2}')
  location=$(echo "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  [ "$status" = "302" ] || { fail "expected 302, got $status"; return 1; }
  echo "$location" | grep -q 'localhost:9011' || { fail "redirect does not point to FusionAuth (port 9011): $location"; return 1; }
  echo "$location" | grep -q 'oauth2/authorize' || { fail "redirect is not to /oauth2/authorize: $location"; return 1; }
  pass "302 → FusionAuth OAuth endpoint"
}

# Test 5: FusionAuth admin UI is accessible
test_fusionauth_admin() {
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 10 "http://localhost:9011/admin")
  [ "$status" = "200" ] || { fail "expected 200, got $status"; return 1; }
  pass "FusionAuth admin UI returned 200"
}

# Test 6: /logout redirects to /
test_logout() {
  local headers status location
  headers=$(headers_of "http://localhost:8080/logout")
  status=$(echo "$headers" | grep '^HTTP/' | awk '{print $2}')
  location=$(echo "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  [ "$status" = "302" ] || { fail "expected 302, got $status"; return 1; }
  echo "$location" | grep -qE '^/$|^http://localhost:8080/$' || { fail "expected redirect to /, got: $location"; return 1; }
  pass "302 → /"
}

run_test "home page returns 200" test_home_page
run_test "/account unauthenticated redirects to /" test_account_unauthenticated
run_test "/make-change unauthenticated redirects to /" test_make_change_unauthenticated
run_test "/login redirects to FusionAuth OAuth" test_login_redirect
run_test "FusionAuth admin UI accessible" test_fusionauth_admin
run_test "/logout redirects to /" test_logout

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
echo "All tests passed!"
