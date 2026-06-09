#!/usr/bin/env bash
docker run --rm -v "$(pwd):/app" -w /app node:24-alpine sh -c "npm install && npm test"