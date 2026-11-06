import { Caption } from "@remotion/captions";
import { interpolate } from "remotion";

/**
 * Volumen de la música con "ducking": baja cuando habla la voz y sube en las pausas.
 * base: volumen en pausas · agachada: proporción mientras habla (0.35 = baja a un 35 %).
 * Entra en 1 s y sale en los últimos 1,5 s.
 */
export const volumenMusica = (palabras: Caption[], fps: number, duracion: number, base = 0.32, agachada = 0.42) => {
  // tramos de voz (se unen si la pausa es menor a 450 ms)
  const tramos: [number, number][] = [];
  for (const p of palabras) {
    const ult = tramos[tramos.length - 1];
    if (ult && p.startMs - ult[1] < 450) ult[1] = p.endMs;
    else tramos.push([p.startMs, p.endMs]);
  }
  return (f: number) => {
    const ms = (f / fps) * 1000;
    let distancia = Infinity;
    for (const [a, b] of tramos) {
      if (ms >= a - 120 && ms <= b + 150) {
        distancia = 0;
        break;
      }
      distancia = Math.min(distancia, Math.abs(ms - (a - 120)), Math.abs(ms - (b + 150)));
    }
    const nivel = interpolate(distancia, [0, 250], [agachada, 1], { extrapolateRight: "clamp" });
    const bordes = interpolate(f, [0, fps, duracion - fps * 1.5, duracion], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return base * nivel * bordes;
  };
};
