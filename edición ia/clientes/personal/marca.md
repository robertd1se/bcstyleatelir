# Videos personales

Videos personales del usuario (el editor). Estilo **cinematográfico, guiado por la música, sin voz**: b-roll filmado
(ciudad, autos/motos, entrenamiento, viajes) editado como un tráiler o un clip de marca. Se aplica además `estilo.md`
(nada crudo, zona segura de Instagram).

## Referencias
| Ref. | Archivo | Qué se toma |
|---|---|---|
| P1 | `referencias/p1-DfXCVjCzf5y.mp4` (12,7 s) | Teaser tipo tráiler: plano que arranca en **blanco y negro y se pasa a color** con el golpe de la música (semáforos, metro); **texto cinético** "ARE YOU / ARE YOU READY?" palabra por palabra, primero blanco sobre negro y después **invertido** (negro sobre blanco); **destellos de luz cálida** (light leaks amarillo/naranja) en los golpes; cierre con **título de película** ("COMING SOON") en amarillo con bloque de créditos chico. Es una grabación de pantalla de un tutorial de edición: se toma el resultado, no la interfaz. |
| P2 | `referencias/p2-Dcg3rFTKdb3.mp4` (24,4 s) | Moto en ruta de montaña: **teleobjetivo**, **paneos látigo con desenfoque de movimiento** entre planos (6,1 s, 9,5 s, 14,2 s, 16,2 s), **rampas de velocidad** (cámara lenta → normal en la acción), color cálido natural, y un **plano final largo** (7 s) que deja respirar. |
| P3 | `referencias/p3-DXjwsAKjFB2.mp4` (39,5 s, misma que la ref. 1 de Roxet) | Corredor: paneos látigo de 4–6 cuadros, cortes por continuidad (mano → reloj), música que entra en 1 s, cierre con logo sobre negro. |

## Reglas medibles
- **Sin voz ni subtítulos** salvo que el video lo pida. La música manda: **cada corte cae en un golpe** del tema (detectar los golpes con FFmpeg/onsets antes de cortar).
- **Ritmo:** planos de **0,8–2,5 s** en la parte fuerte; el **último plano dura 4–7 s** (respira, como P2).
- **Transiciones:** látigo con desenfoque de movimiento (6 cuadros) cada 2–3 cortes; el resto, cortes secos en el golpe. **Destello de luz cálida** (`#FFB347` → `#FFE08A`, 8–10 cuadros, modo pantalla) en los 2–3 golpes más fuertes.
- **Color:** grado de cine: contraste +10 %, negros levantados apenas, sombras hacia azul verdoso y luces cálidas (look teal & orange), saturación −5 %. Opcional: un plano que **arranca en blanco y negro y pasa a color** en 6 cuadros sobre el golpe.
- **Velocidad:** rampas de velocidad en la acción (40 % → 100 % en 8 cuadros) y cámara lenta al 50 % en el plano más lindo.
- **Texto (cuando hay):** tipografía **condensada en mayúsculas** (Anton o Bebas Neue), blanco, **palabra por palabra al ritmo** ("ARE YOU" / "ARE YOU READY?"), centrado; se puede invertir a negro sobre blanco en el golpe. Título final estilo **póster de película**: grande, **amarillo `#F2C230`**, con un bloque de créditos chico en Inter abajo.
- **Acabado:** grano fino, viñeta suave, barras de cine opcionales (2,39:1 dentro del 9:16) solo en el plano de título.
- **Sonido:** música a -14 LUFS, golpes de impacto en el título y whoosh en cada látigo. Sin ducking (no hay voz).

## Marca
| Elemento | Valor |
|---|---|
| Colores | Negro `#0A0A0A`, blanco `#FFFFFF`, acento amarillo cine `#F2C230`, luz cálida `#FFB347` |
| Tipografías | Anton / Bebas Neue (títulos y texto cinético) + Inter (créditos chicos) |
| Logo | Pendiente: preguntar si usa un logo o firma personal (nombre/usuario) para el cierre |
| Tono | Épico, cinematográfico, "tráiler" |
| Redes | Pendiente: preguntar su usuario |

## Videos hechos
(ninguno todavía)
