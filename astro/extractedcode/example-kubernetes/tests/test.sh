#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(cd "$PROJECT_DIR/../../.." && pwd)"
source "$REPO_ROOT/scripts/lib/fusionauth-version.sh"
FUSIONAUTH_VERSION="${FUSIONAUTH_VERSION:-$(pinned_fusionauth_version)}"
KIND_VERSION=v0.33.0
CLUSTER=fusionauth-k8s-guide-test
READINESS_TIMEOUT=600
WORK_DIR="$(mktemp -d)"
PIDS=()
KIND=kind
# keep the test cluster and chart repos out of the user's kubeconfig and helm config
export KUBECONFIG="$WORK_DIR/kubeconfig"
export HELM_CONFIG_HOME="$WORK_DIR/helm/config" HELM_CACHE_HOME="$WORK_DIR/helm/cache" HELM_DATA_HOME="$WORK_DIR/helm/data"

cleanup() {
  status=$?
  echo "Cleaning up..."
  for pid in ${PIDS[@]+"${PIDS[@]}"}; do pkill -P "$pid" 2>/dev/null || true; kill "$pid" 2>/dev/null || true; done
  if [ "${status:-0}" -ne 0 ] && [ -f "$KUBECONFIG" ]; then
    kubectl get pods -A 2>&1 || true
    kubectl logs deploy/my-release-fusionauth --tail 80 2>&1 || true
  fi
  "$KIND" delete cluster --name "$CLUSTER" > /dev/null 2>&1 || true
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

for tool in docker helm kubectl openssl curl; do
  command -v "$tool" > /dev/null || fail "$tool is required"
done

if ! command -v kind > /dev/null; then
  KIND="$WORK_DIR/bin/kind"
  mkdir -p "$WORK_DIR/bin"
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"; [ "$arch" = x86_64 ] && arch=amd64; [ "$arch" = aarch64 ] && arch=arm64
  curl -fsSL -o "$KIND" "https://kind.sigs.k8s.io/dl/$KIND_VERSION/kind-$os-$arch"
  chmod +x "$KIND"
fi

# run the commands from a copy, with the guide's placeholders filled in
cp -R "$PROJECT_DIR/." "$WORK_DIR/project"
cd "$WORK_DIR/project"
find . -name '*.yaml' -o -name '*.sh' | grep -v '^./tests/' | xargs sed -i.bak \
  -e 's/<database-host>/postgres.default.svc.cluster.local/' \
  -e 's/<superuser-name>/postgres/' \
  -e 's/<fusionauth-user-password>/fusionauth-test-password/' \
  -e 's/<superuser-password>/postgres-test-password/' \
  -e 's/<search-host>/elasticsearch.default.svc.cluster.local/' \
  -e 's/<search-username>/elastic/' \
  -e 's/<search-password>/search-test-password/'
find . -name '*.bak' -delete
if grep -rn '<[a-z-]*>' --include='*.yaml' --include='*.sh' . | grep -v '^./tests/'; then
  fail "a placeholder above has no test value"
fi

# test-only overrides: the docs' FusionAuth version, and plain http as the minikube guide's search engine has no certificate
cat > "$WORK_DIR/ci-values.yaml" <<EOF
image:
  tag: "$FUSIONAUTH_VERSION"
search:
  protocol: http
EOF
helm() {
  case "${1:-} ${2:-}" in
    "install my-release" | "upgrade my-release") command helm "$@" -f "$CI_VALUES" ;;
    *) command helm "$@" ;;
  esac
}
export -f helm
export CI_VALUES="$WORK_DIR/ci-values.yaml"

run() { echo "+ $1"; bash "commands/$1"; }

echo "Rendering the chart with the guide's values..."
run add-repo.sh
run list-repos.sh
run search-repo.sh
run show-values.sh
grep -q '^database:' chart-values.yaml || fail "helm show values didn't write the chart values"

rendered="$(command helm template my-release fusionauth/fusionauth -f values.yaml --api-versions gateway.networking.k8s.io/v1)"
grep -q 'jdbc:postgresql://postgres.default.svc.cluster.local:5432/fusionauth?sslmode=require' <<< "$rendered" || fail "database TLS isn't in DATABASE_URL"
grep -qF 'https://$(SEARCH_USERNAME):$(SEARCH_PASSWORD)@elasticsearch.default.svc.cluster.local:9200' <<< "$rendered" || fail "search doesn't use https with basic auth"
for secret in fusionauth-db-credentials fusionauth-db-root-credentials fusionauth-search-credentials; do
  grep -qE "name: \"?$secret\"?$" <<< "$rendered" || fail "the deployment doesn't read $secret"
done
grep -q 'kind: HTTPRoute' <<< "$rendered" || fail "the chart didn't render an HTTPRoute"
command helm template my-release fusionauth/fusionauth -f values.yaml -f sidecar-values.yaml | grep -q 'name: my-sidecar' || fail "the sidecar isn't in the pod"

