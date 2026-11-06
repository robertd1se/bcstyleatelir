// Arma el video final con Remotion: vertical 1080x1920, 30 fps, subtítulos animados y música opcional.
// Uso: node scripts/renderizar.mjs <video> [--musica <archivo>] [--volumen 0.15] [--salida <archivo.mp4>]
// Si existe <video>.captions.json lo usa; si no, edita sin subtítulos.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PROYECTO, RAIZ, duracionSeg, sinExtension } from "./comun.mjs";

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
const volumen = Number(opcion("volumen", "0.15"));
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
  musica: musica ? copiar(musica) : null,
  volumenMusica: volumen,
};
const archivoProps = path.join(carpeta, "props.json");
fs.writeFileSync(archivoProps, JSON.stringify(props));

fs.mkdirSync(path.dirname(salida), { recursive: true });
execFileSync(
  "npx",
  ["remotion", "render", "src/index.ts", "VideoVertical", salida, `--props=${archivoProps}`, "--codec=h264"],
  { cwd: PROYECTO, stdio: "inherit" },
);
fs.rmSync(carpeta, { recursive: true, force: true });
console.log(`Listo → ${salida}`);
