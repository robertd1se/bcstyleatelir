// Transcribe un video/audio con whisper.cpp, con tiempos por palabra.
// Uso: node scripts/transcribir.mjs <archivo> [idioma=es] [modelo=base]
// Salida: <archivo>.captions.json junto al archivo (lista de Caption de @remotion/captions)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { ffmpeg, WHISPER } from "./comun.mjs";

const [entrada, idioma = "es", modelo = "base"] = process.argv.slice(2);
if (!entrada) {
  console.error("Uso: node scripts/transcribir.mjs <archivo> [idioma] [modelo]");
  process.exit(1);
}

// whisper.cpp necesita WAV 16 kHz mono
const wav = path.join(os.tmpdir(), `whisper-${Date.now()}.wav`);
ffmpeg(["-i", entrada, "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav]);

const salidaWhisper = await transcribe({
  inputPath: wav,
  whisperPath: WHISPER,
  whisperCppVersion: "1.5.5",
  model: modelo,
  modelFolder: WHISPER,
  tokenLevelTimestamps: true,
  language: idioma,
  splitOnWord: true,
});
fs.rmSync(wav);

const { captions } = toCaptions({ whisperCppOutput: salidaWhisper });
const destino = `${entrada}.captions.json`;
fs.writeFileSync(destino, JSON.stringify(captions, null, 2));
console.log(`${captions.length} palabras → ${destino}`);
console.log(captions.map((c) => c.text).join("").trim());
