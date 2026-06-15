# This is a starting workflow for building with GitHub Actions
name: Build

on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # Check out code
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      # Set up the build environment
      - run: npm ci --prefix "./complete-application/"

      # Build

      # Done!
