#!/usr/bin/env bash
# Smoke test of the web app through the Ingress: index page, SPA route fallback, built-in API base URL.
#
#   scripts/k8s-smoke.sh                                  # http://localhost:16969
#   BASE_URL=http://localhost scripts/k8s-smoke.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:16969}"

# Retry only transport errors and 502/503/504 (Ingress endpoints still converging).
fetch() {
  local out status
  for attempt in $(seq 1 20); do
    out="$(curl -sS -m 10 -w '\n%{http_code}' "$1" 2>/dev/null)" || out=$'\n000'
    status="${out##*$'\n'}"
    case "$status" in
      000|502|503|504) sleep 3 ;;
      *) printf '%s' "$out"; return 0 ;;
    esac
  done
  printf '%s' "$out"
}
body_of() { printf '%s' "${1%$'\n'*}"; }
status_of() { printf '%s' "${1##*$'\n'}"; }

echo "==> GET $BASE_URL/"
res="$(fetch "$BASE_URL/")"
[ "$(status_of "$res")" = "200" ] || { echo "index failed: HTTP $(status_of "$res")" >&2; exit 1; }
grep -q 'id="root"' <<<"$(body_of "$res")" || { echo "index.html has no #root element" >&2; exit 1; }

echo "==> SPA fallback: GET $BASE_URL/login (React Router path, no such file)"
res="$(fetch "$BASE_URL/login")"
[ "$(status_of "$res")" = "200" ] || { echo "SPA fallback failed: HTTP $(status_of "$res")" >&2; exit 1; }
grep -q 'id="root"' <<<"$(body_of "$res")" || { echo "SPA fallback did not return index.html" >&2; exit 1; }

echo "==> bundle points the API at /aomaoi-api/api"
bundle="$(body_of "$(fetch "$BASE_URL/")" | sed -n 's/.*src="\(\/assets\/[^"]*\.js\)".*/\1/p' | head -1)"
[ -n "$bundle" ] || { echo "no JS bundle referenced by index.html" >&2; exit 1; }
res="$(fetch "$BASE_URL$bundle")"
[ "$(status_of "$res")" = "200" ] || { echo "bundle fetch failed: HTTP $(status_of "$res")" >&2; exit 1; }
grep -q '/aomaoi-api/api' <<<"$(body_of "$res")" || { echo "bundle was built without VITE_API_BASE_URL=/aomaoi-api/api" >&2; exit 1; }

echo "Smoke test passed."
