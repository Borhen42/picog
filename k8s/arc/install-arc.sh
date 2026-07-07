#!/usr/bin/env bash
# Bootstrap Actions Runner Controller (ARC) so COGNIVITA CI runs on self-hosted runners
# INSIDE the WSL kubeadm cluster (which is what lets the pipelines reach SonarQube at
# sonarqube-sonarqube.sonarqube.svc.cluster.local:9000). Run once, from the repo root, in WSL.
#
#   export GH_PAT=ghp_xxx        # classic PAT with 'repo' scope (see k8s/arc/README.md)
#   ./k8s/arc/install-arc.sh
#
# Idempotent: safe to re-run (uses `helm upgrade --install`). Pinned to ARC 0.14.2.
set -euo pipefail

ARC_VERSION="0.14.2"
CONTROLLER_NS="arc-systems"
RUNNERS_NS="arc-runners"
RUNNER_SET="cognivita-runners"          # == the `runs-on:` label in the workflows
VALUES="$(dirname "$0")/runner-scale-set-values.yaml"
OCI="oci://ghcr.io/actions/actions-runner-controller-charts"

if [[ -z "${GH_PAT:-}" ]]; then
  echo "ERROR: set GH_PAT to a classic PAT with 'repo' scope first, e.g.:" >&2
  echo "  export GH_PAT=ghp_xxx" >&2
  exit 1
fi

echo "==> 1/3 Installing ARC controller (${ARC_VERSION}) into ${CONTROLLER_NS}"
helm upgrade --install arc "${OCI}/gha-runner-scale-set-controller" \
  --namespace "${CONTROLLER_NS}" --create-namespace \
  --version "${ARC_VERSION}" --wait

echo "==> 2/3 Creating PAT secret 'arc-github-secret' in ${RUNNERS_NS}"
kubectl create namespace "${RUNNERS_NS}" --dry-run=client -o yaml | kubectl apply -f -
kubectl -n "${RUNNERS_NS}" create secret generic arc-github-secret \
  --from-literal=github_token="${GH_PAT}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "==> 3/3 Installing runner scale set '${RUNNER_SET}' into ${RUNNERS_NS}"
helm upgrade --install "${RUNNER_SET}" "${OCI}/gha-runner-scale-set" \
  --namespace "${RUNNERS_NS}" \
  --version "${ARC_VERSION}" \
  -f "${VALUES}" --wait

cat <<EOF

Done. Verify:
  kubectl -n ${CONTROLLER_NS} get pods
  kubectl -n ${RUNNERS_NS}   get pods,autoscalingrunnersets
GitHub: Settings > Actions > Runners should show '${RUNNER_SET}' online.
Workflows use:  runs-on: ${RUNNER_SET}
EOF
