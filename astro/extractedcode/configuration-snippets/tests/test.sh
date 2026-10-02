#!/usr/bin/env bash
set -euo pipefail

snapshot_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

expected_files=(
  containers/docker/fusionauth/docker-compose.yml
  containers/docker/fusionauth/sample.env
  containers/docker/fusionauth/fusionauth-app/Dockerfile
  containers/docker/fusionauth/fusionauth-app-mysql/Dockerfile
  contrib/kubernetes/istio/fusionauth-all-in-one.yaml
  example-docker-compose/plugin-build/docker-compose.yml
  example-docker-compose/plugin-build/fusionauth-app/Dockerfile
  example-docker-compose/kafka/docker-compose.yml
  example-docker-compose/kickstart/docker-compose.yml
  example-docker-compose/mailcatcher/docker-compose.yml
  example-docker-compose/plugin/docker-compose.yml
)

for file in "${expected_files[@]}"; do
  if [[ ! -s "$snapshot_dir/$file" ]]; then
    printf 'Missing or empty configuration snapshot: %s\n' "$file" >&2
    exit 1
  fi
done

if [[ -e "$snapshot_dir/repositoryUrl.txt" ]]; then
  printf 'Configuration snapshots must not be exported to external repositories.\n' >&2
  exit 1
fi

grep -q 'DATABASE_PASSWORD=' "$snapshot_dir/containers/docker/fusionauth/sample.env"
grep -q 'fusionauth-app:' "$snapshot_dir/containers/docker/fusionauth/docker-compose.yml"
grep -q 'kafka:9092' "$snapshot_dir/example-docker-compose/kafka/docker-compose.yml"

printf 'All %s configuration snapshots are present and remain non-exporting.\n' "${#expected_files[@]}"
