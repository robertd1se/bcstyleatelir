# Videos personales

Videos personales del usuario (el editor). Estilo **cinematográfico, guiado por la música, sin voz**: b-roll filmado
(ciudad, motos, productos, entrenamiento, viajes) editado como un **tráiler**, un **teaser** o un **video de producto**.
Tres sabores que combina: tráiler con texto cinético (P1, P6), acción con látigos y rampas (P2, P3, P5) y producto con detalles y ráfagas (P4). Se aplica además `estilo.md`
(nada crudo, zona segura de Instagram).

## Referencias
| Ref. | Archivo | Qué se toma |
|---|---|---|
| P1 | `referencias/p1-DfXCVjCzf5y.mp4` (12,7 s) | Teaser tipo tráiler: plano que arranca en **blanco y negro y se pasa a color** con el golpe de la música (semáforos, metro); **texto cinético** "ARE YOU / ARE YOU READY?" palabra por palabra, primero blanco sobre negro y después **invertido** (negro sobre blanco); **destellos de luz cálida** (light leaks amarillo/naranja) en los golpes; cierre con **título de película** ("COMING SOON") en amarillo con bloque de créditos chico. Es una grabación de pantalla de un tutorial de edición: se toma el resultado, no la interfaz. |
| P2 | `referencias/p2-Dcg3rFTKdb3.mp4` (24,4 s) | Moto en ruta de montaña: **teleobjetivo**, **paneos látigo con desenfoque de movimiento** entre planos (6,1 s, 9,5 s, 14,2 s, 16,2 s), **rampas de velocidad** (cámara lenta → normal en la acción), color cálido natural, y un **plano final largo** (7 s) que deja respirar. |
| P3 | `referencias/p3-DXjwsAKjFB2.mp4` (39,5 s, misma que la ref. 1 de Roxet) | Corredor: paneos látigo de 4–6 cuadros, cortes por continuidad (mano → reloj), música que entra en 1 s, cierre con logo sobre negro. |
| P4 | `referencias/p4-DfVtl4TTm8s.mp4` (19 s) | Video de **producto** (moto Kawasaki, marca "Enjuágala"): **primeros planos de detalles** (tanque, escape, tablero, logos) con luz **neón celeste y verde lima**; planos de 0,5–1 s; **ráfagas de cortes de 1–2 cuadros** que tartamudean en los golpes fuertes (3,2–4,2 s, 7,4–8,5 s, 11,6–12,7 s, 15,8–16,4 s); cierre con **logo tipo sticker** sobre negro con viñeta (2,5 s). |
| P5 | `referencias/p5-DfZZQdcunul.mp4` (11,7 s, horizontal) | **Glitch en los golpes**: **negativo / cámara térmica**, **bloques de píxeles** (datamosh), **sobreexposición blanca de 1 cuadro**; cortes cada 0,5–1,3 s; planos con casco en primer plano y motos en ruta. Se toman los efectos, no el formato horizontal. |
| P6 | `referencias/p6-De1TRoYz5xx.mp4` (17 s) | Igual que P1 (mismo creador): **texto cinético chico en mayúsculas anchas** ("SOMETHING BIG IS COMING.", "PREPARE YOURSELF", "CHANGE IS ON THE HORIZON", "A NEW STORY IS RISING") que **alterna blanco sobre negro y negro sobre blanco**, **cortina diagonal** entre textos; tomas aéreas de ciudad y nubes en color cálido apagado; cierre **"COMING SOON / STAY TUNED"** estilo póster con **quemado de luz naranja-rojo** (14,1–15,5 s). |

## Reglas medibles
- **Sin voz ni subtítulos** salvo que el video lo pida. La música manda: **cada corte cae en un golpe** del tema (detectar los golpes con FFmpeg/onsets antes de cortar).
- **Ritmo:** planos de **0,8–2,5 s** en la parte fuerte; el **último plano dura 4–7 s** (respira, como P2).
- **Transiciones:** látigo con desenfoque de movimiento (6 cuadros) cada 2–3 cortes; el resto, cortes secos en el golpe. **Destello de luz cálida** (`#FFB347` → `#FFE08A`, 8–10 cuadros, modo pantalla) en los 2–3 golpes más fuertes.
- **Color:** grado de cine: contraste +10 %, negros levantados apenas, sombras hacia azul verdoso y luces cálidas (look teal & orange), saturación −5 %. Opcional: un plano que **arranca en blanco y negro y pasa a color** en 6 cuadros sobre el golpe.
- **Velocidad:** rampas de velocidad en la acción (40 % → 100 % en 8 cuadros) y cámara lenta al 50 % en el plano más lindo.
- **Ráfagas (P4):** en los 3–4 golpes más fuertes, una ráfaga de 6–10 cortes de **1–2 cuadros** entre detalles o con zoom de golpe (+8 %) y temblor.
- **Glitch (P5):** como acento, nunca todo el video: 1 cuadro de sobreexposición blanca, 3–4 cuadros en negativo o "térmico", bloques de píxeles desplazados (4–6 cuadros). Máximo 3–4 glitches por video.
- **Producto (P4):** primeros planos de detalles con movimiento lento de cámara, luz de neón del color del producto, el producto completo solo 2–3 veces.
- **Texto (cuando hay):** dos variantes del mismo creador (P1 y P6):
  - **Ancha y chica:** mayúsculas **extendidas** (Archivo Expanded / Unbounded) a ~40–48 px, blanco sobre negro, frases cortas que entran de a una ("SOMETHING BIG IS COMING.").
  - **Condensada y grande:** Anton / Bebas Neue para golpes ("ARE YOU READY?").
  - En los golpes, **se invierte** (negro sobre blanco) y entre frases hay una **cortina diagonal** de 6 cuadros. Título final estilo **póster de película**: grande, **amarillo `#F2C230`**, con un bloque de créditos chico en Inter abajo.
- **Acabado:** grano fino, viñeta suave, barras de cine opcionales (2,39:1 dentro del 9:16) solo en el plano de título.
- **Sonido:** música a -14 LUFS, golpes de impacto en el título y whoosh en cada látigo. Sin ducking (no hay voz).

## Marca
| Elemento | Valor |
|---|---|
| Colores | Negro `#0A0A0A`, blanco `#FFFFFF`, acento amarillo cine `#F2C230`, luz cálida `#FFB347`; en videos de producto, el neón del producto (ej. celeste `#22D3EE` + lima `#B6F23A`) |
| Tipografías | Archivo Expanded o Unbounded (texto cinético chico y ancho), Anton / Bebas Neue (golpes y títulos), Inter (créditos chicos) |
| Logo | Sin firma: el cierre es solo el título tipo póster (elegido por el usuario) |
| Tono | Épico, cinematográfico, "tráiler" |
| Redes | Pendiente: preguntar su usuario |

## Videos hechos
| Video | Archivo | Notas |
|---|---|---|
| Pulsar NS (producto, 18,5 s) | `exportados/pulsar/` | 6 clips DJI de la moto. Gancho en blanco y negro "NO ES SOLO / UNA MOTO." que pasa a color con el bombo; ráfagas de detalles, látigos, 3 destellos cálidos, 3 glitches, plano final en cámara lenta con título "PULSAR" amarillo y créditos "GRIS · MORADO · LIMA". Música original a 120 BPM. Composición `proyecto/src/personal/Pulsar.tsx`. |
