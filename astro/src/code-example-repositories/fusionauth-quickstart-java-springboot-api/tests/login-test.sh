#!/usr/bin/env bash
set -euo pipefail

FA_URL="http://localhost:9011"
APP_URL="http://localhost:8080"
API_KEY="this_really_should_be_a_long_random_alphanumeric_value_but_this_still_works"
APPLICATION_ID="e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"

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

assert_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  local body_file="${4:-}"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $description (expected $expected, got $actual)"
  else
    echo "  FAIL: $description (expected $expected, got $actual)"
    if [ -n "$body_file" ] && [ -f "$body_file" ]; then
      echo "  --- Response body ---"
      cat "$body_file"
      echo ""
      echo "  --- End response body ---"
    fi
    FAIL=1
  fi
}

echo "Logging in as teller@example.com..."
TELLER_TOKEN=$(login "teller@example.com" "password")

echo "Logging in as customer@example.com..."
CUSTOMER_TOKEN=$(login "customer@example.com" "password")

echo "Testing /make-change..."
CODE=$(curl -s -o /tmp/springboot-mc-teller.json -w "%{http_code}" "$APP_URL/make-change?total=1.02" --cookie "app.at=$TELLER_TOKEN")
assert_status "teller can call /make-change" 200 "$CODE" /tmp/springboot-mc-teller.json

CODE=$(curl -s -o /tmp/springboot-mc-customer.json -w "%{http_code}" "$APP_URL/make-change?total=1.02" --cookie "app.at=$CUSTOMER_TOKEN")
assert_status "customer can call /make-change" 200 "$CODE" /tmp/springboot-mc-customer.json

CODE=$(curl -s -o /tmp/springboot-mc-notoken.json -w "%{http_code}" "$APP_URL/make-change?total=1.02")
assert_status "no token on /make-change is rejected" 401 "$CODE" /tmp/springboot-mc-notoken.json

echo "Testing /panic..."
CODE=$(curl -s -o /tmp/springboot-panic-teller.json -w "%{http_code}" -X POST "$APP_URL/panic" --cookie "app.at=$TELLER_TOKEN")
assert_status "teller can call /panic" 200 "$CODE" /tmp/springboot-panic-teller.json

CODE=$(curl -s -o /tmp/springboot-panic-customer.json -w "%{http_code}" -X POST "$APP_URL/panic" --cookie "app.at=$CUSTOMER_TOKEN")
assert_status "customer is denied /panic" 403 "$CODE" /tmp/springboot-panic-customer.json

CODE=$(curl -s -o /tmp/springboot-panic-notoken.json -w "%{http_code}" -X POST "$APP_URL/panic")
assert_status "no token on /panic is rejected" 401 "$CODE" /tmp/springboot-panic-notoken.json

if [ "$FAIL" -eq 0 ]; then
  echo "All login/authorization checks passed."
  exit 0
else
  echo "Some login/authorization checks failed."
  exit 1
fi
