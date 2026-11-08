#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Building the app is as far as CI can go: logging in needs a simulator and a running FusionAuth, and macOS runners have no Docker.
# A simulator build needs no signing identity.
echo "Building the iOS app..."
cd "$PROJECT_DIR/complete-application"
xcodebuild -project fusionauth-quickstart-swift-ios-native.xcodeproj -scheme fusionauth-quickstart-swift-ios-native \
  -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
