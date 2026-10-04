#!/usr/bin/env bash
# Refresh only the externally owned files displayed in the documentation.
set -euo pipefail

mode=refresh
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash src/scripts/fetch_external_content.sh [--check]\n'
    printf 'Refresh configuration snapshots, or report drift without changing files.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac
if [[ $# -gt 1 ]]; then
  printf 'Expected at most one argument.\n' >&2
  exit 2
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
snapshot_dir="$repo_root/astro/extractedcode/configuration-snippets"
if [[ -n "$(find "$snapshot_dir" -name repositoryUrl.txt -print)" ]]; then
  printf 'Externally owned configuration snapshots must not be exported.\n' >&2
  exit 1
fi

# Local directory | upstream repository | branch used by the documentation.
# Do not follow default HEAD: fusionauth-containers defaults to develop.
repositories=(
  'containers|fusionauth-containers|main'
  'contrib|fusionauth-contrib|main'
  'example-docker-compose|fusionauth-example-docker-compose|main'
)
# Local path | upstream path. Keep this whitelist limited to displayed files.
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

staging_dir="$(mktemp -d)"
trap 'rm -rf "$staging_dir"' EXIT
cp "$snapshot_dir/SOURCES.md" "$staging_dir/SOURCES.md"
changed=0

# Stage every download before writing any snapshot. A failed fetch must not
# leave a mixture of old and new files in the documentation.
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
    # Ignore curlrc: it can add file writes or change TLS verification.
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
    # Match the snapshots' existing blank-line/final-newline normalization.
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
      diff -u "$previous" "$destination" || [[ $? -eq 1 ]]
    fi
  done
  # Unrelated upstream commits must not trigger drift or provenance-only edits.
  if [[ "$repository_changed" -eq 1 ]]; then
    awk -F '|' -v dir="$local_dir/" -v old="$recorded_revision" -v new="$revision" \
      '$2 == " `" dir "` " {gsub(old, new)} {print}' \
      "$staging_dir/SOURCES.md" > "$staging_dir/SOURCES.next.md"
    mv "$staging_dir/SOURCES.next.md" "$staging_dir/SOURCES.md"
  fi
done

if [[ "$changed" -eq 0 ]]; then
  printf '\nAll %s configuration snapshots match their upstream sources.\n' "${#files[@]}"
  exit 0
fi
if [[ "$mode" == check ]]; then
  printf '\nExternal content has changed. No local files were modified.\n' >&2
  printf 'Run bash src/scripts/fetch_external_content.sh, then review the diff and affected guides.\n' >&2
  exit 1
fi

for file in "${files[@]}"; do
  IFS='|' read -r local_path upstream_path <<< "$file"
  if ! cmp -s "$snapshot_dir/$local_path" "$staging_dir/$local_path"; then
    mkdir -p "$(dirname "$snapshot_dir/$local_path")"
    cp "$staging_dir/$local_path" "$snapshot_dir/$local_path"
  fi
done
cp "$staging_dir/SOURCES.md" "$snapshot_dir/SOURCES.md"
printf '\nSnapshots refreshed. Review the diff and affected guides before committing.\n'
