#!/usr/bin/env bash
# Refresh the OpenAPI spec the site serves at /docs/openapi.yaml and the API reference renders.
set -euo pipefail

mode=update
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash src/scripts/update_openapi_spec.sh [--check]\n'
    printf 'Download the latest spec from fusionauth-openapi into astro/public/docs/openapi.yaml.\n'
    printf 'With --check, report whether upstream differs without changing files.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
spec="$repo_root/astro/public/docs/openapi.yaml"
url='https://raw.githubusercontent.com/FusionAuth/fusionauth-openapi/main/openapi.yaml'

download="$(mktemp)"
trap 'rm -f "$download"' EXIT
curl --disable --fail --silent --show-error --location --retry 2 --proto '=https' --output "$download" "$url"
if ! grep -m 1 '^openapi:' "$download" > /dev/null; then
  printf 'The download from %s does not look like an OpenAPI spec. Nothing was changed.\n' "$url" >&2
  exit 1
fi

if cmp -s "$download" "$spec"; then
  printf 'The OpenAPI spec matches upstream.\n'
  exit 0
fi

if [[ "$mode" == check ]]; then
  printf 'The OpenAPI spec differs from upstream. Run bash src/scripts/update_openapi_spec.sh, review the diff, then open a PR.\n' >&2
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf '## OpenAPI spec is out of date\n\nRun this from the repo root, review the diff, then open a PR:\n\n```bash\nbash src/scripts/update_openapi_spec.sh\n```\n' >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 1
fi

mkdir -p "$(dirname "$spec")"
cat "$download" > "$spec"
printf 'Updated astro/public/docs/openapi.yaml. Review the diff before committing.\n'
