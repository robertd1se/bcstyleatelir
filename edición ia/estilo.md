# Mi estilo de edición

Reglas concretas para cada video. Los valores numéricos viven en `proyecto/src/estilo.ts`: si cambiás uno, cambiá el otro.
Las referencias inspiran; **no se copian** (ni planos, ni textos, ni música).

## Regla de oro: nada crudo
El usuario quiere todo con terminación prolija. Antes de exportar, cada video tiene que cumplir:
- **Movimiento constante:** ningún plano ni fondo queda quieto (zoom lento, deriva de cámara o animación).
- **Transiciones con intención:** látigo, destello o movimiento de cámara; nunca un salto sin pulir entre secciones.
- **Acabado:** viñeta suave y grano fino (`series/ui/Acabado.tsx`) en piezas animadas y gráficas.
- **Profundidad y luz:** en 3D, charcos de luz, neón **con halo** y contexto alrededor (calle, faroles); nada de fondos planos vacíos.
- **3D con detalle:** sombras reales, piso con textura, personas con brazos, zapatillas y pelo; desenfoque "miniatura" arriba y abajo (7 px) y corrección de color (contraste 1,08, saturación 1,15).
- **Tarjetas de vidrio:** fondo degradado translúcido con desenfoque del fondo (14 px), nunca un rectángulo plano.
- **Sonido diseñado:** whoosh en cada transición o movimiento de cámara e impacto en el gancho y en el cierre.
- **Revisión:** mirar al menos 5 cuadros clave antes del render final y corregir lo que se vea a medio hacer.

## Formato
- Vertical **1080x1920, 30 fps**, H.264 + AAC 48 kHz.
- Audio final normalizado a **-14 LUFS**, pico máximo -1 dBTP (las 3 referencias miden -14 LUFS).
- Siempre en vertical real. No usar videos horizontales girados dentro del cuadro (la ref. 1 lo hace; no lo adoptamos).

## Marca (manda sobre las referencias)
| Elemento | Valor |
|---|---|
| Blanco | `#FFFFFF`: texto base |
| Negro | `#0A0A0A`: fondos de gráficos y cierre |
| Rojo | `#CC1310`: palabra clave, nombres, segunda línea del título (mismo rojo que mide la ref. 2) |
| Azul | `#1F4FFF`: líneas, barras y subrayado de la llamada a la acción. Nunca en texto largo |
| Títulos | Montserrat 900, MAYÚSCULAS, interletrado -2 % |
| Subtítulos | Montserrat 700 (palabra clave en 900) |
| Texto chico / CTA | Inter 500/700, MAYÚSCULAS, interletrado 40 % en la CTA |
| Logo | X en dos mitades: `proyecto/public/marca/` (blanco, negro, mitades y original) |
| Tono | Con humor pero profesional: frases cortas, un remate por video, sin groserías |

## Ritmo y cortes (de la ref. 3)
- **Un corte cada 1,5 a 2,5 s** (la ref. 3 tiene una mediana de 1,6 s). Ningún plano dura más de **3 s**.
- Cuando habla una persona a cámara, se permite hasta **3 s** por plano, cortando en el final de frase, nunca en medio de una palabra.
- Plano de más de 1,5 s: **zoom lento de 100 % a 108 %** durante todo el plano para que nunca quede quieto.
- Silencios de más de **0,5 s**: se cortan. Tomas repetidas, muletillas y frases cortadas: afuera.

## Primeros 3 segundos (gancho)
- **Cuadro 0 con título gancho**, sin fundido desde negro: 2 líneas, la 1.ª blanca a **120 px** y la 2.ª roja a **150 px**, centradas al **47 %** de la altura. La 2.ª línea entra **4 cuadros** después con un golpe de escala de 130 % a 100 % en 6 cuadros (refs. 2 y 3).
- **2 o 3 cortes** dentro de los primeros 3 s (refs. 1 y 3: 3 cortes antes de 2,4 s).
- Cada línea deja **al menos 80 px de margen a cada lado**: si no entra, se achica sola (los 120/150 px son el máximo).
- El gancho es una pregunta o una afirmación con humor que nombra el problema ("¿Entrenás sin plan?").
- Golpe de sonido (`sfx/impacto.wav`) en el cuadro 0.

