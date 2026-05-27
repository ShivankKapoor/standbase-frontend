#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="standbase-frontend"
CONTAINER_NAME="standbase-frontend"
HOST_PORT="${PORT:-5555}"

# Required — pass as env var or edit here
API_URL="${VITE_API_URL:-https://standbase.shivankkapoor.com}"

echo "Building image (API URL: $API_URL) …"
podman build \
  --build-arg VITE_API_URL="$API_URL" \
  -t "$IMAGE_NAME" \
  "$(dirname "$0")"

echo "Stopping existing container (if any) …"
podman rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting container on port $HOST_PORT …"
podman run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:8080" \
  "$IMAGE_NAME"

echo "Running at http://localhost:$HOST_PORT"
