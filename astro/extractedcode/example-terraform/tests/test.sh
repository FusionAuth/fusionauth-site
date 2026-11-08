#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(cd "$PROJECT_DIR/../../.." && pwd)"
source "$REPO_ROOT/scripts/lib/fusionauth-version.sh"
export FUSIONAUTH_VERSION="${FUSIONAUTH_VERSION:-$(pinned_fusionauth_version)}"
READINESS_TIMEOUT=300
API_KEY=gHPdrfQa4A36JVoFfVDAY4jG4g8FGTpCd98_zZHTfW1KM2BI7an2gUhB
DEFAULT_TENANT_ID=d7d09513-a3f5-401c-9685-34ab6c552453
TERRAFORM_IMAGE=hashicorp/terraform:1.17
WORK_DIR="$(mktemp -d)"
COMPOSE=(docker compose -p fusionauth-terraform-test -f "$SCRIPT_DIR/docker-compose.yml")

cleanup() {
  status=$?
  echo "Cleaning up..."
  if [ "${status:-0}" -ne 0 ]; then "${COMPOSE[@]}" logs --tail 80 2>&1 || true; fi
  "${COMPOSE[@]}" down -v 2>/dev/null || true
  # terraform runs as root in its container, so remove its working copies from one
  docker run --rm -v "$WORK_DIR":/work alpine sh -c 'rm -rf /work/*' 2>/dev/null || true
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

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

fail() { echo "FAIL: $*" >&2; exit 1; }

api() {
  curl -sf "http://localhost:9011$1" -H "Authorization: $API_KEY" "${@:2}"
}

# the API key is the kickstart's only output, and the examples need it
kickstart_done() { api "/api/tenant/$DEFAULT_TENANT_ID"; }

# terraform <example> <args...> - run terraform in a working copy of one example, so .terraform and state stay out of the repo
terraform() {
  local example="$1"; shift
  docker run --rm --network host -e FA_API_KEY="$API_KEY" -e FA_DOMAIN=http://localhost:9011 -e TF_INPUT=0 -e TF_CLI_ARGS=-no-color \
    -v "$WORK_DIR/$example":/work -w /work "$TERRAFORM_IMAGE" "$@"
}

# plan_is_clean <example> - fail unless a plan finds no changes
plan_is_clean() {
  local status=0
  terraform "$1" plan -detailed-exitcode > "$WORK_DIR/plan.txt" || status=$?
  [ "$status" -eq 0 ] || { cat "$WORK_DIR/plan.txt"; fail "expected no changes in a plan of $1"; }
}

# the examples are alternatives that touch the same resources, so each one gets a fresh FusionAuth
fresh_fusionauth() {
  "${COMPOSE[@]}" down -v > /dev/null 2>&1 || true
  "${COMPOSE[@]}" up -d
  wait_for "FusionAuth" kickstart_done
}

for example in create data-source import import/first-plan; do
  mkdir -p "$WORK_DIR/$example"
  cp "$PROJECT_DIR/examples/$example/main.tf" "$WORK_DIR/$example/"
done
# readers replace this placeholder with their default tenant's Id, as the guide describes
sed -i.bak "s/<default-tenant-id>/$DEFAULT_TENANT_ID/" "$WORK_DIR/import/main.tf" "$WORK_DIR/import/first-plan/main.tf"
rm "$WORK_DIR"/import/*.bak "$WORK_DIR"/import/first-plan/*.bak

for example in create data-source import import/first-plan; do
  echo "Initializing and validating $example..."
  terraform "$example" init > /dev/null
  terraform "$example" validate
done

"${COMPOSE[@]}" pull --quiet

echo "Applying create..."
fresh_fusionauth
terraform create apply -auto-approve
plan_is_clean create
api /api/tenant | python3 -c 'import json, sys; names = [t["name"] for t in json.load(sys.stdin)["tenants"]]; assert "Forum" in names, names'
app_id="$(api /api/application | python3 -c '
import json, sys
apps = [a for a in json.load(sys.stdin)["applications"] if a["name"] == "Forum"]
assert apps, "no Forum application"
roles = sorted(r["name"] for r in apps[0].get("roles", []))
assert roles == ["admin", "user"], roles
print(apps[0]["id"])')"
# an app writing to its own data field shouldn't show up as drift
api "/api/application/$app_id" -X PATCH -H 'Content-Type: application/json' -d '{"application": {"data": {"productOwner": "owner@example.com"}}}' > /dev/null
plan_is_clean create
echo "Terraform ignores changes to the application's data field."

echo "Applying data-source..."
fresh_fusionauth
terraform data-source apply -auto-approve
plan_is_clean data-source
api /api/application | python3 -c '
import json, sys
apps = [a for a in json.load(sys.stdin)["applications"] if a["name"] == "Forum" and a["tenantId"] == "'"$DEFAULT_TENANT_ID"'"]
assert apps, "no Forum application in the default tenant"'

echo "Importing the default resources..."
fresh_fusionauth
# the guide's first plan imports both resources and reports the values to copy into the configuration
terraform import/first-plan plan > "$WORK_DIR/first-plan.txt"
grep -q "Plan: 2 to import, 0 to add, [1-9][0-9]* to change, 0 to destroy" "$WORK_DIR/first-plan.txt" \
  || { cat "$WORK_DIR/first-plan.txt"; fail "expected the first plan to import 2 resources and change some values"; }
terraform import plan > "$WORK_DIR/import-plan.txt"
grep -q "Plan: 2 to import, 0 to add, 0 to change, 0 to destroy" "$WORK_DIR/import-plan.txt" \
  || { cat "$WORK_DIR/import-plan.txt"; fail "the reconciled configuration doesn't match a new FusionAuth instance"; }
terraform import apply -auto-approve
plan_is_clean import

echo "All terraform checks passed."
