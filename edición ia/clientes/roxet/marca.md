# Roxet (RXT) – Roxet Training Club

Gimnasio de entrenamiento funcional, fuerza, acondicionamiento e híbrido. Tiene barra (energy bar).
Se pronuncia "Roxet"; en pantalla se escribe "RXT".
Instagram: **@roxet_trainingclub**. El usuario hace sus videos y publicidad pero **no tiene acceso a la cuenta**: cada video se entrega con su paquete de publicación (ver `estilo.md` → Viralidad) para que lo suba quien maneja la cuenta.


## LINEAMIENTOS DE CONTENIDO (pedido de RXT, nov 2026) — MANDAN SOBRE TODO LO ANTERIOR
Mensaje: **RXT es el gym donde te cuidan la técnica, te acompañan y recuperas tu calidad de vida.**
- **Público:** adultos de **30 años en adelante**.
- **No somos CrossFit ni HYROX.** Nada de contenido de "mamados" ni de presumir (sin PRs pesados, sin poses, sin cuerpos como protagonistas).
- **Un tema por semana** (rotan): 1) **Grupales:** el coach corrigiendo técnica · 2) **Calidad de vida:** un caso real de rehabilitación (con permiso por escrito del socio) · 3) **El proceso:** cómo es la valoración · 4) **Comunidad y barra:** después de entrenar.
- **Cada reel:** gancho en los **primeros 3 s que se entienda sin audio** (texto en pantalla + imagen clara) · **40–60 s máximo, con subtítulos** · **salen los coaches y los socios, no el dueño** · cierre: **"Escríbenos VALORACIÓN"** (en el reel de regalo: **"Escríbenos REGALO"**).
- **Material real:** grabaciones de coaches y socios con sus voces reales. Los formatos animados (3D, 2D, voz sintética) quedan solo como apoyo gráfico, no como protagonistas.
- **Entregas:** video editado el **viernes** anterior → RXT lo revisa el **lunes** → se publica el **martes**. Las ideas nuevas se proponen **antes de grabar**; ante dudas, preguntar.
- Plan de los próximos 4 reels: `plan-reels-nov-dic.md`.

## Marca
| Elemento | Valor |
|---|---|
| Blanco | `#FFFFFF`: texto base |
| Negro | `#0A0A0A`: fondos de gráficos y cierre |
| Rojo | `#CC1310`: palabra clave, nombres, segunda línea del título (mismo rojo que mide la ref. 2) |
| Azul | `#1F4FFF`: líneas, barras y subrayado de la llamada a la acción. Nunca en texto largo |
| Títulos | Montserrat 900, MAYÚSCULAS, interletrado -2 % (videos cortos); en la serie RXT, Bodoni Moda + Allura (ver abajo) |
| Subtítulos | Montserrat 700 (palabra clave en 900) |
| Texto chico / CTA | Inter 500/700, MAYÚSCULAS, interletrado 40 % en la CTA |
| Logo | X en dos mitades: `proyecto/public/marca/` (blanco, negro, mitades y original) |
| Tono | Con humor pero profesional: frases cortas, un remate por video, sin groserías |

- **Logos** en `proyecto/public/marca/`: X sola (`logo-x-*.png`, en mitades para animar) y palabra completa RXT (`logo-rxt-*.png`, en piezas R, X y T). El usuario ama la animación del logo RXT armándose.

## Qué se tomó de cada referencia
| Ref. | Archivo | Qué se tomó |
|---|---|---|
| 1 | `clientes/roxet/referencias/ref1-DXjwsAKjFB2.mp4` | Paneos látigo de 4–6 cuadros, cortes por continuidad, música que entra en 1 s y cierre con el logo sobre negro |
| 2 | `clientes/roxet/referencias/ref2-DZYEkfpMK_d.mp4` | Subtítulos chicos a la altura del pecho, palabra por palabra, con la palabra clave en rojo; títulos con número grande |
| 3 | `clientes/roxet/referencias/ref3-DV90aO2DBnL.mp4` | Ritmo de un corte cada 1,5–2,5 s, gancho con 3 cortes en 2 s, zócalos nombre/rol/frase con humor |
| 5 | `clientes/roxet/referencias/ref5-DfXdCL7sOB2.mp4` | Formato explicativo: voz en off, gimnasio 3D isométrico, texto arriba con recuadros de color, barra de progreso con ✓, tarjetas tipo app, loop |
| 7 | `clientes/roxet/referencias/ref7-DfXXXGWOCs7.mp4` | Explainer 2D: ilustración plana con contorno, mini-escenas cada 1,5–3 s, infografías (gráficos, listas, sellos), raya de luz como transición, subtítulos abajo |
| 6 | `clientes/roxet/referencias/ref6-DfU22HORUf1.mp4` | Encabezado con línea de avance, destellos entre secciones, listas en tarjetas apiladas con ícono, cierre con logo y "Guárdalo y síguenos" |

