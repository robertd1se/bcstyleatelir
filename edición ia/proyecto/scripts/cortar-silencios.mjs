// Corta los silencios de un video con el filtro silencedetect de FFmpeg.
// Uso: node scripts/cortar-silencios.mjs <entrada> <salida> [umbralDb=-35] [minSilencioSeg=0.5] [margenSeg=0.1]
import { spawnSync } from "node:child_process";
import { duracionSeg, ffmpeg } from "./comun.mjs";

const [entrada, salida, umbral = "-35", minSil = "0.5", margen = "0.1"] = process.argv.slice(2);
if (!entrada || !salida) {
  console.error("Uso: node scripts/cortar-silencios.mjs <entrada> <salida> [umbralDb] [minSilencioSeg] [margenSeg]");
  process.exit(1);
}

// silencedetect escribe sus resultados en stderr
const log = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-i", entrada, "-af", `silencedetect=noise=${umbral}dB:d=${minSil}`, "-f", "null", "-"],
  { encoding: "utf8" },
).stderr;

const total = duracionSeg(entrada);
const m = Number(margen);
const silencios = [];
for (const linea of log.split("\n")) {
  const ini = linea.match(/silence_start: ([\d.]+)/);
  const fin = linea.match(/silence_end: ([\d.]+)/);
  if (ini) silencios.push({ ini: Number(ini[1]), fin: total });
  if (fin && silencios.length) silencios[silencios.length - 1].fin = Number(fin[1]);
}

// Partes con voz = lo que queda entre silencios (dejando un pequeño margen)
const partes = [];
let cursor = 0;
for (const s of silencios) {
  const a = cursor, b = Math.min(total, s.ini + m);
  if (b - a > 0.05) partes.push([a, b]);
  cursor = Math.max(cursor, s.fin - m);
}
if (total - cursor > 0.05) partes.push([cursor, total]);

if (partes.length === 0) {
  console.error("No se encontró voz: revisá el umbral.");
  process.exit(1);
}

const sel = partes.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join("+");
ffmpeg([
  "-i", entrada,
  "-vf", `select='${sel}',setpts=N/FRAME_RATE/TB`,
  "-af", `aselect='${sel}',asetpts=N/SR/TB`,
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-c:a", "aac",
  salida,
]);
const nueva = duracionSeg(salida);
console.log(`${silencios.length} silencios cortados: ${total.toFixed(1)}s → ${nueva.toFixed(1)}s → ${salida}`);
