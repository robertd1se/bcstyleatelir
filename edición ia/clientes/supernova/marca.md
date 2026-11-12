# Supernova (marca personal del usuario)

Agencia del usuario (@supernova.digitall): hace **apps de pago único** (una página con link y QR, con servicios, precios,
horarios, citas, etc.), diseño, contenido y publicidad para **negocios locales de Teocelo, Coatepec, Xico y alrededores**
(barberías y salones, gimnasios y academias, restaurantes y cafés, coaches y profesionales, tiendas).
Los videos buscan que esos dueños **escriban APP o DIAGNÓSTICO por DM**.

Fuente de verdad del negocio: el doc **"Cerebro Supernova"** (https://claude.ai/artifact/ETvtzoU3JMh2TL56E9sNY4):
voz, cliente ideal, oferta y precios, objeciones, casos, la rueda y el guion de DM. Si algo de acá choca con el Cerebro, manda el Cerebro.

## Voz (resumen del Cerebro)
- Experto de confianza: **directo, fino y seguro**. Frases cortas. Tutea ("te acompaño").
- Palabras de élite ("tu marca", "tu nivel", "a la medida"); nunca "ofertón", "aprovecha ya", ni tecnicismos ("hosting", "responsive", "backend").
- Afirma, no pregunta lo obvio. Nada genérico.
- Frases ancla: "Tu negocio es mejor de lo que se ve", "Haz que te elijan a ti", "Más que una app: te acompaño".
- Emojis pocos y al inicio de cada idea (📲 🎨 📸 📈 💜 👇). El morado es el color.
- **Nunca nombrar clientes en videos de venta** salvo con su permiso (casos de la etapa Transformar).
- Precios: solo si el video es de Educar sobre "está caro" ("pago único desde $1,500"). Nunca bajar el precio.

## La rueda (qué video toca)
| Etapa | Qué se publica | Frecuencia |
|---|---|---|
| Fascinar | Reels con gancho ("Tienes 3 segundos", "Abre tu perfil", "Mismo cliente. Dos caminos.") | un reel cada 2 días |
| Educar | Una objeción por reel ("¿Para qué una app si tengo Facebook?") | 2 por semana |
| Invitar | Cierre de **todos** los videos: "Escríbeme APP por DM" (o "DIAGNÓSTICO") | en todo |
| Transformar | Antes y después, frases de clientes, apps funcionando | 1 por semana |

La cola de ideas está en `contenido.md` (la usa el turno de madrugada).

## Referencias
| Ref. | Archivo | Qué se toma |
|---|---|---|
| S1 (era P7 de personal) | `referencias/s1-DfpHUNFiKke.mov` (18 s, reel propio) | Formato **"dos caminos"** en motion graphics sin voz: dos teléfonos lado a lado ("sin app" en rojo vs. "con Supernova" en morado); **cámara virtual** que hace zoom a uno, se desliza al otro y se aleja para comparar; chat que se llena de mensajes sin respuesta mientras un **reloj** avanza; "4 mensajes y sigue esperando" → desenfoque → "Se fue con otro"; del otro lado llega el link, la pantalla se vuelve la app, los ítems se marcan, se toca "Apartar cita" → "Cita apartada"; comparación final y cierre con logo + "Escríbeme APP por DM". **Mejora:** el original pone logo y reloj en los 290 px de arriba (los tapa Instagram): acá van dentro de la zona segura. |

## Reglas medibles (formato motion graphics)
- **Sin voz**: todo se cuenta con texto y pantallas. Música a -14 LUFS con golpes; "pop" o clic en cada mensaje/toque.
- **Gancho:** cuadro 0 con dos etiquetas blancas apiladas (máx. 7 palabras), los dos teléfonos ya visibles.
- **Algo cambia cada 0,5–1,5 s:** un mensaje que entra, un ítem que se marca, un movimiento de cámara.
- **Cámara:** movimientos de 18–24 cuadros con ease in-out; nunca quieta (deriva de 1–2 % entre movimientos).
- **Duración:** 15–20 s. Cierre de 2,5 s.
- **Etiquetas:** caja blanca con texto negro (Inter 800); la palabra que importa en caja morada con texto blanco.
- **Zona segura:** todo entre y=296 y y=1480; el logo de la marca arriba al 17 %.

## Marca
| Elemento | Valor |
|---|---|
| Colores | Fondo `#0B0814` con brillo morado `#2A1550`; morado `#8B5CF6` (acento, botones, "con Supernova"); lila `#B49DFC` (palabra destacada); rojo `#E5484D` ("sin app", alertas); teléfono oscuro `#0D0E13`, teléfono claro `#F2F0EE`; blanco `#FFFFFF` |
| Tipografías | Inter (800 etiquetas y títulos, 500/600 interfaz), interletrado ancho en "SUPERNOVA" |
| Logo | Cruz con un anillo en órbita. **Pendiente: pedir el archivo real** (PNG/SVG). Mientras, se dibuja una aproximación en `proyecto/src/supernova/LogoSupernova.tsx` |
| Tono | Experto cercano, élite, seguro |
| Redes | Instagram @supernova.digitall · WhatsApp 228 160 1014 · app de muestra supern0vaaaa.neocities.org/indexxx |
| Firma en video | "@supernova.digitall" debajo de la llamada a la acción |

## Formatos que usa
- **Dos caminos** (motion graphics, ref. S1): `proyecto/src/supernova/DosCaminos.tsx`, alimentado por un guion JSON en `guiones/`.

## Videos hechos
| Video | Archivo | Notas |
|---|---|---|
| 01 · "Mismo corte. Dos barberías." (Fascinar, 18,9 s) | `exportados/01-barberia/` | Primer reel del formato dos caminos. Guion `guiones/01-barberia.json`. Lista para aprobar. |
