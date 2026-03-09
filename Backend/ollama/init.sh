#!/bin/sh
set -e

# Ensure curl + grep are available
apk add --no-cache curl grep

echo "Checking model..."
INSTALLED=$(curl -sf http://ollama:11434/api/tags | grep -c "$OLLAMA_MODEL" || true)

if [ "$INSTALLED" -gt 0 ]; then
  echo "Model already installed."
else
  echo "Pulling model..."
  curl -sf -X POST http://ollama:11434/api/pull \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$OLLAMA_MODEL\"}" \
    --max-time 1200
fi
