#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

load_env_file() {
  local env_file="${1:-$ROOT_DIR/deploy/.env}"
  if [[ ! -f "$env_file" ]]; then
    echo "Missing env file: $env_file" >&2
    echo "Copy deploy/.env.example to deploy/.env and fill it." >&2
    exit 1
  fi

  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
}

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required variable: $name" >&2
    exit 1
  fi
}

image_ref() {
  local image="$1"
  local tag="${IMAGE_TAG:-latest}"
  echo "${image}:${tag}"
}
