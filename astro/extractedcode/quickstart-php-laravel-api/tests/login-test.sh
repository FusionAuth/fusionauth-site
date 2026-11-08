#!/usr/bin/env bash
set -euo pipefail

FA_URL="http://localhost:9011"
APP_URL="http://localhost:8000"
API_KEY="this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
APPLICATION_ID="e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"
OUT_DIR="$(mktemp -d)"
trap 'rm -rf "$OUT_DIR"' EXIT

FAIL=0

login() {
  local login_id="$1"
  local password="$2"
  curl -s "$FA_URL/api/login" \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"loginId\":\"$login_id\",\"password\":\"$password\",\"applicationId\":\"$APPLICATION_ID\"}" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])"
}

# call <method> <path> <token or ""> <body file> - prints the HTTP status
call() {
  local method="$1" path="$2" token="$3" body="$4"
  if [ -n "$token" ]; then
    curl -s -o "$body" -w "%{http_code}" -X "$method" -H "Accept: application/json" -H "Authorization: Bearer $token" "$APP_URL$path"
  else
    curl -s -o "$body" -w "%{http_code}" -X "$method" -H "Accept: application/json" "$APP_URL$path"
  fi
}

assert_status() {
  local description="$1" expected="$2" actual="$3" body_file="$4"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $description (expected $expected, got $actual)"
  else
    echo "  FAIL: $description (expected $expected, got $actual)"
    echo "  --- Response body ---"
    cat "$body_file"
    echo ""
    echo "  --- End response body ---"
    FAIL=1
  fi
}

assert_body() {
  local description="$1" expected="$2" body_file="$3"
  if grep -qF "$expected" "$body_file"; then
    echo "  PASS: $description"
  else
    echo "  FAIL: $description (expected body to contain: $expected)"
    cat "$body_file"
    echo ""
    FAIL=1
  fi
}

echo "Logging in as teller@example.com..."
TELLER_TOKEN=$(login "teller@example.com" "password")

echo "Logging in as customer@example.com..."
CUSTOMER_TOKEN=$(login "customer@example.com" "password")

echo "Testing /api/make-change..."
CODE=$(call GET "/api/make-change?total=1.02" "$TELLER_TOKEN" "$OUT_DIR/mc-teller.json")
assert_status "teller can call /api/make-change" 200 "$CODE" "$OUT_DIR/mc-teller.json"
assert_body "make-change returns the right coins" "We can make change using 4 quarters 0 dimes 0 nickels 2 pennies" "$OUT_DIR/mc-teller.json"

CODE=$(call GET "/api/make-change?total=1.02" "$CUSTOMER_TOKEN" "$OUT_DIR/mc-customer.json")
assert_status "customer can call /api/make-change" 200 "$CODE" "$OUT_DIR/mc-customer.json"

CODE=$(call GET "/api/make-change?total=1.02" "" "$OUT_DIR/mc-notoken.json")
assert_status "no token on /api/make-change is rejected" 401 "$CODE" "$OUT_DIR/mc-notoken.json"

echo "Testing /api/panic..."
CODE=$(call POST "/api/panic" "$TELLER_TOKEN" "$OUT_DIR/panic-teller.json")
assert_status "teller can call /api/panic" 200 "$CODE" "$OUT_DIR/panic-teller.json"
assert_body "panic returns its message" "We've called the police!" "$OUT_DIR/panic-teller.json"

CODE=$(call POST "/api/panic" "$CUSTOMER_TOKEN" "$OUT_DIR/panic-customer.json")
assert_status "customer cannot call /api/panic" 403 "$CODE" "$OUT_DIR/panic-customer.json"

CODE=$(call POST "/api/panic" "" "$OUT_DIR/panic-notoken.json")
assert_status "no token on /api/panic is rejected" 401 "$CODE" "$OUT_DIR/panic-notoken.json"

if [ "$FAIL" -ne 0 ]; then
  echo "Some API tests failed."
  exit 1
fi
echo "All API tests passed."
