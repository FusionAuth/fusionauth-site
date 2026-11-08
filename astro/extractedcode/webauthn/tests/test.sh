#!/usr/bin/env bash
docker run --rm -v "$(pwd):/app" -w /app node:26 sh -c "npm install && npm test"