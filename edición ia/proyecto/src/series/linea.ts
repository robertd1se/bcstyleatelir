import { Caption } from "@remotion/captions";
import { Easing, interpolate } from "remotion";
import { FPS } from "../estilo";

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/** Cuadro en que se dice `palabra` (la n-ésima vez, empezando en 0). */
export const cuandoSeDice = (palabras: Caption[], palabra: string, n = 0) => {
  const objetivo = norm(palabra);
  const hallados = palabras.filter((p) => norm(p.text) === objetivo);
  const p = hallados[n];
  if (!p) throw new Error(`No se dice "${palabra}" (vez ${n}) en el guion`);
  return Math.round((p.startMs / 1000) * FPS);
};


/**
 * Interpola valores numéricos entre claves: cada cambio dura `transicion` cuadros (con aceleración)
 * y arranca un poco antes de la clave para que llegue justo cuando se dice la palabra.
 */
export const interpolarClaves = <K extends string>(
  frame: number,
  claves: ({ frame: number } & Record<K, number>)[],
  campos: K[],
  transicion = 18,
) => {
  const res = {} as Record<K, number>;
  for (const c of campos) {
    let v: number = claves[0][c];
    for (let i = 1; i < claves.length; i++) {
      const inicio = claves[i].frame - transicion / 2;
      const destino: number = claves[i][c];
      v = interpolate(frame, [inicio, inicio + transicion], [v, destino], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
    }
    res[c] = v;
  }
  return res;
};
