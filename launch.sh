#!/usr/bin/env bash
#
# Port-forward the Cognivita services that ArgoCD already deployed in the cluster.
#
# Usage: ./launch.sh
#
set -euo pipefail
NS=cognivita

# service:local-port:remote-port
FORWARDS=(
  "frontend:8080:80"
  "api-gateway:8093:8093"
  "eureka-server:8761:8080"
  "medical-service:8083:8083"
  "mmse-service:8085:8085"
  "keycloak:8090:8080"
  "medical-mysql:3306:3306"
  "mmse-mysql:3307:3306"
)

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

PIDS=()
cleanup() {
  log "Stopping port-forwards ..."
  for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
}
trap cleanup EXIT INT TERM

log "Starting port-forwards for namespace '$NS' ..."
for f in "${FORWARDS[@]}"; do
  IFS=: read -r svc local remote <<< "$f"
  if ! kubectl get svc "$svc" -n "$NS" --ignore-not-found -o name | grep -q .; then
    printf '   %-16s (not found, skipped)\n' "$svc"
    continue
  fi
  kubectl port-forward "svc/$svc" "$local:$remote" -n "$NS" >/dev/null 2>&1 &
  PIDS+=($!)
  printf '   %-16s http://localhost:%s\n' "$svc" "$local"
done

cat <<EOF

App:      http://localhost:8080
Eureka:   http://localhost:8761
Keycloak: http://localhost:8090

Press Ctrl+C to stop.
EOF

wait
