#!/bin/bash
# ==============================================================================
# Vialiq EDC — MongoDB Docker Healthcheck Script
# ==============================================================================
set -eo pipefail

PORT="${MONGO_PORT:-27017}"

# Ping the database using mongosh
mongosh --port "$PORT" --quiet --eval "db.adminCommand('ping').ok" | grep 1 > /dev/null
