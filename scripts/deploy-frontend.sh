#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/env.sh
source "$SCRIPT_DIR/lib/env.sh"

load_env_file "${1:-$ROOT_DIR/deploy/.env}"

require_var REGION
require_var PROJECT_ID
require_var FRONTEND_SERVICE
require_var FRONTEND_IMAGE
require_var VITE_API_URL
require_var VITE_GOOGLE_CLIENT_ID

runtime_service_account="${RUNTIME_SERVICE_ACCOUNT:-github-deploy@${PROJECT_ID}.iam.gserviceaccount.com}"

gcloud run deploy "$FRONTEND_SERVICE" \
  --image "$(image_ref "$FRONTEND_IMAGE")" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 1 \
  --service-account "$runtime_service_account" \
  --set-env-vars "VITE_API_URL=${VITE_API_URL},VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}"
