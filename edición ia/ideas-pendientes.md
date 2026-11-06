# Ideas pendientes

Cosas que el usuario quiere recordar pero **todavía no aprobó** para `estilo.md`. No aplicarlas sin su ok.

## Efectos de sonido para cortes (ref. 4)

Referencia: `referencias/ref4-Dd_EPp5RzRN.mp4` (https://www.instagram.com/reel/Dd_EPp5RzRN/), un catálogo de efectos de sonido
("Real Estate Sound Effects, Part 1"). No tiene cortes de imagen: muestra 6 sonidos, uno cada 3 s. No reutilizar sus audios;
hacer versiones propias con FFmpeg en `proyecto/public/sfx/`.

| Efecto | En la ref. | Cómo es (medido) |
|---|---|---|
| Typing | 0,7–1,9 s | Clics cortos y parejos, 1,2 s |
| UI Animations | 3,1–4,9 s | Serie de "pops" rápidos, 1,8 s |
| Riser | 5,1–8,2 s | Sube 3 s de -51 a -12 dB y se corta de golpe en el pico (ahí va el corte) |
| Finger Snap | 9,1 s | Chasquido seco con cola de eco de 2,6 s |
| UI Riser | 11,8–13,9 s | Subida corta de 2 s que se apaga |
| Woosh | 14,7–15,8 s | 1,1 s, pico en el medio (el actual `whoosh.wav` dura 0,45 s) |

Propuesta de reglas (sin aprobar):
1. **Riser** de 1,5–2 s que termina exactamente en el corte más importante (revelación o cierre del logo).
2. **Chasquido** en 1–2 cortes secos importantes por video, no en todos.
3. **Pop** suave cuando aparece la palabra clave en rojo.
4. **Clics de tipeo** cuando un texto aparece letra por letra.
5. **Woosh** más largo (1 s), con el pico en el medio del látigo.

Idea de aplicación: volver a exportar el video "ELEGIDO" con un riser que termine justo cuando aparece el cartel.
