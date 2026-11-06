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
| `referencias/` | Videos que le gustan al usuario (bajados con yt-dlp). Solo para analizar: no se reutilizan ni se suben a Git. |
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

npm run renderizar -- <video> [--musica <archivo>] [--volumen 0.12] [--salida <archivo.mp4>] \
                       [--claves "problema,8"] [--llamada "Registrate"] [--sin-cierre]
#   → vertical 1080x1920, 30 fps; usa <video>.captions.json si existe
#   → --claves: palabras a resaltar en rojo; agrega el cierre con logo (2 s) salvo --sin-cierre
#   → normaliza el audio a -14 LUFS; por defecto guarda en ../exportados/<nombre>.mp4

npm run muestra      # vuelve a generar ../exportados/muestra-estilo.mp4

npm run dev          # Remotion Studio, para ver y ajustar en vivo
npm run lint         # chequeo de tipos y estilo
```

### Código del estilo (`proyecto/src/`)

| Archivo | Qué es |
|---|---|
| `estilo.ts` | Colores, fuentes, tamaños y tiempos de la marca: la versión en código de `estilo.md` |
| `componentes/Subtitulos.tsx` | Subtítulos palabra por palabra con palabra clave en rojo |
| `componentes/Latigo.tsx` | Transición de paneo látigo (`latigo()` + `tiempoLatigo`, para `TransitionSeries`) |
| `componentes/Gancho.tsx` | Título de los primeros 3 s |
| `componentes/Zocalo.tsx` | Zócalo nombre / rol / frase |
| `componentes/CierreLogo.tsx` | Cierre de 2 s con el logo X y la llamada a la acción |
| `VideoVertical.tsx` | Composición para videos reales (la usa `renderizar`) |
| `MuestraEstilo.tsx` | Muestra de 10 s del estilo, con planos de ejemplo |
| `public/marca/` | Logo (original, blanco, negro y las dos mitades) |
| `public/sfx/` | Efectos propios: `whoosh.wav` (látigo) e `impacto.wav` (gancho y logo) |

Para videos con varios planos, transiciones látigo, zócalos o gancho, armá una composición nueva en `src/` a partir de `MuestraEstilo.tsx` (reemplazando `FondoDemo` por `<OffthreadVideo>`) y registrala en `Root.tsx`.

## Flujo de edición

Para cada video de `grabaciones/`, trabajando sobre archivos intermedios en una carpeta temporal (no en `grabaciones/`):

1. **Transcribir:** `npm run transcribir -- <video>`.
2. **Cortar silencios y errores:**
   - Silencios: `npm run cortar-silencios -- <video> <tmp>/sin-silencios.mp4`.
   - Errores (tomas repetidas, frases cortadas, muletillas): leer la transcripción, elegir qué tramos sacar según los tiempos por palabra y cortarlos con FFmpeg (`select`/`aselect` o `trim` + `concat`). Ante dudas sobre qué cortar, preguntar.
   - Volver a transcribir el video cortado para que los subtítulos coincidan.
3. **Aplicar `estilo.md`:** ritmo, gancho, transiciones, zócalos, zooms, colores y tipografía (con los componentes de `proyecto/src/`). Elegí las palabras clave para resaltar en rojo.
4. **Subtítulos:** salen solos de `<video>.captions.json` al renderizar.
5. **Música:** si `musica/` tiene archivos, usar el que corresponda con `--musica` (volumen bajo, unos 0.1–0.2, para que no tape la voz). Si está vacía, sin música.
6. **Exportar:** `npm run renderizar -- <tmp>/final.mp4 --salida ../exportados/<nombre>.mp4` → **vertical 1080x1920 a 30 fps**, H.264 + AAC. Si hace falta achicarlo: `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k out.mp4`.

Antes de exportar con un nombre que ya existe en `exportados/`, pedí confirmación.

## Notas del entorno

- Si `proyecto/node_modules` o `proyecto/whisper.cpp` no existen (por ejemplo, en una sesión nueva), correr `bash instalar.sh`.
- En la sesión en la nube están permitidos Hugging Face (modelos de Whisper) e Instagram (`www.instagram.com`, `i.instagram.com` y los servidores de video `scontent-ord5-1/2.cdninstagram.com`). Si un reel viene de otro servidor `scontent-…`, hay que pedir permiso para ese host. YouTube y TikTok no están permitidos.
- Node necesita `NODE_USE_ENV_PROXY=1` para descargar a través del proxy de la nube (ya está puesto en `instalar.sh` y en `npm run instalar-whisper`).
- Remotion usa el Chrome que ya viene instalado en la nube (`remotion.config.ts`), porque su servidor de descarga está bloqueado.
