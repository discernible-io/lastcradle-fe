#!/bin/sh
# Start fail-open OG inject helper, then nginx as PID 1 (node is reparented).
set -eu

node /app/server/og-inject.mjs &

i=0
while [ "$i" -lt 50 ]; do
  if node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    break
  fi
  i=$((i + 1))
  sleep 0.1
done

exec nginx -g "daemon off;"
