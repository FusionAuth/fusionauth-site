#!/usr/bin/env bash
# Refresh the OpenAPI spec the site serves at /docs/openapi.yaml and the API reference renders.
set -euo pipefail

mode=update
case "${1:-}" in
  '') ;;
  --check) mode=check ;;
  --help)
    printf 'Usage: bash scripts/update_openapi_spec.sh [--check]\n'
    printf 'Download the spec for the pinned FusionAuth release from fusionauth-openapi into astro/public/docs/openapi.yaml.\n'
    printf 'The spec comes from the newest fusionauth-openapi tag at or before fusionauth-version, or FUSIONAUTH_VERSION when set.\n'
    printf 'With --check, report whether upstream differs without changing files.\n'
    printf 'Set OPENAPI_REF to a fusionauth-openapi commit to use it instead of the tag.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/run-locally.sh"
source "$repo_root/scripts/lib/fusionauth-version.sh"
spec="$repo_root/astro/public/docs/openapi.yaml"

ref="${OPENAPI_REF:-}"
if [[ -z "$ref" ]]; then
  version="${FUSIONAUTH_VERSION:-$(pinned_fusionauth_version)}"
  tags="$(git ls-remote --tags https://github.com/FusionAuth/fusionauth-openapi.git)"
  # only spec-changing releases get tags; "-pin" sorts after an equal tag and before the next, so take the line above it
  tag="$({ awk '{sub("refs/tags/", "", $2); print $2}' <<< "$tags" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$'; echo "$version-pin"; } | sort -V | awk -v pin="$version-pin" '$0 == pin { print last; exit } { last = $0 }')"
  # annotated tags list the commit on a ^{} line
  ref="$(awk -v t="refs/tags/$tag" '$2 == t || $2 == t "^{}" { sha = $1 } END { print sha }' <<< "$tags")"
  printf 'FusionAuth %s uses the fusionauth-openapi %s tag.\n' "$version" "$tag"
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
