#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="${OUT:-$HOME/development/nami-motion-videos/screenshots}"
DEVICE="${DEVICE:-B56DACCD-E9B9-4240-A2EC-1950CCC7FE52}"
mkdir -p "$OUT"
if [ $# -eq 0 ]; then set -- "$DIR"/showcase/*.yaml; else set -- $(for name in "$@"; do ls "$DIR"/showcase/*"$name"*.yaml; done); fi
for flow in "$@"; do
  maestro --device "$DEVICE" test -e OUT="$OUT" "$flow"
done
