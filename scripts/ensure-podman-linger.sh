#!/usr/bin/env bash
# Enable systemd linger so rootless Podman containers survive SSH / CI logout.
# Idempotent: Linger=yes exits 0. SKIP_LINGER=1 skips (rootful Podman / other supervisor).
#
# Usage (on the deploy host, as the deploy user):
#   DEPLOY_USER="$(whoami)" bash scripts/ensure-podman-linger.sh
# CI pipes this file over SSH with DEPLOY_USER set to the SSH user.
set -euo pipefail

if [ "${SKIP_LINGER:-0}" = "1" ]; then
  echo "ensure-podman-linger: SKIP_LINGER=1, skipping"
  exit 0
fi

if ! command -v loginctl >/dev/null 2>&1; then
  echo "ensure-podman-linger: loginctl not found" >&2
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"

linger_is_yes() {
  loginctl show-user "$DEPLOY_USER" -p Linger 2>/dev/null | grep -qx "Linger=yes"
}

if linger_is_yes; then
  echo "ensure-podman-linger: Linger already yes for ${DEPLOY_USER}"
  exit 0
fi

if loginctl enable-linger "$DEPLOY_USER"; then
  :
elif command -v sudo >/dev/null 2>&1 && sudo loginctl enable-linger "$DEPLOY_USER"; then
  :
else
  echo "ensure-podman-linger: failed to enable linger for ${DEPLOY_USER}" >&2
  exit 1
fi

if ! linger_is_yes; then
  echo "ensure-podman-linger: Linger is not yes after enable for ${DEPLOY_USER}" >&2
  exit 1
fi

echo "ensure-podman-linger: Linger=yes for ${DEPLOY_USER}"
