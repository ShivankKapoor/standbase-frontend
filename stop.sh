#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="standbase-frontend"
CONTAINER_NAME="standbase-frontend"

echo "Stopping container …"
podman rm -f "$CONTAINER_NAME" 2>/dev/null && echo "Container removed." || echo "No container running."

echo "Removing image …"
podman rmi "$IMAGE_NAME" 2>/dev/null && echo "Image removed." || echo "No image found."
