#!/bin/bash
set -euo pipefail
SRC="${1:-$HOME/development/nami-motion-videos}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEOS="$ROOT/apps/site/public/videos"
POSTERS="$ROOT/apps/site/public/posters"
MEDIA="$ROOT/media"
STAGE="crop=iw:iw*8/9:0:ih*0.3135"
mkdir -p "$VIDEOS" "$POSTERS" "$MEDIA"
for mov in "$SRC"/*.mov; do
  slug="$(basename "$mov" .mov)"
  ffmpeg -loglevel error -y -i "$mov" -t 10 -an -vf "$STAGE,scale=720:-2,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart "$VIDEOS/$slug.mp4"
  cp "$VIDEOS/$slug.mp4" "$SRC/$slug.mp4"
  ffmpeg -loglevel error -y -ss 4 -i "$mov" -frames:v 1 -vf "$STAGE,scale=720:-2" -q:v 4 "$POSTERS/$slug.jpg"
  ffmpeg -loglevel error -y -t 6 -i "$mov" -vf "$STAGE,fps=12,scale=320:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" "$MEDIA/$slug.gif"
  echo "$slug"
done
