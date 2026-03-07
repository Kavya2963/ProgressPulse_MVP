#!/bin/bash
set -e

MODEL="${OLLAMA_MODEL:-llama3.1:8b}"

echo "🚀 ProgressPulse Ollama — Model: $MODEL"

# Start ollama server in background
ollama serve &
OLLAMA_PID=$!

# Wait for server ready (max 60 seconds)
echo "⏳ Waiting for Ollama..."
for i in {1..60}; do
  if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama ready"
    break
  fi
  sleep 1
done

echo "🟢 Ollama is running"
wait $OLLAMA_PID
