#!/usr/bin/env bash

# Ensure the example apps listed at https://fusionauth.io/docs/extend/examples/example-repos
# and the count of repos that should be on that page are the same.

# set -o errexit
set -o nounset
set -o pipefail

MYDIR=$(cd -- "$(dirname "$0")" || exit >/dev/null 2>&1; pwd -P)
export MYDIR
cd "${MYDIR}" || exit

JSONFILE="../../astro/src/content/json/exampleapps.json"
SUM_JSON=0  # Count of repos from JSONFILE
SUM_GH=0    # Count of repos from gh cli
TOTAL=0     # Difference between SUM_JSON and SUM_GH

# Parse args, if any.
DIFF=0
VERBOSE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--diff) DIFF=1; shift;;
    -v|--verbose) VERBOSE=1; shift;;
    *) echo "ERROR: invalid argument"; exit 1;;
  esac
done


# Get the repo URLs from JSONFILE and extract the repo names.
# Sort them and output to json.list
function get_json_repos() {
  # Repos that will be returned by the `gh` commands below, but are
  # intentionally excluded from JSONFILE for... reasons?
  local EXCLUDE=(
    "fusionauth-example-template"
    "fusionauth-example-vue-sdk"
    "fusionauth-quickstart-kotlin-android-native"
    "fusionauth-quickstart-javascript-nuxt-web"
  )

  jq -r '.[].url' "$JSONFILE" | awk -F'/' '{print $NF}' > json.list

  # Add the EXCLUDE repos to json.list
  for repo in "${EXCLUDE[@]}"; do
    echo "$repo" >> json.list
  done
  sort -o json.list json.list

  # Get the count of repos in json.list
  SUM_JSON=$(wc -l < json.list | xargs)

  if [[ "$VERBOSE" -eq 1 ]]; then
    echo -e "\nRepos read from exampleapps.json:\n"
    cat json.list
    echo -e "\nSUM_JSON: $SUM_JSON"
  fi
}


# Get repos via gh cli
# Sort them and output to gh.list
function get_gh_repos() {
  # Repos that don't conform to naming standards. These have to be manually
  # added to the list of repos retrieved via the gh cli tool.
  local ADD_NAMES=(
    "fusionauth-containers"
    "fusionauth-contrib"
    "fusionauth-import-scripts"
    "fusionauth-theme-helper"
  )

  gh repo list fusionauth --no-archived --visibility public -L 300 \
    | grep fusionauth-example | awk '{print $1}' | awk -F'/' '{print $NF}' > gh.list

  # Get all fusionauth-quickstart repos, sort them, and output them to qs.list.
  gh repo list fusionauth --no-archived --visibility public -L 300 \
    | grep fusionauth-quickstart | awk '{print $1}' | awk -F'/' '{print $NF}' >> gh.list

  # Add the ADD_NAMES repos to gh.list
  for repo in "${ADD_NAMES[@]}"; do
    echo "$repo" >> gh.list
  done
  sort -o gh.list gh.list

  SUM_GH=$(wc -l < gh.list | xargs)

  if [[ "$VERBOSE" -eq 1 ]]; then
    echo -e "\ngh cli repos:\n"
    cat gh.list
    echo -e "\nSUM_GH: $SUM_GH"
  fi
}


function get_total() {
  TOTAL=$(( SUM_JSON - SUM_GH ))

  if [[ "$VERBOSE" -eq 1 ]]; then
    echo -e "\nTotals\n"
    echo "SUM_JSON:   $SUM_JSON"
    echo "  SUM_GH: - $SUM_GH"
    echo "          -----"
    echo "   TOTAL:   $TOTAL"
  fi
}


function show_diff() {
  set +xv
  echo -e "\nShowing file diff...\n"
  output="$(diff -du --color=always json.list gh.list)"
  if [[ -n "$output" ]]; then
      printf -- "%s\n" "$output"
  else
      printf -- "Files are identical, no diff to show\n"
  fi
}


function help() {
  echo -e "\nERROR: DIFF is non-zero\n"
  cat << EOF
This means that there is a discrepancy between the number of repos
in $(basename "$JSONFILE") and the repo counts being returned by calls
to the GitHub API. Try running the script with the -d flag to show the
file diff. This may indicate which repo(s) are causing the discrepancy.

If there is a discrepancy, you have three options to resolve it:

  1. Add it to $JSONFILE
  2. Add it to the EXCLUDE array, if it's intentionally excluded from $JSONFILE
  3. Add it to the ADD_NAMES array, if it's a repo with a non-standard name
EOF
}


function main() {
  get_json_repos
  get_gh_repos
  get_total

  # Show a file diff if reqiested.
  if [[ "$DIFF" -eq 1 ]]; then show_diff; fi

  # Show help if the check fails.
  if [[ "$TOTAL" -ne 0 ]]; then help; fi

  # Use TOTAL as the exit code. This means that if there's a non-zero
  # difference in the counts, this will fail.
  exit $TOTAL
}


main "$@"