Mediciones: cortes detectados con FFmpeg (`select=gt(scene,0.25)`), colores y tamaños medidos sobre cuadros, sonoridad con `ebur128`, y las referencias transcritas con Whisper.

## Formato serie explicativa (serie RXT de 9 reels)
Para videos que explican algo con voz en off (pedido para la serie RXT; inspirado en la ref. 5, sin copiarla).
- **Voz en off:** la elegida es ElevenLabs (pendiente de que funcione la clave). Mientras tanto, Kokoro `em_alex` a velocidad 1,05, oración por oración (pausa de 0,32 s después de "." y "?"), con cadena de locutor: pasa-altos a 85 Hz, +2,5 dB de calidez a 180 Hz, −2 dB a 350 Hz, +3 dB de presencia a 3,2 kHz, −3,5 dB en las "s" a 7 kHz, compresión 3:1 y un toque de sala. **Piper no se usa:** al usuario le sonó cruda. La marca se pronuncia "Roxet" y en pantalla dice "RXT".
- **Imagen:** gimnasio RXT en 3D isométrico, de noche, con una zona por servicio. La cámara se mueve sin cortes de una zona a otra justo cuando la voz la nombra (18 cuadros de movimiento suave) y vuelve al encuadre inicial al final, para que el reel quede en loop.
- **Texto arriba**, centrado al **24,5 % de la altura** (zona segura), palabra por palabra, en trozos de hasta 6 palabras (se corta en comas y al final de cada oración). **Dos tipografías combinadas en la misma frase** (pedido del usuario):
  - **Serif editorial Bodoni Moda 500**, blanca, a **70 px**, interletrado −1 %, para el texto.
  - **Manuscrita Allura**, **1,55× más grande (≈108 px)**, en **dorado `#E2B65A`** o **rojo `#E0352B`**, para 1 o 2 palabras clave por frase (y los números de lista). Se "escribe" de izquierda a derecha en 9 cuadros.
  - Sombra sutil `0 4px 18px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.6)`. Sin recuadros ni contornos. Nada de tipografías genéricas ni efectos exagerados.
  - El gancho siempre lleva una palabra en manuscrita (ej. "¿Qué *hacemos* en RXT?"). El rojo se reserva para la palabra más fuerte del video.
  - Los títulos de las tarjetas también van en Bodoni Moda 600 (sin mayúsculas forzadas); las etiquetas chicas siguen en Inter en mayúsculas espaciadas.
- **Barra de progreso** debajo del texto (32,5 % de la altura): actual en rojo, terminados en azul con ✓. En el 3D, la zona activa se pone roja y tiene un marcador numerado.
- **Tarjetas tipo app** abajo (fondo oscuro translúcido, radio de 34 px) para listas: chips que se encienden en azul cuando se dicen y filas con ícono.
- **Logo RXT armándose** cuando la voz dice "En RXT…" al principio: el fondo se oscurece al 70 %, la R entra por la izquierda, la T por la derecha y las mitades de la X se juntan (12 cuadros), con brillo rojo al encajar, línea roja y "TRAINING CLUB" debajo; sale con un golpe de escala. Whoosh al entrar e impacto al encajar. (`series/ui/LogoRxt.tsx`, logo en `public/marca/logo-rxt-*.png`). Pedido y aprobado por el usuario: "me encanta así".
- **Encabezado** (de la ref. 6): logo X y "RXT" a la izquierda, "PARTE n/9" a la derecha y debajo una **línea de 4 px que se llena en rojo** a medida que avanza el video.
- **Secciones separadas por un destello** de luz cálida en diagonal (12 cuadros, de la ref. 6) más un whoosh.
- **Listas en tarjetas apiladas** (de la ref. 6): una pastilla de sección con borde rojo arriba y cada tarjeta con ícono cuadrado de color, TÍTULO en Montserrat 900 a 40 px y un detalle en Inter a 26 px. Entran de a una, subiendo 60 px, cuando la voz las nombra.
- **Cierre de serie** (de la ref. 6): el 3D se oscurece al 78 %, pastilla "GUÁRDALO Y SÍGUENOS", logo X que se arma, "RXT / TRAINING CLUB" y barra de 9 segmentos con las partes publicadas en rojo. Sin texto de subtítulos encima.
- **Sonido:** voz; whoosh suave (volumen 0,35) en cada movimiento de cámara; impacto en el cuadro 0.
- **Música:** si `musica/` está vacía, se genera una base original con `scripts/musica.py` (100 BPM, electrónica oscura en La menor), del largo exacto del reel. Lleva **ducking**: volumen **0,32** en las pausas (el usuario la pidió un poco más fuerte), que baja al **42 %** mientras habla la voz (entra y sale en 250 ms), con entrada de 1 s y salida de 1,5 s.

