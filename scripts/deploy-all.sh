#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-$SCRIPT_DIR/../deploy/.env.production}"

"$SCRIPT_DIR/build-backend.sh" "$ENV_FILE"
"$SCRIPT_DIR/build-frontend.sh" "$ENV_FILE"
"$SCRIPT_DIR/push-images.sh" "$ENV_FILE"
"$SCRIPT_DIR/deploy-backend.sh" "$ENV_FILE"
"$SCRIPT_DIR/deploy-frontend.sh" "$ENV_FILE"
