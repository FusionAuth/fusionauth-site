#!/bin/bash
#
# Get an accurate count of users in a FusionAuth instance using the Search API.
#
# Uses `accurateTotal: true` so the count is correct even past the default
# 10,000-result Elasticsearch ceiling, and requests only 1 user record back
# to keep load on the FusionAuth instance to a minimum.
#
# Requires: curl, jq

set -euo pipefail

# ---- Configuration ---------------------------------------------------------
INSTANCE_URL="https://your-instance.fusionauth.io"  # no trailing slash
API_KEY="your_api_key_here" # must have POST on /api/user/search 
NUMBER_OF_RESULTS=1   # how many user records to actually return; keep this low
# ----------------------------------------------------------------------------

# Sanity checks
if [[ "${API_KEY}" == "your_api_key_here" || "${INSTANCE_URL}" == "https://your-instance.fusionauth.io" ]]; then
    echo "ERROR: Please set INSTANCE_URL and API_KEY at the top of the script." >&2
    exit 2
fi

for cmd in curl jq; do
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        echo "ERROR: '${cmd}' is required but not installed." >&2
        exit 2
    fi
done

# Strip any trailing slash from the instance URL
INSTANCE_URL="${INSTANCE_URL%/}"

# Build the request body
REQUEST_BODY=$(jq -n --argjson n "${NUMBER_OF_RESULTS}" '{
    search: {
        accurateTotal: true,
        queryString: "*",
        numberOfResults: $n,
        startRow: 0
    }
}')

# Call the Search API. Capture the body and HTTP status separately.
HTTP_RESPONSE=$(curl -sS -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    --data "${REQUEST_BODY}" \
    "${INSTANCE_URL}/api/user/search")

HTTP_STATUS=$(echo "${HTTP_RESPONSE}" | tail -n 1)
HTTP_BODY=$(echo "${HTTP_RESPONSE}" | sed '$d')

if [[ "${HTTP_STATUS}" != "200" ]]; then
    echo "ERROR: FusionAuth returned HTTP ${HTTP_STATUS}" >&2
    echo "${HTTP_BODY}" >&2
    exit 1
fi

# Pull out the total
TOTAL=$(echo "${HTTP_BODY}" | jq -r '.total // empty')

if [[ -z "${TOTAL}" ]]; then
    echo "ERROR: Unexpected response (no 'total' field):" >&2
    echo "${HTTP_BODY}" >&2
    exit 1
fi

# Print with thousands separators (fall back to raw number if printf locale support is missing)
if printf "%'d" 1000 >/dev/null 2>&1; then
    printf "Total users in %s: %'d\n" "${INSTANCE_URL}" "${TOTAL}"
else
    echo "Total users in ${INSTANCE_URL}: ${TOTAL}"
fi
