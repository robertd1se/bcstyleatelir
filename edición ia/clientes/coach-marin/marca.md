# Coach Marín – Método Coach Marín

Entrenador personal (Coach Marín, también head coach "OG" de Roxet). Vende programas de entrenamiento propios a través de su
**web app**: https://coachmarin.neocities.org/inicio ("Método Coach Marín": inicio con "Entrar", método, programas, formación,
preguntas frecuentes, cuestionario "Empieza" que se manda por WhatsApp y acceso para clientes "Entra a Método Marín").
El usuario (el editor) lo ayudó a armar la app. Copia de la página: `referencias/sitio-inicio.html`.

## Marca
| Elemento | Valor |
|---|---|
| Lema | "Entrena inteligentemente. Transforma tu cuerpo." · "No necesitas entrenar más, necesitas entrenar mejor." · Pilares: **FUERZA · CONDICIÓN · MOVIMIENTO** · "Entrenamiento inteligente." |
| Colores | Fondo casi negro azulado `#0b0f19` / `#0a0e17`, paneles `#121418` / `#1a1d23`; **azul eléctrico `#1e6bff`** (principal), `#3b82ff`, `#5b95ff`, celeste `#8fb4ff`; azul profundo `#0b2a6b` / `#0d1f48`; grises `#7d8696` / `#8d939e`; blanco |
| Tipografías | **Oswald** 500–700 (títulos en mayúsculas), **Inter** 300–700 (texto), **Cormorant Garamond** (serif elegante, itálica para acentos) |
| Logo | "M" serif con sombra gris + círculo de pincel + "COACH MARÍN" en serif, blanco: `proyecto/public/clientes/coach-marin/logo.png` (560x543) y `logo-chico.png` (240x233) |
| Estética de la web | Oscura premium con luz ambiente y grano (muy parecida al estilo del usuario) |
| Tono | Profesional, motivador y cercano; trata de "tú" (México) |
| Redes / contacto | Instagram **@coachmarinmartinez** · Facebook · WhatsApp 228 501 7661 |

## El método (4 pasos de la web)
01 Evaluación · 02 Plan a tu medida ("con estrategia, no con improvisación") · 03 Seguimiento ("para que nunca te estanques") · 04 Resultados ("progreso medible y sostenible").
Datos: 11 títulos y certificaciones · 100 % personalizado · seguimiento 1:1. Lic. en Educación Física, Deporte y Recreación; CrossFit L1; certificaciones en funcional e híbrido; diplomados en hipertrofia, entrenamiento para mujeres, deportivo, composición corporal; cursos de adultos mayores, control de carga y nutrición deportiva.

## Programas (precios en MXN, "cupos limitados cada mes")
| Programa | Para quién | Precio |
|---|---|---|
| **Home Challenge** (recomendado) | "No tengo tiempo de ir al gym": 28 días, 21 entrenamientos en video, desde casa. "Cero excusas." | $399 pago único |
| **Strength Program** | Ya entrena y quiere más fuerza y músculo | $1,000 / mes |
| **Online Coaching** | Plan 100 % personalizado en su gym | $1,500 / mes |
| **Rehab** | Recuperarse de una lesión, en coordinación con su profesional de salud | $2,000 / mes |
| **HYROX Challenge** | Quiere competir en HYROX | $2,500 / mes |
Pago en efectivo o tarjeta. Para empezar: elegir programa → llenar el cuestionario "Empieza" → mandarlo por WhatsApp.

## Ideas de videos (para proponer)
- Un reel por programa ("¿No tienes tiempo de ir al gym? 28 días, 21 entrenamientos…") con CTA "Comenta HOME y te mando el link".
- "El método en 4 pasos" (formato capítulos), "¿Cuál programa es para ti?" (el quiz de la web en video).
- Mostrar la web app dentro de un celular animado (pantallas reales de la página).

## Videos hechos
- **Reel con música** (24,6 s): une los 3 reels animados de la app que mandó el usuario (`grabaciones/Reel_*.mp4`, mudos) cortados al ritmo de una base propia "fresca" (house/pop a 120 BPM, `scripts/musica.py --estilo fresco`), con golpe de zoom en cada corte, pulso en cada tiempo y destellos azules en el drop, el precio y el cierre. Paquete en `exportados/reel-musica/`. Composición `MarinMusica` (`proyecto/src/clientes/coach-marin/`).
- **Todo el método** (35 s): video completo con ganchos cada pocos segundos (gancho "¿Entrenas sin plan?" → drop → "El método en 4 pasos" con tarjetas PASO 01–04 y pantallas de la app → "¿Cuál es para ti?" con los 5 programas y precios → $399 → datos de credibilidad → "Comenta «PLAN»" → logo M + tarjeta de seguir, loop). Música fresca 120 BPM, cortes al ritmo. Paquete en `exportados/todo-el-metodo/`. Composición `MarinTodo`; piezas de marca en `proyecto/src/clientes/coach-marin/` (`marca.ts`, `piezas.tsx`).
