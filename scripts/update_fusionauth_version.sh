#!/usr/bin/env bash
# Pin the FusionAuth release the docs document in fusionauth-version, and copy it into the files that can't read that file.
set -euo pipefail

mode=update
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash scripts/update_fusionauth_version.sh [--check]\n'
    printf 'Pin the latest FusionAuth release in fusionauth-version, and copy it into:\n'
    printf '  astro/public/docs/docker-compose.yml (served at /docs/docker-compose.yml)\n'
    printf '  astro/screenshots/docker-compose.yml (retake screenshots after changing it)\n'
    printf 'Set FUSIONAUTH_VERSION to pin a specific version. With --check, report copies that differ from fusionauth-version without changing files.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/run-locally.sh"
pin_file=fusionauth-version
copies=(astro/public/docs/docker-compose.yml astro/screenshots/docker-compose.yml)
pinned="$(<"$repo_root/$pin_file")"

# the screenshot pin is wrapped in ${FUSIONAUTH_IMAGE:-...} so it can be overridden locally
pin_copy() {
  sed -E "s#(fusionauth/fusionauth-app:)[0-9]+\.[0-9]+\.[0-9]+#\1$2#" "$repo_root/$1"
}

for file in "${copies[@]}"; do
  if ! grep -qE 'fusionauth/fusionauth-app:[0-9]+\.[0-9]+\.[0-9]+' "$repo_root/$file"; then
    printf 'No pinned fusionauth/fusionauth-app image found in %s.\n' "$file" >&2
    exit 1
  fi
done

if [[ "$mode" == check ]]; then
  trap 'run_locally "bash scripts/update_fusionauth_version.sh --check"' EXIT
  stale=()
  for file in "${copies[@]}"; do
    pin_copy "$file" "$pinned" | diff -u --label "$file" --label "$file" "$repo_root/$file" - || stale+=("$file")
  done
  if [[ ${#stale[@]} -gt 0 ]]; then
    printf '\n%s pins FusionAuth %s, but these files pin a different version:\n' "$pin_file" "$pinned" >&2
    printf '  %s\n' "${stale[@]}" >&2
    printf 'To fix them, run this from the repo root: FUSIONAUTH_VERSION=%s bash scripts/update_fusionauth_version.sh\n' "$pinned" >&2
    exit 1
  fi
  printf 'Every copy matches %s (FusionAuth %s).\n' "$pin_file" "$pinned"
  exit 0
fi

version="${FUSIONAUTH_VERSION:-$(curl -f --silent https://account.fusionauth.io/api/version | jq -r '.versions[-1]')}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Unexpected FusionAuth version "%s". Nothing was changed.\n' "$version" >&2
  exit 1
fi
trap 'run_locally "FUSIONAUTH_VERSION=$version bash scripts/update_fusionauth_version.sh"' EXIT

stale=()
[[ "$pinned" == "$version" ]] || stale+=("$pin_file ($pinned)")
for file in "${copies[@]}"; do
  pin_copy "$file" "$version" | cmp -s "$repo_root/$file" - || stale+=("$file")
done

if [[ ${#stale[@]} -eq 0 ]]; then
  printf 'Every pin is already FusionAuth %s.\n' "$version"
  exit 0
fi

# release notes can land before the image does; don't point readers at a tag that can't be pulled yet
if ! curl -f --silent --output /dev/null "https://hub.docker.com/v2/repositories/fusionauth/fusionauth-app/tags/$version"; then
  printf 'FusionAuth %s is released but fusionauth/fusionauth-app:%s is not on Docker Hub yet. Nothing was changed.\n' "$version" "$version"
  exit 0
fi

printf '\nProposed changes:\n'
printf '%s\n' "$version" | diff -u --label "$pin_file" --label "$pin_file" "$repo_root/$pin_file" - || true
for file in "${copies[@]}"; do
  pin_copy "$file" "$version" | diff -u --label "$file" --label "$file" "$repo_root/$file" - || true
done
printf '\n'

printf '%s\n' "$version" > "$repo_root/$pin_file"
for file in "${copies[@]}"; do
  pin_copy "$file" "$version" > "$repo_root/$file.next"
  mv "$repo_root/$file.next" "$repo_root/$file"
done
printf 'Pinned FusionAuth %s in:\n' "$version"
printf '  %s\n' "${stale[@]}"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'version=%s\n' "$version" >> "$GITHUB_OUTPUT"
fi
