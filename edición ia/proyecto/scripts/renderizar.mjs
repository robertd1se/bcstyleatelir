// Arma el video final con Remotion: vertical 1080x1920, 30 fps, subtítulos animados y música opcional.
// Uso: node scripts/renderizar.mjs <video> [--musica <archivo>] [--volumen 0.12] [--salida <archivo.mp4>]
//        [--claves "palabra1,palabra2"] [--llamada "Registrate"] [--sin-cierre]
// Si existe <video>.captions.json lo usa; si no, edita sin subtítulos.
// Al final normaliza el audio a -14 LUFS (estándar de Instagram/TikTok).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PROYECTO, RAIZ, duracionSeg, ffmpeg, sinExtension } from "./comun.mjs";

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? args[i + 1] : porDefecto;
};
const video = args[0];
if (!video || video.startsWith("--")) {
  console.error("Uso: node scripts/renderizar.mjs <video> [--musica archivo] [--volumen 0.15] [--salida archivo.mp4]");
  process.exit(1);
}
const musica = opcion("musica", null);
const volumen = Number(opcion("volumen", "0.12"));
const claves = (opcion("claves", "") ?? "").split(",").map((c) => c.trim()).filter(Boolean);
const llamada = opcion("llamada", "Registrate");
const conCierre = !args.includes("--sin-cierre");
const salida = path.resolve(opcion("salida", path.join(RAIZ, "exportados", `${sinExtension(video)}.mp4`)));

// Remotion lee los archivos desde public/: copiamos ahí lo que necesita.
const carpeta = path.join(PROYECTO, "public", "entrada");
fs.rmSync(carpeta, { recursive: true, force: true });
fs.mkdirSync(carpeta, { recursive: true });
const copiar = (archivo) => {
  const nombre = path.basename(archivo);
  fs.copyFileSync(archivo, path.join(carpeta, nombre));
  return `entrada/${nombre}`;
};

const rutaCaptions = `${video}.captions.json`;
const props = {
  video: copiar(video),
  duracionSeg: duracionSeg(video),
  captions: fs.existsSync(rutaCaptions) ? JSON.parse(fs.readFileSync(rutaCaptions, "utf8")) : [],
  palabrasClave: claves,
  musica: musica ? copiar(musica) : null,
  volumenMusica: volumen,
  conCierre,
  llamada,
};
const archivoProps = path.join(carpeta, "props.json");
fs.writeFileSync(archivoProps, JSON.stringify(props));

fs.mkdirSync(path.dirname(salida), { recursive: true });
const sinNormalizar = path.join(carpeta, "render.mp4");
execFileSync(
  "npx",
  ["remotion", "render", "src/index.ts", "VideoVertical", sinNormalizar, `--props=${archivoProps}`, "--codec=h264"],
  { cwd: PROYECTO, stdio: "inherit" },
);
normalizar(sinNormalizar, salida);
fs.rmSync(carpeta, { recursive: true, force: true });
console.log(`Listo → ${salida}`);

function normalizar(entrada, destino) {
  ffmpeg(["-i", entrada, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", destino]);
}
