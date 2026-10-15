#!/usr/bin/env bash
# Deploy the web app to any Kubernetes cluster (Docker Desktop, kind, minikube, CI).
#
#   scripts/k8s-deploy.sh                                       # image ghcr.io/.../aomaoi-frontend:latest
#   FRONTEND_IMAGE=aomaoi-frontend:local scripts/k8s-deploy.sh   # locally built image
#
# Environment (all optional):
#   NAMESPACE        target namespace            (default: aomaoi-app, same as the backend)
#   FRONTEND_IMAGE   full image reference        (default: ghcr.io/mudst-2026-aomaoi/aomaoi-frontend:latest)
#   INGRESS_CLASS    IngressClass of your controller (default: nginx)
#   KUBE_CONTEXT     kubectl context to use      (default: current context)
#   ROLLOUT_TIMEOUT  seconds to wait for the rollout; raise on slow image pulls (default: 300)
set -euo pipefail

cd "$(dirname "$0")/.."

NAMESPACE="${NAMESPACE:-aomaoi-app}"
DEFAULT_IMAGE="ghcr.io/mudst-2026-aomaoi/aomaoi-frontend:latest"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-$DEFAULT_IMAGE}"
INGRESS_CLASS="${INGRESS_CLASS:-nginx}"
ROLLOUT_TIMEOUT="${ROLLOUT_TIMEOUT:-300}"

KUBECTL=(kubectl)
if [ -n "${KUBE_CONTEXT:-}" ]; then
  KUBECTL+=(--context "$KUBE_CONTEXT")
fi
k() { "${KUBECTL[@]}" "$@"; }

if ! [[ "$NAMESPACE" =~ ^[a-z0-9]([-a-z0-9]*[a-z0-9])?$ ]]; then
  echo "Invalid NAMESPACE '$NAMESPACE'" >&2; exit 1
fi
if ! [[ "$FRONTEND_IMAGE" =~ ^[a-zA-Z0-9][a-zA-Z0-9./:@_-]*$ ]]; then
  echo "Invalid FRONTEND_IMAGE '$FRONTEND_IMAGE'" >&2; exit 1
fi
if ! [[ "$INGRESS_CLASS" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]]; then
  echo "Invalid INGRESS_CLASS '$INGRESS_CLASS'" >&2; exit 1
fi

echo "==> Cluster: $(k config current-context)  namespace: $NAMESPACE  image: $FRONTEND_IMAGE"
k cluster-info >/dev/null

k kustomize k8s \
  | sed -e "s#$DEFAULT_IMAGE#$FRONTEND_IMAGE#g" \
        -e "s#aomaoi-app#$NAMESPACE#g" \
        -e "s#ingressClassName: nginx#ingressClassName: $INGRESS_CLASS#" \
  | k apply -f -

if ! k -n "$NAMESPACE" rollout status deployment/aomaoi-frontend --timeout="${ROLLOUT_TIMEOUT}s"; then
  k -n "$NAMESPACE" describe pods -l app=aomaoi-frontend >&2 || true
  k -n "$NAMESPACE" logs -l app=aomaoi-frontend --tail=80 >&2 || true
  exit 1
fi

actual="$(k -n "$NAMESPACE" get deployment aomaoi-frontend -o 'jsonpath={.spec.template.spec.containers[0].image}')"
if [ "$actual" != "$FRONTEND_IMAGE" ]; then
  echo "Deployment uses '$actual' but '$FRONTEND_IMAGE' was requested." >&2
  exit 1
fi

echo "Deployed $actual to namespace $NAMESPACE."
