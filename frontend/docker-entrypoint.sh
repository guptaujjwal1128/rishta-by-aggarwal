#!/bin/sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL:-}",
  VITE_GOOGLE_CLIENT_ID: "${VITE_GOOGLE_CLIENT_ID:-}"
};
EOF

envsubst '${PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
