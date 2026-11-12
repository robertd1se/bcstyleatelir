// Arma un reel de Supernova a partir de un guion JSON (formato "dos caminos").
// Uso (desde proyecto/):
//   node scripts/supernova.mjs ../clientes/supernova/guiones/<id>.json            → video + paquete de publicación
//   node scripts/supernova.mjs ../clientes/supernova/guiones/<id>.json --cuadros  → solo cuadros clave para revisar
// Salida: ../clientes/supernova/exportados/<id>/ (video.mp4, portada.jpg, publicacion.txt)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PROYECTO, RAIZ, ffmpeg } from "./comun.mjs";

const [archivo, ...opciones] = process.argv.slice(2);
if (!archivo) {
  console.error("Uso: node scripts/supernova.mjs <guion.json> [--cuadros]");
  process.exit(1);
}
const guion = JSON.parse(fs.readFileSync(archivo, "utf8"));
const id = guion.id;
const DURACION_SEG = 19; // DURACION_DOS_CAMINOS (568 cuadros) redondeado hacia arriba
const CUADROS_CLAVE = [20, 120, 200, 240, 285, 330, 400, 470, 540];

// Validaciones básicas para que un guion mal escrito no llegue al render
const faltan = ["gancho", "negocio", "mensajes", "espera", "perdida", "respuesta", "app", "resuelto", "comparacion", "cierre"].filter((k) => !guion[k]);
if (faltan.length) throw new Error(`Al guion le falta: ${faltan.join(", ")}`);
if (guion.mensajes.length < 3 || guion.mensajes.length > 4) throw new Error("mensajes: tienen que ser 3 o 4");
if (guion.app.items.length !== 3) throw new Error("app.items: tienen que ser 3");
const palabrasGancho = guion.gancho.join(" ").split(/\s+/).length;
if (palabrasGancho > 7) throw new Error(`El gancho tiene ${palabrasGancho} palabras (máx. 7)`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `sn-${id}-`));
const props = { ...guion };

// Música original (si no hay una en clientes/supernova/musica/ indicada en el guion)
if (!props.musica) {
  const semilla = [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 97;
  const destino = path.join("public", "musica-generada", `sn-${id}.wav`);
  fs.mkdirSync(path.dirname(path.join(PROYECTO, destino)), { recursive: true });
  execFileSync("python3", ["scripts/musica.py", destino, "--duracion", String(DURACION_SEG), "--bpm", "120", "--semilla", String(semilla)], { cwd: PROYECTO, stdio: "inherit" });
  props.musica = `musica-generada/sn-${id}.wav`;
}
const archivoProps = path.join(tmp, "props.json");
fs.writeFileSync(archivoProps, JSON.stringify(props));

if (opciones.includes("--cuadros")) {
  for (const f of CUADROS_CLAVE) {
    execFileSync("npx", ["remotion", "still", "src/index.ts", "DosCaminos", path.join(tmp, `c${String(f).padStart(3, "0")}.png`), `--frame=${f}`, "--scale=0.4", `--props=${archivoProps}`, "--log=error"], { cwd: PROYECTO, stdio: "inherit" });
  }
  const hoja = path.join(tmp, "cuadros.jpg");
  const entradas = CUADROS_CLAVE.flatMap((f) => ["-i", path.join(tmp, `c${String(f).padStart(3, "0")}.png`)]);
  ffmpeg([...entradas, "-filter_complex", `hstack=${CUADROS_CLAVE.length}`, hoja]);
  console.log(`Cuadros clave → ${hoja}`);
  process.exit(0);
}

const salida = path.join(RAIZ, "clientes", "supernova", "exportados", id);
fs.mkdirSync(salida, { recursive: true });
const crudo = path.join(tmp, "crudo.mp4");
execFileSync("npx", ["remotion", "render", "src/index.ts", "DosCaminos", crudo, "--codec=h264", `--props=${archivoProps}`, "--log=error"], { cwd: PROYECTO, stdio: "inherit" });
ffmpeg(["-i", crudo, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", path.join(salida, "video.mp4")]);
// Portada: el gancho ya entero (cuadro 20), dentro del recorte 4:5
ffmpeg(["-ss", "0.7", "-i", path.join(salida, "video.mp4"), "-frames:v", "1", "-q:v", "2", path.join(salida, "portada.jpg")]);

const p = guion.publicacion ?? {};
const texto = [
  "DESCRIPCIÓN",
  p.descripcion ?? "",
  "",
  "HASHTAGS",
  (p.hashtags ?? []).join(" "),
  "",
  "GANCHOS ALTERNATIVOS (cambiar las etiquetas del inicio para probar)",
  ...(p.ganchosAlternativos ?? []).map((g, i) => `${i + 1}. "${g}"`),
  "",
  "MEJOR HORARIO",
  p.horario ?? "Martes a jueves, 7–9 pm",
  "",
  "AUDIO",
  "Base original a 120 BPM. Se puede reemplazar por un audio en tendencia al publicar.",
  "",
  "AL PUBLICAR",
  "Contestá cada comentario con \"¡Te mandé mensaje! 💜\" y seguí el guion de DM del Cerebro Supernova.",
  "",
].join("\n");
fs.writeFileSync(path.join(salida, "publicacion.txt"), texto);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Listo → ${salida}`);
