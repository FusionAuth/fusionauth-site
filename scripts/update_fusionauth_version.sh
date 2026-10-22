#!/usr/bin/env bash
# Pin fusionauth/fusionauth-app to the latest release in the docker install compose file and the screenshot tooling.
set -euo pipefail

mode=update
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash scripts/update_fusionauth_version.sh [--check]\n'
    printf 'Pin fusionauth/fusionauth-app to the latest release in:\n'
    printf '  astro/public/docs/docker-compose.yml (served at /docs/docker-compose.yml)\n'
    printf '  astro/screenshots/docker-compose.yml (retake screenshots after changing it)\n'
    printf 'Set FUSIONAUTH_VERSION to pin a specific version. With --check, report a stale pin without changing files.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/run-locally.sh"
files=(astro/public/docs/docker-compose.yml astro/screenshots/docker-compose.yml)

version="${FUSIONAUTH_VERSION:-$(curl -f --silent https://account.fusionauth.io/api/version | jq -r '.versions[-1]')}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Unexpected FusionAuth version "%s". Nothing was changed.\n' "$version" >&2
  exit 1
fi
trap 'run_locally "FUSIONAUTH_VERSION=$version bash scripts/update_fusionauth_version.sh"' EXIT

stale=()
for file in "${files[@]}"; do
  current="$(sed -n 's#^ *image: fusionauth/fusionauth-app:\(.*\)$#\1#p' "$repo_root/$file")"
  if [[ -z "$current" ]]; then
    printf 'No fusionauth/fusionauth-app image line found in %s.\n' "$file" >&2
    exit 1
  fi
  [[ "$current" == "$version" ]] || stale+=("$file ($current)")
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
for file in "${files[@]}"; do
  sed "s#^\( *image: fusionauth/fusionauth-app:\).*#\1$version#" "$repo_root/$file" |
    diff -u --label "$file" --label "$file" "$repo_root/$file" - || true
done
printf '\n'

if [[ "$mode" == check ]]; then
  printf 'FusionAuth %s is out but these files pin an older version:\n' "$version" >&2
  printf '  %s\n' "${stale[@]}" >&2
  printf 'Run the command below, then open a PR.\n' >&2
  exit 1
fi

for file in "${files[@]}"; do
  sed -i.bak "s#^\( *image: fusionauth/fusionauth-app:\).*#\1$version#" "$repo_root/$file"
  rm -f "$repo_root/$file.bak"
done
printf 'Pinned FusionAuth %s in:\n' "$version"
printf '  %s\n' "${stale[@]}"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'version=%s\n' "$version" >> "$GITHUB_OUTPUT"
fi
