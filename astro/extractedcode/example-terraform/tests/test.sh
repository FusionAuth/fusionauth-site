#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
READINESS_TIMEOUT=300
API_KEY=gHPdrfQa4A36JVoFfVDAY4jG4g8FGTpCd98_zZHTfW1KM2BI7an2gUhB
DEFAULT_TENANT_ID=d7d09513-a3f5-401c-9685-34ab6c552453
TERRAFORM_IMAGE=hashicorp/terraform:1.9
WORK_DIR="$(mktemp -d)"

cleanup() {
  status=$?
  echo "Cleaning up..."
  if [ "${status:-0}" -ne 0 ]; then docker compose -f "$SCRIPT_DIR/docker-compose.yml" logs --tail 80 2>&1 || true; fi
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" down -v 2>/dev/null || true
  # terraform runs as root in its container, so remove its working copies from one
  docker run --rm -v "$WORK_DIR":/work alpine rm -rf /work/create /work/data-source /work/import 2>/dev/null || true
  rm -rf "$WORK_DIR"
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

# the API key is the kickstart's only output, and the examples need it
kickstart_done() {
  curl -sf http://localhost:9011/api/tenant/$DEFAULT_TENANT_ID -H "Authorization: $API_KEY"
}

# terraform <example> <args...> - run terraform in a working copy of one example, so .terraform and state stay out of the repo
terraform() {
  local example="$1"; shift
  docker run --rm --network host -v "$WORK_DIR/$example":/work -w /work "$TERRAFORM_IMAGE" "$@"
}

# the examples are alternatives that create the same resources, so each one gets a fresh FusionAuth
fresh_fusionauth() {
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" down -v > /dev/null 2>&1 || true
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
  wait_for "FusionAuth" kickstart_done
}

api_get() {
  curl -sf "http://localhost:9011$1" -H "Authorization: $API_KEY"
}

echo "Checking the helper scripts..."
bash -n "$PROJECT_DIR/scripts/fusionauth-application-data/script.sh"
python3 -m json.tool "$PROJECT_DIR/scripts/fusionauth-application-data/patch.json" > /dev/null
(cd "$PROJECT_DIR/scripts/fusionauth-email-templates" && docker compose config > /dev/null)

for example in create data-source import; do
  cp -r "$PROJECT_DIR/examples/$example" "$WORK_DIR/$example"
done
# readers replace this placeholder with their default tenant's Id, as the guide describes
sed -i.bak "s/Replace-This-With-The-Existing-Default-Tenant-Id/$DEFAULT_TENANT_ID/" "$WORK_DIR/import/main.tf"
rm "$WORK_DIR/import/main.tf.bak"

for example in create data-source import; do
  echo "Initializing and validating $example..."
  terraform "$example" init -input=false -no-color > /dev/null
  terraform "$example" validate -no-color
done

docker compose -f "$SCRIPT_DIR/docker-compose.yml" pull --quiet

echo "Applying create..."
fresh_fusionauth
terraform create apply -input=false -auto-approve -no-color
api_get /api/tenant | python3 -c 'import json, sys; names = [t["name"] for t in json.load(sys.stdin)["tenants"]]; assert "Forum" in names, names'
api_get /api/application | python3 -c '
import json, sys
apps = [a for a in json.load(sys.stdin)["applications"] if a["name"] == "forum"]
assert apps, "no forum application"
roles = sorted(r["name"] for r in apps[0].get("roles", []))
assert roles == ["admin", "user"], roles'

echo "Applying data-source..."
fresh_fusionauth
terraform data-source apply -input=false -auto-approve -no-color
api_get "/api/application" | python3 -c '
import json, sys
apps = [a for a in json.load(sys.stdin)["applications"] if a["name"] == "forum" and a["tenantId"] == "'"$DEFAULT_TENANT_ID"'"]
assert apps, "no forum application in the default tenant"'

# the guide has readers fill in key and theme Ids before applying, so plan is as far as the example goes as published
echo "Planning import..."
fresh_fusionauth
terraform import plan -input=false -no-color > "$WORK_DIR/import-plan.txt"
grep -q "fusionauth_tenant.Default: Preparing import" "$WORK_DIR/import-plan.txt"

echo "All terraform checks passed."
