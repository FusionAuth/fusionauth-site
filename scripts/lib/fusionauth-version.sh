# Sourced by the scripts that build or check docs against a FusionAuth release.
# pinned_fusionauth_version prints the release in fusionauth-version, or explains what's wrong with the file and fails.
# Usage: version="${FUSIONAUTH_VERSION:-$(pinned_fusionauth_version)}"

pinned_fusionauth_version() {
  local file version
  file="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/fusionauth-version"
  if [[ ! -f "$file" ]]; then
    printf 'Error: %s is missing. It pins the FusionAuth release the docs document.\n' "$file" >&2
    printf 'Restore it from main, or set FUSIONAUTH_VERSION for this run.\n' >&2
    return 1
  fi
  version="$(tr -d '[:space:]' < "$file")"
  if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    printf 'Error: %s must hold a single FusionAuth version like 1.70.0, but it holds "%s".\n' "$file" "$version" >&2
    return 1
  fi
  printf '%s\n' "$version"
}
