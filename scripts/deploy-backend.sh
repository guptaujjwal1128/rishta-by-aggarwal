#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/env.sh
source "$SCRIPT_DIR/lib/env.sh"

load_env_file "${1:-$ROOT_DIR/deploy/.env}"

if [[ -z "${BACKEND_REGION:-}" ]]; then
  require_var REGION
  BACKEND_REGION="$REGION"
fi
require_var PROJECT_ID
require_var BACKEND_SERVICE
require_var BACKEND_IMAGE
require_var GOOGLE_CLIENT_ID
require_var GEMINI_MODEL
require_var ADMIN_EMAIL
require_var ADMIN_NAME
require_var DATABASE_URL_SECRET
require_var JWT_SECRET_SECRET
require_var GEMINI_API_KEY_SECRET

env_vars="NODE_ENV=${NODE_ENV:-production},GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},GEMINI_MODEL=${GEMINI_MODEL},GCS_UPLOAD_BUCKET=${GCS_UPLOAD_BUCKET:-},ADMIN_EMAIL=${ADMIN_EMAIL},ADMIN_NAME=${ADMIN_NAME}"
secret_vars="DATABASE_URL=${DATABASE_URL_SECRET}:latest,JWT_SECRET=${JWT_SECRET_SECRET}:latest,GEMINI_API_KEY=${GEMINI_API_KEY_SECRET}:latest"
runtime_service_account="${RUNTIME_SERVICE_ACCOUNT:-github-deploy@${PROJECT_ID}.iam.gserviceaccount.com}"

if [[ -n "${ADMIN_PASSWORD_SECRET:-}" ]]; then
  secret_vars="${secret_vars},ADMIN_PASSWORD=${ADMIN_PASSWORD_SECRET}:latest"
else
  require_var ADMIN_PASSWORD
  env_vars="${env_vars},ADMIN_PASSWORD=${ADMIN_PASSWORD}"
fi

args=(
  run deploy "$BACKEND_SERVICE"
  --image "$(image_ref "$BACKEND_IMAGE")"
  --region "$BACKEND_REGION"
  --allow-unauthenticated
  --port 8080
  --cpu 1
  --memory 512Mi
  --min-instances 0
  --max-instances 1
  --service-account "$runtime_service_account"
  --set-env-vars "$env_vars"
  --set-secrets "$secret_vars"
)

if [[ -n "${CLOUD_SQL_INSTANCE:-}" ]]; then
  args+=(--add-cloudsql-instances "$CLOUD_SQL_INSTANCE")
fi

gcloud "${args[@]}"
