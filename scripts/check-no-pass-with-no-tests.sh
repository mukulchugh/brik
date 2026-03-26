#!/usr/bin/env bash
set -euo pipefail

if command -v rg >/dev/null 2>&1; then
  matches="$(rg -n "passWithNoTests" packages/**/package.json || true)"
else
  matches="$(grep -R -n "passWithNoTests" packages --include='package.json' || true)"
fi

if [[ -n "$matches" ]]; then
  echo "Found forbidden test bypass flag 'passWithNoTests' in package scripts:"
  echo "$matches"
  exit 1
fi

echo "No passWithNoTests usage found in package manifests."
