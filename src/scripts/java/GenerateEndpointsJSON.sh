#!/usr/bin/env bash
# Run GenerateEndpointsJSON.java against the latest fusionauth-app release.
# Downloads the app zip, compiles and runs the script, then cleans up.
# Must be run from the repo root.
set -euo pipefail

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Fetching latest FusionAuth version..." >&2
VERSION=$(curl -sf https://account.fusionauth.io/api/version | jq -r '.versions[-1]')
echo "Downloading fusionauth-app-${VERSION}.zip..." >&2
curl -fL "https://files.fusionauth.io/products/fusionauth/${VERSION}/fusionauth-app-${VERSION}.zip" \
  -o "$WORK_DIR/fusionauth-app.zip"
unzip -q "$WORK_DIR/fusionauth-app.zip" -d "$WORK_DIR/app"

CP=$(find "$WORK_DIR/app/fusionauth-app/lib" -name '*.jar' | tr '\n' ':' | sed 's/:$//')
mkdir -p "$WORK_DIR/classes"
javac -cp "$CP" -d "$WORK_DIR/classes" src/scripts/java/GenerateEndpointsJSON.java

OUTPUT="$(pwd)/astro/src/content/json/generated/api-endpoints.json"
java -cp "$CP:$WORK_DIR/classes" GenerateEndpointsJSON "$OUTPUT"
