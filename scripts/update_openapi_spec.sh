#!/usr/bin/env bash
# Refresh the OpenAPI spec the site serves at /docs/openapi.yaml and the API reference renders.
set -euo pipefail

mode=update
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash scripts/update_openapi_spec.sh [--check]\n'
    printf 'Download the latest spec from fusionauth-openapi into astro/public/docs/openapi.yaml.\n'
    printf 'With --check, report whether upstream differs without changing files.\n'
    printf 'Set OPENAPI_REF to a fusionauth-openapi commit to use it instead of the main branch.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/run-locally.sh"
spec="$repo_root/astro/public/docs/openapi.yaml"

ref="${OPENAPI_REF:-}"
if [[ -z "$ref" ]]; then
  ref="$(git ls-remote --exit-code https://github.com/FusionAuth/fusionauth-openapi.git refs/heads/main | awk '{print $1}')"
fi
if [[ ! "$ref" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'Could not resolve a fusionauth-openapi commit (got "%s"). Nothing was changed.\n' "$ref" >&2
  exit 1
fi
url="https://raw.githubusercontent.com/FusionAuth/fusionauth-openapi/$ref/openapi.yaml"
reproduce="OPENAPI_REF=$ref bash scripts/update_openapi_spec.sh"
printf 'Comparing against fusionauth-openapi at %s\n' "$ref"

download="$(mktemp)"
trap 'rm -f "$download"' EXIT
curl --disable --fail --silent --show-error --location --retry 2 --proto '=https' --output "$download" "$url"
if ! grep -m 1 '^openapi:' "$download" > /dev/null; then
  printf 'The download from %s does not look like an OpenAPI spec. Nothing was changed.\n' "$url" >&2
  exit 1
fi

if cmp -s "$download" "$spec"; then
  printf 'The OpenAPI spec matches upstream.\n'
  run_locally "$reproduce"
  exit 0
fi

printf '\nProposed changes to astro/public/docs/openapi.yaml:\n'
spec_diff="$(diff -u --label astro/public/docs/openapi.yaml --label "fusionauth-openapi@$ref" "$spec" "$download" || true)"
printf '%s\n' "$spec_diff"

if [[ "$mode" == check ]]; then
  printf '\nThe OpenAPI spec differs from upstream. Run the command below, review the diff, then open a PR.\n' >&2
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf '## OpenAPI spec is out of date\n\n<details><summary>Diff</summary>\n\n```diff\n%s\n```\n\n</details>\n\n' "$spec_diff" >> "$GITHUB_STEP_SUMMARY"
  fi
  run_locally "$reproduce"
  exit 1
fi

mkdir -p "$(dirname "$spec")"
cat "$download" > "$spec"
printf 'Updated astro/public/docs/openapi.yaml. Review the diff before committing.\n'
run_locally "$reproduce"
