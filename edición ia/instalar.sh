#!/usr/bin/env bash
# Reinstala todo lo que no se guarda en Git (dependencias, whisper.cpp y su modelo).
# Uso: bash instalar.sh [modelo]   (modelo por defecto: base; opciones: tiny, base, small...)
set -euo pipefail
cd "$(dirname "$0")"

command -v node >/dev/null || { echo "Falta Node.js 20+ (https://nodejs.org)"; exit 1; }
command -v ffmpeg >/dev/null || { echo "Falta FFmpeg (Ubuntu: sudo apt install ffmpeg)"; exit 1; }
command -v yt-dlp >/dev/null || pip3 install --user yt-dlp || pip3 install --break-system-packages yt-dlp

cd proyecto
npm install
NODE_USE_ENV_PROXY=1 node scripts/instalar-whisper.mjs "${1:-base}"

# Voz sintética (Piper) para la serie explicativa
python3 -c "import piper" 2>/dev/null || pip3 install --user piper-tts || pip3 install --break-system-packages piper-tts
mkdir -p voces
for ext in onnx onnx.json; do
  [ -s voces/es_MX-claude-high.$ext ] || curl -sSfL -o voces/es_MX-claude-high.$ext \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/claude/high/es_MX-claude-high.$ext"
done
echo "Todo listo."
