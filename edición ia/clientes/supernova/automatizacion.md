# Turno de madrugada de Supernova

Lo que hace Claude solo, en una sesión en la nube programada (sin nadie mirando), para que cada mañana haya un reel
listo para aprobar. El usuario **aprueba y publica él**: nada se sube a Instagram desde acá.

## Qué hace cada noche
1. **Preparar:** desde `edición ia/proyecto/`: si falta `node_modules`, `npm install`; si falta pedalboard, `pip3 install --break-system-packages pedalboard soundfile`.
   No hace falta whisper ni voces (el formato no tiene voz).
2. **Leer** `clientes/supernova/marca.md` (voz, reglas, rueda), `contenido.md` (cola) y, si el conector de Docs está disponible,
   el doc "Cerebro Supernova" (manda sobre `marca.md`).
3. **Elegir** la primera idea `pendiente` de `contenido.md` cuyo formato sea `dos-caminos`.
   Si no queda ninguna, **escribir 3 ideas nuevas** al final de la cola siguiendo la rueda (y usar la primera).
4. **Escribir el guion** `clientes/supernova/guiones/<NN>-<giro>.json` copiando la forma de `01-barberia.json`:
   - Gancho de 2 etiquetas, **máximo 7 palabras** en total, distinto de todos los ya usados.
   - Mensajes reales de ese giro (cómo escribe un cliente de Teocelo/Coatepec/Xico), 3 o 4, cortos (máx. 28 caracteres).
   - Voz de Supernova: directo, fino, seguro, tuteo; nada de "ofertón", "aprovecha", tecnicismos ni nombres de clientes.
   - `app.items`: exactamente 3; `cierre.palabra`: "APP" (o "DIAGNÓSTICO" si la idea lo pide).
   - `publicacion`: descripción (1.ª línea = gancho, CTA "Escríbeme APP por DM"), 4–6 hashtags (giro + Teocelo/Coatepec/Xico),
     2 ganchos alternativos y horario.
5. **Revisar antes de renderizar:** `node scripts/supernova.mjs ../clientes/supernova/guiones/<id>.json --cuadros` y mirar la hoja de
   cuadros: ningún texto cortado o encimado, todo dentro de la zona segura. Si algo no entra, acortar el texto del guion (no tocar el código).
6. **Renderizar:** `node scripts/supernova.mjs ../clientes/supernova/guiones/<id>.json` (≈ 3–4 min) →
   `clientes/supernova/exportados/<id>/` con `video.mp4`, `portada.jpg` y `publicacion.txt`.
7. **Anotar:** en `contenido.md` la idea pasa a `lista para aprobar`; en `marca.md` se agrega la fila en "Videos hechos".
8. **Guardar:** commit con mensaje "Supernova <id>: reel listo para aprobar" y push.
9. **Avisar** al usuario con una notificación: gancho del reel, giro y dónde está el video.

## Qué NO hace
- No publica ni manda mensajes a nadie.
- No lee ni descarga nada de Instagram (el permiso está bloqueado en la nube).
- No cambia código, `marca.md` (salvo la tabla de videos), `estilo.md` ni archivos de otros clientes.
- Si algo falla (render, dependencias), no inventa resultados: deja anotado el error en `contenido.md` junto a la idea y avisa.

## Cómo aprueba el usuario
En la tabla de `contenido.md`, cambia `lista para aprobar` por `aprobada` o por `cambios: <qué cambiar>`.
La noche siguiente, antes de hacer un reel nuevo, el turno rehace los que tengan `cambios:`.