## Subtítulos (de la ref. 2)
- **Palabra por palabra:** cada palabra aparece cuando se dice, con un "pop" de 60 % a 100 % en **4 cuadros**.
- Hasta **3 palabras** en pantalla. Se cambia de grupo al final de cada frase o tras una pausa de más de 350 ms.
- **58 px**, Montserrat 700, blanco, centrados al **55 % de la altura** (a la altura del pecho, como la ref. 2), con márgenes de 90 px. Sin borde: sombra suave `0 4px 14px rgba(0,0,0,.65)`.
- **Una palabra clave por grupo como máximo**, en rojo `#CC1310`, Montserrat 900 y **15 % más grande**. Se destaca la palabra que lleva el sentido (problema, número, resultado, beneficio), no conectores.
- Si al 55 % taparían algo importante (un cartel, un texto, una cara o un producto), se suben al **30 % de la altura**.
- Sin subtítulos mientras se ve un zócalo o el cierre.

## Videos sin voz (recorridos, b-roll)
- No hay silencios ni muletillas para cortar: se cortan los **tramos de paso** (giros desenfocados, cruces de puertas, paredes vacías) para dejar planos de 1,5–2,5 s.
- La música original del video se mantiene **continua** debajo de los cortes (solo se corta la imagen) y sale en 1,5 s al final.
- Los textos en pantalla se escriben con el mismo estilo que los subtítulos (palabra por palabra, clave en rojo), sacados del tema del video. Se muestran al usuario antes de aplicarlos.
- Si la grabación ya trae un cierre de logo, se reemplaza por el cierre de 2 s de este archivo.

## Transiciones (de la ref. 1)
- Base: **corte seco**. Cada 3 o 4 cortes, uno es **paneo látigo**: **6 cuadros (0,2 s)**, desenfoque horizontal de hasta 60 px en el medio, alternando izquierda y derecha. Es lo que hace la ref. 1 entre escenas: 4–6 cuadros de barrido desenfocado.
- Preferir **cortes por continuidad** (mano → reloj, paso → zapatilla) cuando el material lo permita (ref. 1).
- Nada de fundidos cruzados, cortinas ni zooms digitales de transición.

## Gráficos
- **Zócalo** para presentar a alguien (ref. 3): línea azul de 120x6 px que crece en 8 cuadros, NOMBRE en rojo a 64 px (900), ROL en blanco a 44 px (700) y frase con humor entre comillas en Inter 700 a 32 px. Centrado y arrancando al 68 % de la altura. Cada línea entra 3–4 cuadros después de la anterior.
- Números y datos grandes en rojo con Montserrat 900 (ref. 2: "8 semanas").

## Sonido
- Si `musica/` tiene archivos: música de fondo a **volumen 0,10–0,15** (unos -16 a -20 dB) bajo la voz, con **entrada de 1 s** (como la ref. 1) y **salida de 1,5 s** al final. Si `musica/` está vacía: sin música.
- **Whoosh** (`sfx/whoosh.wav`) 2 cuadros antes de cada paneo látigo.
- **Impacto** (`sfx/impacto.wav`) en el cuadro 0 del gancho y cuando se arma el logo.
- Los efectos son síntesis propias hechas con FFmpeg. Las referencias tienen la música muy al frente y no se pudo aislar si usan efectos.

## Cierre (refs. 1 y 3)
- **2 s** sobre negro: las dos mitades de la X se juntan desde ±260 px en 14 cuadros, con el logo de **300 px** de ancho.
- Llamada a la acción debajo, en Inter 700 a 34 px con interletrado de 40 % (por defecto "REGISTRATE"), y una línea azul de 90x5 px.
- Fundido a negro en los últimos 8 cuadros.