## Formato explicativo 2D (reel 2 de la serie RXT, inspirado en la ref. 7)
Alternativa al gimnasio 3D, elegida por el usuario para el reel 2 ("hazlo diferente"). Se ve como un explainer animado premium.
- **Fondo** azul noche (`#070a12` → `#17223f` al centro) con resplandor rojo abajo a la izquierda y azul arriba a la derecha; viñeta y grano.
- **Ilustración plana** con **contorno oscuro de 6 px** (`#0b0d14`) y sombra dura de 6–10 px: personajes de cuerpo entero (`series2d/Persona2D.tsx`, poses: parado, festejo, sentadilla, levantar, pulgar, pensando, salto, caminar, señalar), paneles tipo app, pastillas de etiqueta en Inter mayúsculas, gráficos de línea que se dibujan, barras que crecen, diana con flecha, lista que se tilda y **sellos rojos estampados** (`series2d/piezas.tsx`).
- **Ritmo:** una mini-escena por idea, cada **1,5–3 s**, sincronizada con la palabra que la nombra. Cada escena entra subiendo 40 px con resorte y sale con un fundido de 5 cuadros.
- **Transición:** raya de luz azul-blanca en diagonal (10 cuadros) + whoosh suave en cada cambio.
- **Escenario** entre el 20 % y el 65 % de la altura; personajes con los pies al 61 %.
- **Subtítulos abajo**, centrados al **70,5 % de la altura** (zona segura), a 60 px, con la misma combinación Bodoni Moda + Allura.
- Logo RXT armándose cuando la voz dice "en RXT"; cierre de serie igual que en el formato 3D.

## Serie RXT (9 reels)
Guion completo: preguntas 1 a 9 que mandó el usuario (qué hacemos, por qué elegir RXT, servicios, barra, thruster, deporte formal, lesiones, clases grupales, personalizadas).
- Reel 1 ("¿Qué hacemos en RXT?"): formato 3D. `clientes/roxet/exportados/rxt-01-que-hacemos-en-rxt.mp4`
- Reel 2 ("¿Por qué elegir RXT?"): formato 2D (el usuario pidió "hazlo diferente"). `clientes/roxet/exportados/rxt-02-por-que-elegir-rxt.mp4`
- Reels 3 a 9: pendientes; preguntar qué formato (3D, 2D o alternar).
- **"5 razones por las que la gente elige RXT"** (43 s): une los reels 1 y 2 con una estructura nueva por capítulos (gancho con promesa contable, "Razón *n*" con onda roja, tarjetas de vidrio con 3D y 2D, CTA de guardar antes de la última, logo RXT + tarjeta de seguir, loop). Voz Chatterbox revisada. Paquete en `clientes/roxet/exportados/rxt-5-razones/` (video, portada, publicación). Composición `Rxt5Razones` en `proyecto/src/razones/`.
- **Reel 1 · Grupales (mar 17 nov):** "¿Alguna vez te lastimaste entrenando?" (36 s, 5 ejercicios: sentadilla, swing, peso muerto, thruster, burpees + seguimiento). Comparación animada en pantalla partida estilo ref. 9: "ENTRENANDO SOLO" (la espalda se redondea → lesión) vs "CON COACH RXT" (correcciones en pantalla → sigue entrenando, se suman otros). Cierre "Escríbenos VALORACIÓN". Paquete en `exportados/reel-1-lesion/`. Composición `RxtLesion` (`proyecto/src/clientes/roxet/`). Pendiente: sumar toma real de coach corrigiendo (lineamiento de RXT).
