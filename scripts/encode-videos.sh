#!/bin/bash
set -euo pipefail
SRC="${1:-$HOME/development/nami-motion-videos}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEOS="$ROOT/apps/site/public/videos"
POSTERS="$ROOT/apps/site/public/posters"
MEDIA="$ROOT/media"
mkdir -p "$VIDEOS" "$POSTERS" "$MEDIA"
for mov in "$SRC"/*.mov; do
  slug="$(basename "$mov" .mov)"
  ffmpeg -loglevel error -y -i "$mov" -t 10 -an -vf "scale=540:-2,fps=30" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart "$VIDEOS/$slug.mp4"
  cp "$VIDEOS/$slug.mp4" "$SRC/$slug.mp4"
  ffmpeg -loglevel error -y -ss 4 -i "$mov" -frames:v 1 -vf "scale=540:-2" -q:v 4 "$POSTERS/$slug.jpg"
  ffmpeg -loglevel error -y -t 6 -i "$mov" -vf "fps=12,scale=220:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" "$MEDIA/$slug.gif"
  echo "$slug"
done