## Qué se tomó de cada referencia
| Ref. | Archivo | Qué se tomó |
|---|---|---|
| 1 | `referencias/ref1-DXjwsAKjFB2.mp4` | Paneos látigo de 4–6 cuadros, cortes por continuidad, música que entra en 1 s y cierre con el logo sobre negro |
| 2 | `referencias/ref2-DZYEkfpMK_d.mp4` | Subtítulos chicos a la altura del pecho, palabra por palabra, con la palabra clave en rojo; títulos con número grande |
| 3 | `referencias/ref3-DV90aO2DBnL.mp4` | Ritmo de un corte cada 1,5–2,5 s, gancho con 3 cortes en 2 s, zócalos nombre/rol/frase con humor |
| 5 | `referencias/ref5-DfXdCL7sOB2.mp4` | Formato explicativo: voz en off, gimnasio 3D isométrico, texto arriba con recuadros de color, barra de progreso con ✓, tarjetas tipo app, loop |
| 6 | `referencias/ref6-DfU22HORUf1.mp4` | Encabezado con línea de avance, destellos entre secciones, listas en tarjetas apiladas con ícono, cierre con logo y "Guárdalo y síguenos" |

Mediciones: cortes detectados con FFmpeg (`select=gt(scene,0.25)`), colores y tamaños medidos sobre cuadros, sonoridad con `ebur128`, y las referencias transcritas con Whisper.

## Formato serie explicativa (serie RXT de 9 reels)
Para videos que explican algo con voz en off (pedido para la serie RXT; inspirado en la ref. 5, sin copiarla).
- **Voz en off:** la elegida es ElevenLabs (pendiente de que funcione la clave). Mientras tanto, Kokoro `em_alex` a velocidad 1,05, oración por oración (pausa de 0,32 s después de "." y "?"), con cadena de locutor: pasa-altos a 85 Hz, +2,5 dB de calidez a 180 Hz, −2 dB a 350 Hz, +3 dB de presencia a 3,2 kHz, −3,5 dB en las "s" a 7 kHz, compresión 3:1 y un toque de sala. **Piper no se usa:** al usuario le sonó cruda. La marca se pronuncia "Roxet" y en pantalla dice "RXT".
- **Imagen:** gimnasio RXT en 3D isométrico, de noche, con una zona por servicio. La cámara se mueve sin cortes de una zona a otra justo cuando la voz la nombra (18 cuadros de movimiento suave) y vuelve al encuadre inicial al final, para que el reel quede en loop.
- **Texto arriba**, centrado al **14 % de la altura**: Montserrat 800 a **66 px**, blanco, palabra por palabra, en trozos de hasta 6 palabras (se corta en comas y en el final de cada oración). Las **palabras clave van sobre un recuadro rojo** y lo secundario sobre recuadro azul (radio de 10 px). La primera oración (gancho) se ve entera desde el cuadro 0.
- **Barra de progreso** debajo del texto (23 % de la altura): actual en rojo, terminados en azul con ✓. En el 3D, la zona activa se pone roja y tiene un marcador numerado.
- **Tarjetas tipo app** abajo (fondo oscuro translúcido, radio de 34 px) para listas: chips que se encienden en azul cuando se dicen y filas con ícono.
- **Encabezado** (de la ref. 6): logo X y "RXT" a la izquierda, "PARTE n/9" a la derecha y debajo una **línea de 4 px que se llena en rojo** a medida que avanza el video.
- **Secciones separadas por un destello** de luz cálida en diagonal (12 cuadros, de la ref. 6) más un whoosh.
- **Listas en tarjetas apiladas** (de la ref. 6): una pastilla de sección con borde rojo arriba y cada tarjeta con ícono cuadrado de color, TÍTULO en Montserrat 900 a 40 px y un detalle en Inter a 26 px. Entran de a una, subiendo 60 px, cuando la voz las nombra.
- **Cierre de serie** (de la ref. 6): el 3D se oscurece al 78 %, pastilla "GUÁRDALO Y SÍGUENOS", logo X que se arma, "RXT / TRAINING CLUB" y barra de 9 segmentos con las partes publicadas en rojo. Sin texto de subtítulos encima.
- **Sonido:** voz; whoosh suave (volumen 0,35) en cada movimiento de cámara; impacto en el cuadro 0.
- **Música:** si `musica/` está vacía, se genera una base original con `scripts/musica.py` (100 BPM, electrónica oscura en La menor), del largo exacto del reel. Lleva **ducking**: volumen **0,32** en las pausas (el usuario la pidió un poco más fuerte), que baja al **42 %** mientras habla la voz (entra y sale en 250 ms), con entrada de 1 s y salida de 1,5 s.
