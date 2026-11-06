// Utilidades compartidas por los scripts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROYECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const RAIZ = path.resolve(PROYECTO, "..");
export const WHISPER = path.join(PROYECTO, "whisper.cpp");

export const ffmpeg = (args) =>
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

export const duracionSeg = (archivo) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo])
      .toString()
      .trim(),
  );

export const sinExtension = (archivo) => path.basename(archivo, path.extname(archivo));
