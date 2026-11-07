# Editor de video con IA

Esta carpeta es un editor de video. Trabajá **solo dentro de `edición ia/`**.

## Regla principal

**Antes de borrar, sobrescribir o mover cualquier archivo del usuario, pedí confirmación y esperá un "ok".**
Eso incluye todo lo que esté en `clientes/` (grabaciones, referencias, música, exportados y `marca.md`), y también `estilo.md`.
Nunca edites los videos originales: trabajá siempre sobre copias o archivos nuevos.

## Varios clientes

El usuario es editor: hace videos para **Roxet (RXT)**, videos **personales** y para **otros negocios**.
- **Antes de cada video, confirmá para qué cliente es** (si no lo dice y no es obvio, preguntá) y trabajá en su carpeta `clientes/<cliente>/`.
- Aplicá **`estilo.md` (estilo general del usuario) + `clientes/<cliente>/marca.md` (marca del cliente)**. Si chocan, manda la marca del cliente.
- **Cliente nuevo:** copiá `clientes/_plantilla/` a `clientes/<nombre>/`, creá sus carpetas y completá `marca.md` con lo que te pase el usuario (logo, colores, tipografías, tono, referencias). Sus logos van en `proyecto/public/clientes/<nombre>/`.
- Lo que el usuario pida "para siempre" va a `estilo.md` si vale para todos, o al `marca.md` del cliente si es de esa marca. Ante la duda, preguntá.

## Carpetas

| Carpeta / archivo | Para qué sirve |
|---|---|
| `clientes/<cliente>/grabaciones/` | Videos crudos de ese cliente. Solo lectura. |
| `clientes/<cliente>/referencias/` | Videos que le gustan (bajados con yt-dlp). Solo para analizar: no se reutilizan ni se suben a Git. |
| `clientes/<cliente>/exportados/` | Videos terminados de ese cliente. |
| `clientes/<cliente>/musica/` | Música de ese cliente. **Si está vacía, se usa la base generada con `scripts/musica.py`** (o sin música en ediciones de grabaciones). |
| `clientes/<cliente>/marca.md` | Marca del cliente: colores, tipografías, logo, tono, referencias, formatos y videos hechos. |
| `clientes/_plantilla/` | Plantilla para un cliente nuevo. |
| `estilo.md` | El estilo de edición general del usuario. Se aplica en todos los videos. |
| `ideas-pendientes.md` | Ideas que el usuario quiere recordar pero todavía no aprobó. No aplicarlas sin su ok; proponerlas cuando vengan al caso. |
| `proyecto/` | Proyecto de Remotion: arma el video final, subtítulos animados y gráficos. |
| `instalar.sh` | Reinstala dependencias, whisper.cpp y el modelo (`bash instalar.sh`). |

## Herramientas

| Herramienta | Para qué se usa |
|---|---|
| **Node.js** (20+) | Corre Remotion y los scripts de `proyecto/scripts/`. |
| **FFmpeg / ffprobe** | Cortar, unir, comprimir, extraer audio, detectar silencios y medir duraciones. |
| **yt-dlp** | Bajar videos de referencia: `yt-dlp -o "clientes/<cliente>/referencias/%(title)s.%(ext)s" <url>` |
| **whisper.cpp** (modelo `base`) | Transcribir con tiempos por palabra para cortar errores y hacer subtítulos. Está en `proyecto/whisper.cpp/` (no se sube a Git). |
| **Kokoro** (voz `em_alex`) y **Piper** | Voz en off sintética en español para la serie explicativa (Kokoro es la principal; Piper sonaba "cruda" para el usuario). Modelos en `proyecto/voces/` (no se suben a Git). |
| **ElevenLabs** | Voz IA premium elegida por el usuario. Pendiente: la clave guardada no funciona. |
| **pedalboard** | Efectos de audio (cadena de locutor para la voz, mezcla de la música). |
| **Remotion** | Componer el video vertical con subtítulos animados, gráficos y música. Composición `VideoVertical` en `proyecto/src/`. |

### Scripts (correr desde `proyecto/`)

