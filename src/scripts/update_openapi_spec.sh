#!/usr/bin/env bash
# Snapshot the FusionAuth OpenAPI spec that the API reference's interactive client renders.
set -euo pipefail

usage() {
  printf 'Usage: bash src/scripts/update_openapi_spec.sh [--check] [TAG]\n'
  printf 'Pin astro/src/content/openapi/openapi.yaml to a fusionauth-openapi release tag (default: the newest tag).\n'
  printf 'With --check, report whether a newer tag exists without changing files.\n'
}

mode=update
tag=''
for argument in "$@"; do
  case "$argument" in
    --check) mode=check ;;
    --help) usage; exit 0 ;;
    -*) printf 'Unknown argument: %s\n' "$argument" >&2; usage >&2; exit 2 ;;
    *) tag="$argument" ;;
  esac
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
snapshot_dir="$repo_root/astro/src/content/openapi"
spec="$snapshot_dir/openapi.yaml"
sources="$snapshot_dir/SOURCE.md"
upstream='https://github.com/FusionAuth/fusionauth-openapi.git'

# release tags look like 1.69.0; annotated tags list their commit on the peeled ^{} line, which wins; sort -V puts the newest last
tags="$(git ls-remote --tags "$upstream" | sed -E 's|refs/tags/||' | awk '{tag = $2; peeled = sub(/\^\{\}$/, "", tag); if (peeled || !(tag in sha)) sha[tag] = $1} END {for (t in sha) print sha[t], t}' |
  grep -E ' [0-9]+\.[0-9]+\.[0-9]+$' | sort -k2 -V)"
if [[ -z "$tags" ]]; then
  printf 'Could not list release tags for %s.\n' "$upstream" >&2
  exit 1
fi
latest_tag="$(tail -1 <<< "$tags" | awk '{print $2}')"
recorded_tag="$(sed -nE 's/^\| Tag \| `([^`]+)` \|$/\1/p' "$sources" 2>/dev/null || true)"

if [[ "$mode" == check ]]; then
  if [[ "$recorded_tag" == "$latest_tag" ]]; then
    printf 'The OpenAPI snapshot is pinned to %s, the newest fusionauth-openapi release.\n' "$latest_tag"
    exit 0
  fi
  message="The OpenAPI snapshot is pinned to ${recorded_tag:-nothing}, but fusionauth-openapi has released $latest_tag."
  printf '%s\nRun bash src/scripts/update_openapi_spec.sh, review the diff, then open a PR.\n' "$message" >&2
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf '## OpenAPI spec is behind\n\n%s\n\n```bash\nbash src/scripts/update_openapi_spec.sh\n```\n' "$message" >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 1
fi

tag="${tag:-$latest_tag}"
commit="$(awk -v t="$tag" '$2 == t {print $1}' <<< "$tags")"
if [[ -z "$commit" ]]; then
  printf 'fusionauth-openapi has no release tag %s.\n' "$tag" >&2
  exit 1
fi

staging="$(mktemp)"
trap 'rm -f "$staging"' EXIT
curl --disable --fail --silent --show-error --location --retry 2 --proto '=https' \
  --output "$staging" "https://raw.githubusercontent.com/FusionAuth/fusionauth-openapi/$commit/openapi.yaml"
if ! head -c 4096 "$staging" | grep -q '^openapi:'; then
  printf 'The downloaded file for %s does not look like an OpenAPI spec. Nothing was changed.\n' "$tag" >&2
  exit 1
fi

mkdir -p "$snapshot_dir"
mv "$staging" "$spec"
cat > "$sources" <<EOF
# OpenAPI spec snapshot

\`openapi.yaml\` is a copy of the spec from [fusionauth-openapi](https://github.com/FusionAuth/fusionauth-openapi), pinned to a release so builds don't change when that repository does. The interactive client on every API reference page (\`<API>\`) renders from it.

| Field | Value |
| --- | --- |
| Tag | \`$tag\` |
| Commit | \`$commit\` |

Refresh it after each FusionAuth release with \`bash src/scripts/update_openapi_spec.sh\` from the repository root, or pass a tag to pin a specific release. The weekly Check external content workflow reports when a newer release exists.
EOF
printf 'Pinned the OpenAPI snapshot to %s (%s). Review the diff before committing.\n' "$tag" "$commit"