echo "Creating a kind cluster..."
"$KIND" create cluster --name "$CLUSTER" --wait 180s

# the minikube guide's database and search engine stand in for managed services
echo "Deploying PostgreSQL and Elasticsearch from the minikube guide..."
run_minikube() { echo "+ minikube/$1"; (cd minikube && bash "commands/$1"); }
run_minikube create-postgres-secret.sh
run_minikube apply-postgres.sh
run_minikube create-elasticsearch-secret.sh
run_minikube apply-elasticsearch.sh
kubectl rollout status deploy/postgres --timeout "${READINESS_TIMEOUT}s"
kubectl rollout status deploy/elasticsearch --timeout "${READINESS_TIMEOUT}s"
run_minikube get-pods.sh
run_minikube get-services.sh

run create-db-secrets.sh
run create-search-secret.sh

# the guide installs the Gateway API CRDs after FusionAuth, but values.yaml already holds the final HTTPRoute settings
echo "Installing Envoy Gateway..."
run install-envoy-gateway.sh
run wait-envoy-gateway.sh

echo "Installing FusionAuth..."
run install.sh
kubectl rollout status deploy/my-release-fusionauth --timeout "${READINESS_TIMEOUT}s"
run get-deployments.sh

bash commands/port-forward.sh > "$WORK_DIR/port-forward.log" 2>&1 &
PIDS+=("$!")
wait_for "FusionAuth through the port forward" curl -sf http://localhost:9011/api/status

psql_ssl="$(kubectl exec deploy/postgres -- psql -U postgres -tAc \
  "select count(*) from pg_stat_ssl s join pg_stat_activity a using (pid) where a.usename = 'fusionauth' and s.ssl")"
[ "${psql_ssl// /}" -gt 0 ] || fail "FusionAuth isn't connected to PostgreSQL over TLS"
echo "FusionAuth connects to PostgreSQL over TLS."

search_index() {
  kubectl exec deploy/elasticsearch -- bash -c 'curl -sf -u "elastic:$ELASTIC_PASSWORD" "localhost:9200/_cat/indices?h=index"' | grep -q fusionauth_user
}
wait_for "the FusionAuth user index in Elasticsearch" search_index

echo "Exposing FusionAuth through the Gateway..."
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj "/CN=auth.example.com" \
  -addext "subjectAltName=DNS:auth.example.com" -keyout tls.key -out tls.crt 2> /dev/null
run create-tls-secret.sh
run apply-gateway.sh
run upgrade.sh
run get-gateway.sh

envoy_service() {
  kubectl get svc -n envoy-gateway-system -l gateway.envoyproxy.io/owning-gateway-name=fusionauth-gateway -o jsonpath='{.items[0].metadata.name}' | grep -q .
}
wait_for "the Gateway's Envoy service" envoy_service
kubectl wait deploy -n envoy-gateway-system -l gateway.envoyproxy.io/owning-gateway-name=fusionauth-gateway --for=condition=Available --timeout "${READINESS_TIMEOUT}s"
svc="$(kubectl get svc -n envoy-gateway-system -l gateway.envoyproxy.io/owning-gateway-name=fusionauth-gateway -o jsonpath='{.items[0].metadata.name}')"
kubectl port-forward -n envoy-gateway-system "svc/$svc" 8080:80 8443:443 > "$WORK_DIR/gateway-forward.log" 2>&1 &
PIDS+=("$!")
https_status() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' --cacert tls.crt --resolve auth.example.com:8443:127.0.0.1 https://auth.example.com:8443/api/status)" = 200 ]
}
wait_for "FusionAuth over HTTPS through the Gateway" https_status

# send the Host header a browser sends to port 80, since Envoy copies a Host port into the redirect
redirect="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' -H 'Host: auth.example.com' http://127.0.0.1:8080/api/status)"
case "$redirect" in
  "301 https://auth.example.com/api/status") echo "The Gateway redirects HTTP to HTTPS." ;;
  *) fail "expected the Gateway to redirect HTTP to HTTPS, got: $redirect" ;;
esac

# FusionAuth builds public URLs from the forwarded headers, so a wrong scheme here means the Gateway isn't forwarding them
discovery="$(curl -sf --cacert tls.crt --resolve auth.example.com:8443:127.0.0.1 https://auth.example.com:8443/.well-known/openid-configuration)"
grep -q '"authorization_endpoint" *: *"https://auth.example.com' <<< "$discovery" || fail "expected an https authorization endpoint, got: $(grep -o '"authorization_endpoint"[^,]*' <<< "$discovery")"
echo "FusionAuth sees the original HTTPS request."

echo "All Kubernetes guide checks passed."
