// Renderiza la muestra de estilo de 10 s en ../clientes/roxet/exportados/muestra-estilo.mp4 (audio a -14 LUFS).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { PROYECTO, RAIZ, ffmpeg } from "./comun.mjs";

const tmp = path.join(os.tmpdir(), `muestra-${Date.now()}.mp4`);
const salida = path.join(RAIZ, "clientes", "roxet", "exportados", "muestra-estilo.mp4");
execFileSync("npx", ["remotion", "render", "src/index.ts", "MuestraEstilo", tmp, "--codec=h264"], { cwd: PROYECTO, stdio: "inherit" });
ffmpeg(["-i", tmp, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", salida]);
fs.rmSync(tmp);
console.log(`Listo → ${salida}`);
