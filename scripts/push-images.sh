#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/env.sh
source "$SCRIPT_DIR/lib/env.sh"

load_env_file "${1:-$ROOT_DIR/deploy/.env}"
require_var BACKEND_IMAGE
require_var FRONTEND_IMAGE

docker push "$(image_ref "$BACKEND_IMAGE")"
docker push "$(image_ref "$FRONTEND_IMAGE")"
