#!/usr/bin/env bash
# Pin the FusionAuth release the docs document in fusionauth-version, and copy it into the files that can't read that file.
set -euo pipefail

mode=update
unreleased=false
case "${1:-}" in
  '') ;;
  --unreleased) unreleased=true ;;
  --check) mode=check ;;
  --check-latest) mode=check-latest ;;
  --help)
    printf 'Usage: bash scripts/update_fusionauth_version.sh [--check | --check-latest | --unreleased]\n'
    printf 'Pin the latest FusionAuth release in fusionauth-version, and copy it into:\n'
    printf '  astro/public/docs/docker-compose.yml (served at /docs/docker-compose.yml, and run by the example-testing-lambdas tests)\n'
    printf '  astro/screenshots/docker-compose.yml (retake screenshots after changing it)\n'
    printf '  astro/src/content/docs/deploy/production/install/fusionauth-app.mdx (the production Docker examples)\n'
    printf '  astro/extractedcode/example-lambdas/docker-compose.yml (the lambda conformance check)\n'
    printf 'Set FUSIONAUTH_VERSION to pin a specific version. With --check, report copies that differ from fusionauth-version without changing files, and fail if the pinned image is not on Docker Hub.\n'
    printf 'With --check-latest, fail when fusionauth-version pins a release other than the latest one.\n'
    printf 'With --unreleased, pin FUSIONAUTH_VERSION even if its image is not on Docker Hub yet, to prepare a release branch. Requires FUSIONAUTH_VERSION.\n'
    exit 0 ;;
  *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/run-locally.sh"
source "$repo_root/scripts/lib/fusionauth-version.sh"
pin_file=fusionauth-version
copies=(astro/public/docs/docker-compose.yml astro/screenshots/docker-compose.yml astro/src/content/docs/deploy/production/install/fusionauth-app.mdx
        astro/extractedcode/example-lambdas/docker-compose.yml)
pinned="$(pinned_fusionauth_version)"

latest_release() {
  local latest
  if ! latest="$(curl -f --silent https://account.fusionauth.io/api/version | jq -r '.versions[-1]')"; then
    printf 'Error: could not read the latest FusionAuth release from https://account.fusionauth.io/api/version.\n' >&2
    return 1
  fi
  printf '%s\n' "$latest"
}

if [[ "$mode" == check-latest ]]; then
  trap 'run_locally "bash scripts/update_fusionauth_version.sh --check-latest"' EXIT
  latest="$(latest_release)"
  if [[ "$latest" == "$pinned" ]]; then
    printf '%s pins FusionAuth %s, the latest release.\n' "$pin_file" "$pinned"
    exit 0
  fi
  details="Version mismatch: $pin_file pins FusionAuth $pinned, but the latest release is FusionAuth $latest. Once the docs for $latest are on main, merge the \"chore: pin FusionAuth $latest\" PR, or run \"FUSIONAUTH_VERSION=$latest bash scripts/update_fusionauth_version.sh\" and open a PR. See \"Update the docs for a new FusionAuth release\" in the README."
  printf '%s\n' "$details" >&2
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf 'details=%s\n' "$details" >> "$GITHUB_OUTPUT"
  fi
  exit 1
fi

image_published() {
  curl -f --silent --output /dev/null "https://hub.docker.com/v2/repositories/fusionauth/fusionauth-app/tags/$1"
}

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
  # a pin made with --unreleased must not merge before readers can pull the image
  if ! image_published "$pinned"; then
    printf 'fusionauth/fusionauth-app:%s is not on Docker Hub yet, or Docker Hub could not be reached. Wait for the image to be published, then re-run this check.\n' "$pinned" >&2
    exit 1
  fi
  printf 'fusionauth/fusionauth-app:%s is on Docker Hub.\n' "$pinned"
  exit 0
fi

if [[ "$unreleased" == true && -z "${FUSIONAUTH_VERSION:-}" ]]; then
  printf 'With --unreleased, set FUSIONAUTH_VERSION to the upcoming release, for example: FUSIONAUTH_VERSION=1.71.0 bash scripts/update_fusionauth_version.sh --unreleased\n' >&2
  exit 2
fi
version="${FUSIONAUTH_VERSION:-$(latest_release)}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Unexpected FusionAuth version "%s". Nothing was changed.\n' "$version" >&2
  exit 1
fi
flag="$([[ "$unreleased" == true ]] && printf ' --unreleased' || true)"
trap 'run_locally "FUSIONAUTH_VERSION=$version bash scripts/update_fusionauth_version.sh$flag"' EXIT

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
if [[ "$unreleased" == true ]]; then
  printf 'Pinning FusionAuth %s without checking Docker Hub. Merge only after fusionauth/fusionauth-app:%s is published.\n' "$version" "$version"
elif ! image_published "$version"; then
  printf 'fusionauth/fusionauth-app:%s is not on Docker Hub yet. Nothing was changed.\n' "$version"
  printf 'To pin it anyway on a release branch, add --unreleased.\n'
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
