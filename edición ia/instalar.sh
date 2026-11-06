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

# Voz sintética (Kokoro, con Piper de respaldo), procesamiento de audio y música
for paq in kokoro-onnx soundfile pedalboard piper-tts; do
  python3 -c "import ${paq//-/_}" 2>/dev/null || pip3 install --user $paq || pip3 install --break-system-packages $paq
done
mkdir -p voces
for ext in onnx onnx.json; do
  [ -s voces/es_MX-claude-high.$ext ] || curl -sSfL -o voces/es_MX-claude-high.$ext \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/claude/high/es_MX-claude-high.$ext"
done
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s voces/$f ] || curl -sSfL -o voces/$f "https://huggingface.co/fastrtc/kokoro-onnx/resolve/main/$f"
done
echo "Todo listo."
