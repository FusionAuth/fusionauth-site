name:
  test_install

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  # You can adjust the schedule as needed
  schedule:
    - cron: '31 17 5 * *'

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Cancel stale executions is easy
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test_install:
    runs-on: ubuntu-latest

    # timeout after a certain period
    timeout-minutes: 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install
        working-directory: complete-application