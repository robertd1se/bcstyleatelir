// Instala whisper.cpp y descarga el modelo dentro de proyecto/whisper.cpp
// Uso: node scripts/instalar-whisper.mjs [modelo]   (por defecto: base)
import path from "node:path";
import { installWhisperCpp, downloadWhisperModel } from "@remotion/install-whisper-cpp";

const modelo = process.argv[2] ?? "base";
const to = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model: modelo, folder: to });
console.log(`whisper.cpp + modelo "${modelo}" listos en ${to}`);