```bash
npm run transcribir -- <video> [idioma=es] [modelo=base]
#   → crea <video>.captions.json (palabras con startMs/endMs)

npm run cortar-silencios -- <entrada> <salida> [umbralDb=-35] [minSilencioSeg=0.5] [margenSeg=0.1]

npm run renderizar -- <video> --cliente <nombre> [--musica <archivo>] [--volumen 0.12] [--salida <archivo.mp4>] \
                       [--claves "problema,8"] [--llamada "Registrate"] [--sin-cierre]
#   → vertical 1080x1920, 30 fps; usa <video>.captions.json si existe
#   → --claves: palabras a resaltar en rojo; agrega el cierre con logo (2 s) salvo --sin-cierre
#   → normaliza el audio a -14 LUFS; guarda en ../clientes/<cliente>/exportados/ (con --cliente) o en --salida

npm run muestra      # vuelve a generar ../clientes/roxet/exportados/muestra-estilo.mp4

python3 scripts/voz.py guiones/<nombre>.txt public/series/<nombre> [--motor kokoro|piper] [--voz em_alex]
#   → voz en off (Kokoro em_alex por defecto) con cadena de locutor + palabras.json con tiempos por palabra
#   → en el guion, {lo que se dice|lo que se muestra}: {Roxet|RXT}, {uno|1.}

python3 scripts/voz_elevenlabs.py guiones/<nombre>.txt public/series/<nombre> --voz <voice_id>
#   → voz de ElevenLabs (mejor calidad). La clave la pone el proxy (secreto de red de api.elevenlabs.io).
#   → HOY NO FUNCIONA: ElevenLabs rechaza la clave guardada ("must start with sk_"). Revisar con el usuario.

python3 scripts/musica.py public/musica-generada/<nombre>.wav --duracion <seg> --bpm 100
#   → base instrumental original (electrónica oscura de gym); hacerla del largo exacto del video

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
| `componentes/Plano.tsx` | Un tramo de una grabación (recorte, sin audio, zoom lento) |
| `ediciones/` | Una composición por video editado (lista de planos, textos y sonido) |
| `personal/` | Videos personales sin voz (cinematográficos, `clientes/personal/marca.md`): `Pulsar.tsx` tiene látigos, ráfagas, glitches, destellos, texto cinético y título póster reutilizables. Fuentes Anton y Unbounded en `public/fuentes/` |
| `series/` | Serie explicativa RXT (9 reels). `ReelSerie.tsx` es la base común (3D, encabezado, texto, voz, música, destellos, acabado, cierre); cada `RxtNN.tsx` solo define cámara, estado del 3D y tarjetas. También `gym3d/`, `ui/`, `linea.ts` y `sonido.ts` |
| `series2d/` | Formato explicativo 2D (reel 2): personaje plano animado (`Persona2D.tsx`), piezas gráficas (`piezas.tsx`) y `Rxt02.tsx` |
| `../guiones/` | Guiones de la voz en off de la serie (`rxt-NN.txt`) |
| `public/marca/` | Logo (original, blanco, negro y las dos mitades) |
| `public/sfx/` | Efectos propios: `whoosh.wav` (látigo) e `impacto.wav` (gancho y logo) |

Los videos de iPhone (.MOV en HEVC) se pasan primero a H.264 en `public/entrada/` (ver el encabezado de `ediciones/Elegido.tsx`).
Para renderizar una edición: `npx remotion render src/index.ts <Composicion> <tmp>.mp4`, y después normalizar a -14 LUFS con
`ffmpeg -i <tmp>.mp4 -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart ../clientes/<cliente>/exportados/<nombre>-editado.mp4`.

Para videos con varios planos, transiciones látigo, zócalos o gancho, armá una composición nueva en `src/` a partir de `MuestraEstilo.tsx` (reemplazando `FondoDemo` por `<OffthreadVideo>`) y registrala en `Root.tsx`.

## Flujo de edición

Para cada video de `clientes/<cliente>/grabaciones/`, trabajando sobre archivos intermedios en una carpeta temporal (no en `grabaciones/`):

1. **Transcribir:** `npm run transcribir -- <video>`.
2. **Cortar silencios y errores:**
   - Silencios: `npm run cortar-silencios -- <video> <tmp>/sin-silencios.mp4`.
   - Errores (tomas repetidas, frases cortadas, muletillas): leer la transcripción, elegir qué tramos sacar según los tiempos por palabra y cortarlos con FFmpeg (`select`/`aselect` o `trim` + `concat`). Ante dudas sobre qué cortar, preguntar.
   - Volver a transcribir el video cortado para que los subtítulos coincidan.
3. **Aplicar `estilo.md`:** ritmo, gancho, transiciones, zócalos, zooms, colores y tipografía (con los componentes de `proyecto/src/`). Elegí las palabras clave para resaltar en rojo.
4. **Subtítulos:** salen solos de `<video>.captions.json` al renderizar.
5. **Música:** si `clientes/<cliente>/musica/` tiene archivos, usar el que corresponda con `--musica` (volumen bajo, unos 0.1–0.2, para que no tape la voz). Si está vacía, sin música.
6. **Exportar:** `npm run renderizar -- <tmp>/final.mp4 --salida ../clientes/<cliente>/exportados/<nombre>.mp4` → **vertical 1080x1920 a 30 fps**, H.264 + AAC. Si hace falta achicarlo: `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k out.mp4`.

Antes de exportar con un nombre que ya existe en `exportados/` del cliente, pedí confirmación.

## Notas del entorno

- Si `proyecto/node_modules` o `proyecto/whisper.cpp` no existen (por ejemplo, en una sesión nueva), correr `bash instalar.sh`.
- En la sesión en la nube están permitidos Hugging Face (modelos de Whisper) e Instagram (`www.instagram.com`, `i.instagram.com` y los servidores de video `scontent-ord5-1/2.cdninstagram.com`). Si un reel viene de otro servidor `scontent-…`, hay que pedir permiso para ese host. YouTube y TikTok no están permitidos.
- Node necesita `NODE_USE_ENV_PROXY=1` para descargar a través del proxy de la nube (ya está puesto en `instalar.sh` y en `npm run instalar-whisper`).
- Remotion usa el Chrome que ya viene instalado en la nube (`remotion.config.ts`), porque su servidor de descarga está bloqueado.
- El 3D se dibuja por software (`swangle`) en la nube: un reel de 36 s tarda varios minutos en renderizar. Probá con `npx remotion still ... --frame=N --scale=0.5` antes del render completo.
