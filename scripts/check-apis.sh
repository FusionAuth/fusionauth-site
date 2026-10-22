#!/usr/bin/env bash
# Checks the API docs against the client builder for the latest FusionAuth release.
#
# Usage: bash scripts/check-apis.sh [extra check-apis-against-client-json.rb options, e.g. --pr]
#
# Clones fusionauth-client-builder at the branch for the latest release, falling back to the
# minor release's .0 branch when a patch release has no branch of its own.
#
# Environment:
#   FUSIONAUTH_VERSION   release to check against; defaults to the latest from the version API
#   CLIENT_BUILDER_REF   client builder branch or commit to clone; defaults to the release's branch

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/run-locally.sh"
builder_url=https://github.com/fusionauth/fusionauth-client-builder
builder_dir="$(mktemp -d)"
trap 'rm -rf "$builder_dir"' EXIT

version="${FUSIONAUTH_VERSION:-$(curl -f --silent https://account.fusionauth.io/api/version | jq -r 'last(.versions[-1])')}"
ref="${CLIENT_BUILDER_REF:-}"
if [[ -z "$ref" ]]; then
  ref="$version"
  if ! git ls-remote --exit-code --heads "$builder_url" "$ref" > /dev/null 2>&1; then
    ref="${version%.*}.0"
  fi
fi

git init --quiet "$builder_dir"
git -C "$builder_dir" fetch --quiet --depth 1 "$builder_url" "$ref"
git -C "$builder_dir" checkout --quiet FETCH_HEAD
sha="$(git -C "$builder_dir" rev-parse HEAD)"
printf 'Checking API docs against fusionauth-client-builder %s at %s (release %s)\n' "$ref" "$sha" "$version"

args=""
[[ $# -eq 0 ]] || args=" $(printf '%q ' "$@")"
trap 'rm -rf "$builder_dir"; run_locally "FUSIONAUTH_VERSION=$version CLIENT_BUILDER_REF=$sha bash scripts/check-apis.sh${args% }"' EXIT

"$repo_root/scripts/check-apis-against-client-json.rb" -f "$repo_root/scripts/.checkapis.yaml" -c "$builder_dir" -v "$@"
