#!/usr/bin/env bash
# Refresh externally owned files and generated JSON displayed in the documentation.
set -euo pipefail

mode=refresh
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash src/scripts/fetch_external_content.sh [--check]\n'
    printf 'Refresh configuration snapshots and generated JSON, or report drift without changing files.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac
if [[ $# -gt 1 ]]; then
  printf 'Expected at most one argument.\n' >&2
  exit 2
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
snapshot_dir="$repo_root/astro/extractedcode/configuration-snippets"
json_dir="$repo_root/astro/src/content/json/generated"

if [[ -n "$(find "$snapshot_dir" -name repositoryUrl.txt -print 2>/dev/null)" ]]; then
  printf 'Externally owned configuration snapshots must not be exported.\n' >&2
  exit 1
fi

repositories=(
  'containers|fusionauth-containers|main'
  'contrib|fusionauth-contrib|main'
  'example-docker-compose|fusionauth-example-docker-compose|main'
)
files=(
  'containers/docker/fusionauth/docker-compose.yml|docker/fusionauth/docker-compose.yml'
  'containers/docker/fusionauth/sample.env|docker/fusionauth/.env'
  'containers/docker/fusionauth/fusionauth-app/Dockerfile|docker/fusionauth/fusionauth-app/Dockerfile'
  'containers/docker/fusionauth/fusionauth-app-mysql/Dockerfile|docker/fusionauth/fusionauth-app-mysql/Dockerfile'
  'contrib/kubernetes/istio/fusionauth-all-in-one.yaml|kubernetes/istio/fusionauth-all-in-one.yaml'
  'example-docker-compose/plugin-build/docker-compose.yml|build/docker-compose.yml'
  'example-docker-compose/plugin-build/fusionauth-app/Dockerfile|build/fusionauth-app/Dockerfile'
  'example-docker-compose/kafka/docker-compose.yml|kafka/docker-compose.yml'
  'example-docker-compose/kickstart/docker-compose.yml|kickstart/docker-compose.yml'
  'example-docker-compose/mailcatcher/docker-compose.yml|mailcatcher/docker-compose.yml'
  'example-docker-compose/plugin/docker-compose.yml|plugin/docker-compose.yml'
)
json_files=(
  'sample-usage-data.json'
  'indexentity.json'
  'indexuser.json'
  'cookies.json'
  'authenticationtype.json'
  'api-endpoints.json'
)

staging_dir="$(mktemp -d)"
trap 'rm -rf "$staging_dir"' EXIT
cp "$snapshot_dir/SOURCES.md" "$staging_dir/SOURCES.md"
mkdir -p "$staging_dir/json"
changed=0

# fetch snapshots
for repository in "${repositories[@]}"; do
  IFS='|' read -r local_dir upstream_repo upstream_branch <<< "$repository"
  if ! revision="$(git -C "$staging_dir" -c http.lowSpeedLimit=1 -c http.lowSpeedTime=30 ls-remote \
    --exit-code "https://github.com/FusionAuth/$upstream_repo.git" "refs/heads/$upstream_branch" | awk '{print $1}')" ||
    [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
    printf 'Could not resolve %s/%s. No snapshots were modified.\n' "$upstream_repo" "$upstream_branch" >&2
    exit 1
  fi
  recorded_revision="$(awk -F '|' -v dir="$local_dir/" \
    '$2 == " `" dir "` " {gsub(/[ `]/, "", $4); print $4}' "$snapshot_dir/SOURCES.md")"
  if [[ ! "$recorded_revision" =~ ^[0-9a-f]{40}$ ]]; then
    printf 'Missing or invalid source revision for %s in SOURCES.md.\n' "$local_dir" >&2
    exit 1
  fi
  printf 'Fetching %s at %s\n' "$upstream_repo" "$revision"
  repository_changed=0
  
  for file in "${files[@]}"; do
    IFS='|' read -r local_path upstream_path <<< "$file"
    [[ "$local_path" == "$local_dir/"* ]] || continue
    destination="$staging_dir/$local_path"
    mkdir -p "$(dirname "$destination")"
    
    curl --disable --fail --silent --show-error --location --retry 2 \
      --connect-timeout 15 --max-time 60 --proto '=https' --proto-redir '=https' \
      --output "$destination" \
      "https://raw.githubusercontent.com/FusionAuth/$upstream_repo/$revision/$upstream_path" || {
        printf 'Failed to fetch %s/%s. No snapshots were modified.\n' "$upstream_repo" "$upstream_path" >&2
        exit 1
      }
      
    if [[ ! -s "$destination" ]]; then
      printf 'Empty upstream file: %s/%s\n' "$upstream_repo" "$upstream_path" >&2
      exit 1
    fi
    
    sed '/^[[:blank:]]*$/s/[[:blank:]]//g' "$destination" > "$staging_dir/normalized"
    mv "$staging_dir/normalized" "$destination"
    if [[ -n "$(tail -c 1 "$destination")" ]]; then
      printf '\n' >> "$destination"
    fi
    
    if ! cmp -s "$snapshot_dir/$local_path" "$destination"; then
      changed=1
      repository_changed=1
      printf '\nChanged snapshot: %s\n' "$local_path"
      previous="$snapshot_dir/$local_path"
      [[ -f "$previous" ]] || previous=/dev/null
      diff -u "$previous" "$destination" \vert{}\vert{} [[ $? -eq 1 ]]
    fi
  done
  
  if [[ "$repository_changed" -eq 1 ]]; then
    awk -F '|' -v dir="$local_dir/" -v old="$recorded_revision" -v new="$revision" \
      '$2 == " `" dir "` " {gsub(old, new)} {print}' \
      "$staging_dir/SOURCES.md" > "$staging_dir/SOURCES.next.md"
    mv "$staging_dir/SOURCES.next.md" "$staging_dir/SOURCES.md"
  fi
done

# generate json content
printf '\nFetching fusionauth-app for JSON generation...\n'
version=$(curl -f --silent https://account.fusionauth.io/api/version | jq -r '.versions[-1]')
printf 'Downloading version %s\n' "$version"

curl -f -L -s "https://files.fusionauth.io/products/fusionauth/${version}/fusionauth-app-${version}.zip" -o "$staging_dir/app.zip"
mkdir -p "$staging_dir/fusionauth-app"
unzip -q "$staging_dir/app.zip" -d "$staging_dir/fusionauth-app"

lib_dir="$staging_dir/fusionauth-app/fusionauth-app/lib"
cp=$(find "$lib_dir" -name '*.jar' \vert{} tr '\n' ':' \vert{} sed 's/:$//')
java_classes="$staging_dir/java-classes"
mkdir -p "$java_classes"

printf 'Extracting and compiling JSON generators...\n'

# Sample Usage Data
unzip -p "$lib_dir"/fusionauth-usage-stats-common*.jar \
  io/fusionauth/usagestats/shared/resources/IngestAction-fullData-request.json \
  > "$staging_dir/json/sample-usage-data.json"

# Annotations JSON
javac -cp "$cp" -d "$java_classes" "$repo_root/src/scripts/java/GenerateJSONFromAnnotations.java"
java -cp "$cp:$java_classes" GenerateJSONFromAnnotations \
  "$staging_dir/json" \
  io.fusionauth.api.service.search.client.domain.documents.IndexEntity \
  io.fusionauth.api.service.search.client.domain.documents.IndexUser \
  io.fusionauth.app.Cookies \
  io.fusionauth.api.service.authentication.AuthenticationType

# API Endpoints JSON
javac -cp "$cp" -d "$java_classes" "$repo_root/src/scripts/java/GenerateEndpointsJSON.java"
java -cp "$cp:$java_classes" GenerateEndpointsJSON \
  "$staging_dir/json/api-endpoints.json"

# Diff checking for JSON
for json_file in "${json_files[@]}"; do
  dest="$staging_dir/json/$json_file"
  prev="$json_dir/$json_file"
  
  if [[ ! -f "$dest" ]]; then
    printf 'Failed to generate %s\n' "$json_file" >&2
    exit 1
  fi
  
  # Check for meaningful (non-whitespace) drift
  if [[ ! -f "$prev" ]] || ! diff -w -q "$prev" "$dest" >/dev/null 2>&1; then
    changed=1
    printf '\nChanged JSON: %s\n' "$json_file"
    [[ -f "$prev" ]] || prev=/dev/null
    diff -u "$prev" "$dest" || true
  fi
done

# resolve updates
if [[ "$changed" -eq 0 ]]; then
  printf '\nAll configuration snapshots and generated JSON files match upstream.\n'
  exit 0
fi

if [[ "$mode" == check ]]; then
  printf '\nExternal content has changed. No local files were modified.\n' >&2
  printf 'Run bash src/scripts/fetch_external_content.sh, then review the diff and affected guides.\n' >&2
  exit 1
fi

# Apply Snippets
for file in "${files[@]}"; do
  IFS='|' read -r local_path upstream_path <<< "$file"
  if ! cmp -s "$snapshot_dir/$local_path" "$staging_dir/$local_path"; then
    mkdir -p "$(dirname "$snapshot_dir/$local_path")"
    cp "$staging_dir/$local_path" "$snapshot_dir/$local_path"
  fi
done
cp "$staging_dir/SOURCES.md" "$snapshot_dir/SOURCES.md"

# Apply JSON
mkdir -p "$json_dir"
for json_file in "${json_files[@]}"; do
  cp "$staging_dir/json/$json_file" "$json_dir/$json_file"
done

printf '\nContent refreshed. Review the diff and affected guides before committing.\n'