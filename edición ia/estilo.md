# Mi estilo de edición (para todos los clientes)

Estas reglas valen para **todos** los videos: Roxet, personales y cualquier negocio.
Lo propio de cada cliente (colores, tipografías, logo, tono, formatos y referencias) está en `clientes/<cliente>/marca.md` y **manda sobre lo de acá** cuando hay diferencias.

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

## Formatos disponibles
Además de la edición de grabaciones, hay dos formatos animados ya construidos (ver detalles en `clientes/roxet/marca.md`, donde se usaron por primera vez):
- **Explicativo 3D:** escenario isométrico en 3D, voz en off, texto arriba y tarjetas (`proyecto/src/series/`).
- **Explicativo 2D:** ilustración plana con contorno, mini-escenas cada 1,5–3 s e infografías (`proyecto/src/series2d/`).
Para otro cliente se reutilizan cambiando colores, tipografías, logo y escenario según su `marca.md`.

## Formato
- Vertical **1080x1920, 30 fps**, H.264 + AAC 48 kHz.
- Audio final normalizado a **-14 LUFS**, pico máximo -1 dBTP (las 3 referencias miden -14 LUFS).
- Siempre en vertical real. No usar videos horizontales girados dentro del cuadro (la ref. 1 lo hace; no lo adoptamos).

## Zona segura de Instagram Reels (obligatoria)
Instagram tapa partes del video con su interfaz y en el feed lo recorta a 4:5. Ningún texto, gráfico, logo o elemento clave va fuera de esta zona (en 1080x1920):
- **Arriba: 290 px libres** (título "Reels" + recorte del feed). El encabezado empieza en y=296.
- **Abajo: 440 px libres** (usuario, descripción, audio): nada importante por debajo de y=1480.
- **Derecha: 140 px libres entre y=1000 y y=1480** (botones de me gusta, comentar, compartir). Márgenes laterales del texto: 120 px.
- Valores en `proyecto/src/estilo.ts` → `ZONA_SEGURA`. Antes de exportar, revisar cuadros con el esquema de la interfaz encima (zonas rojas = tapado).
- Ubicación actual: texto de la serie 3D centrado al 24,5 %; barra de progreso al 32,5 %; tarjetas entre y≈1090 y y≈1450; subtítulos del formato 2D al 70,5 %.

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

