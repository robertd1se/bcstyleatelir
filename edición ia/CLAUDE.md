# Editor de video con IA

Esta carpeta es un editor de video. Trabajá **solo dentro de `edición ia/`**.

## Regla principal

**Antes de borrar, sobrescribir o mover cualquier archivo del usuario, pedí confirmación y esperá un "ok".**
Eso incluye todo lo que esté en `grabaciones/`, `referencias/`, `musica/` y `exportados/`, y también `estilo.md`.
Nunca edites los videos originales: trabajá siempre sobre copias o archivos nuevos.

## Carpetas

| Carpeta / archivo | Para qué sirve |
|---|---|
| `grabaciones/` | El usuario deja acá los videos crudos. Solo lectura. |
| `referencias/` | Videos que le gustan al usuario (bajados con yt-dlp). Sirven para definir `estilo.md`. |
| `exportados/` | Los videos terminados. |
| `musica/` | Música que agrega el usuario. **Si está vacía, se edita sin música.** |
| `estilo.md` | El estilo de edición del usuario. Se aplica en cada video. |
| `proyecto/` | Proyecto de Remotion: arma el video final, subtítulos animados y gráficos. |
| `instalar.sh` | Reinstala dependencias, whisper.cpp y el modelo (`bash instalar.sh`). |

## Herramientas

| Herramienta | Para qué se usa |
|---|---|
| **Node.js** (20+) | Corre Remotion y los scripts de `proyecto/scripts/`. |
| **FFmpeg / ffprobe** | Cortar, unir, comprimir, extraer audio, detectar silencios y medir duraciones. |
| **yt-dlp** | Bajar videos de referencia a `referencias/`: `yt-dlp -o "referencias/%(title)s.%(ext)s" <url>` |
| **whisper.cpp** (modelo `base`) | Transcribir con tiempos por palabra para cortar errores y hacer subtítulos. Está en `proyecto/whisper.cpp/` (no se sube a Git). |
| **Remotion** | Componer el video vertical con subtítulos animados, gráficos y música. Composición `VideoVertical` en `proyecto/src/`. |

### Scripts (correr desde `proyecto/`)

```bash
npm run transcribir -- <video> [idioma=es] [modelo=base]
#   → crea <video>.captions.json (palabras con startMs/endMs)

npm run cortar-silencios -- <entrada> <salida> [umbralDb=-35] [minSilencioSeg=0.5] [margenSeg=0.1]

npm run renderizar -- <video> [--musica <archivo>] [--volumen 0.15] [--salida <archivo.mp4>]
#   → vertical 1080x1920, 30 fps; usa <video>.captions.json si existe
#   → por defecto guarda en ../exportados/<nombre>.mp4

npm run dev          # Remotion Studio, para ver y ajustar en vivo
npm run lint         # chequeo de tipos y estilo
```

El estilo de los subtítulos (fuente, colores, tamaño y posición) está en la constante `ESTILO` de `proyecto/src/Subtitulos.tsx`.

## Flujo de edición

Para cada video de `grabaciones/`, trabajando sobre archivos intermedios en una carpeta temporal (no en `grabaciones/`):

1. **Transcribir:** `npm run transcribir -- <video>`.
2. **Cortar silencios y errores:**
   - Silencios: `npm run cortar-silencios -- <video> <tmp>/sin-silencios.mp4`.
   - Errores (tomas repetidas, frases cortadas, muletillas): leer la transcripción, elegir qué tramos sacar según los tiempos por palabra y cortarlos con FFmpeg (`select`/`aselect` o `trim` + `concat`). Ante dudas sobre qué cortar, preguntar.
   - Volver a transcribir el video cortado para que los subtítulos coincidan.
3. **Aplicar `estilo.md`:** ritmo, zooms, gráficos, colores y tipografía de subtítulos (ajustando `ESTILO` y los componentes de `proyecto/src/`).
4. **Subtítulos:** salen solos de `<video>.captions.json` al renderizar.
5. **Música:** si `musica/` tiene archivos, usar el que corresponda con `--musica` (volumen bajo, unos 0.1–0.2, para que no tape la voz). Si está vacía, sin música.
6. **Exportar:** `npm run renderizar -- <tmp>/final.mp4 --salida ../exportados/<nombre>.mp4` → **vertical 1080x1920 a 30 fps**, H.264 + AAC. Si hace falta achicarlo: `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k out.mp4`.

Antes de exportar con un nombre que ya existe en `exportados/`, pedí confirmación.

## Notas del entorno

- Si `proyecto/node_modules` o `proyecto/whisper.cpp` no existen (por ejemplo, en una sesión nueva), correr `bash instalar.sh`.
- En la sesión en la nube, Hugging Face está permitido (para bajar modelos de Whisper), pero **YouTube, Instagram y TikTok no**: yt-dlp no puede bajar referencias ahí. El usuario puede subir los videos a `referencias/` a mano o bajarlos en su propia computadora.
- Node necesita `NODE_USE_ENV_PROXY=1` para descargar a través del proxy de la nube (ya está puesto en `instalar.sh` y en `npm run instalar-whisper`).
- Remotion usa el Chrome que ya viene instalado en la nube (`remotion.config.ts`), porque su servidor de descarga está bloqueado.
