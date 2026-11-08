#!/usr/bin/env bash
# Runs on first boot as root via EC2 user_data.
# Downloads the preview server scripts from the public repo and runs setup.sh.
set -euo pipefail

SETUP_DIR=/tmp/preview-setup
mkdir -p "$SETUP_DIR/scripts"

BASE="https://raw.githubusercontent.com/FusionAuth/fusionauth-site/main/_preview-server"
curl -fsSL "$BASE/setup.sh"                     -o "$SETUP_DIR/setup.sh"
curl -fsSL "$BASE/scripts/build-preview.sh"     -o "$SETUP_DIR/scripts/build-preview.sh"
curl -fsSL "$BASE/scripts/release-slot.sh"      -o "$SETUP_DIR/scripts/release-slot.sh"

bash "$SETUP_DIR/setup.sh" "${repo_url}" "${admin_email}"
