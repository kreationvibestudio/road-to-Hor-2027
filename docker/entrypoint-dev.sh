#!/bin/sh
set -e
# Bind mount hides image node_modules; named volume may be empty on first run.
if [ ! -d node_modules ] || [ ! -f node_modules/.bin/vite ]; then
  echo "Installing dependencies (npm ci)..."
  npm ci
fi
exec "$@"
