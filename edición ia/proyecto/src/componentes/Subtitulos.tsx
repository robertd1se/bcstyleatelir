import { Caption } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, COLORES, FUENTES, SUBTITULOS } from "../estilo";

type Palabra = Caption & { clave: boolean };

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

// Agrupa en páginas de hasta N palabras; corta antes si hay una pausa o termina una frase.
const paginar = (palabras: Palabra[]) => {
  const paginas: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const p of palabras) {
    const anterior = actual[actual.length - 1];
    const pausa = anterior && p.startMs - anterior.endMs > 350;
    if (actual.length >= SUBTITULOS.maxPalabras || pausa) {
      paginas.push(actual);
      actual = [];
    }
    actual.push(p);
    if (/[.?!]$/.test(p.text.trim())) {
      paginas.push(actual);
      actual = [];
    }
  }
  if (actual.length) paginas.push(actual);
  return paginas;
};

/**
 * Subtítulos palabra por palabra: blanco, la palabra clave en rojo y más grande.
 * palabrasClave: palabras a destacar (sin importar mayúsculas ni tildes). Máximo una por página.
 */
export const Subtitulos: React.FC<{ captions: Caption[]; palabrasClave?: string[] }> = ({
  captions,
  palabrasClave = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const paginas = useMemo(() => {
    const claves = new Set(palabrasClave.map(normalizar));
    const palabras = captions
      .filter((c) => c.text.trim())
      .map((c) => ({ ...c, clave: claves.has(normalizar(c.text)) }));
    return paginar(palabras);
  }, [captions, palabrasClave]);

  const pagina = paginas.find((p, i) => {
    const fin = Math.min(p[p.length - 1].endMs + 400, paginas[i + 1]?.[0].startMs ?? Infinity);
    return ms >= p[0].startMs && ms < fin;
  });
  if (!pagina) return null;

  let claveUsada = false;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: SUBTITULOS.margenLateral,
          right: SUBTITULOS.margenLateral,
          top: ALTO * SUBTITULOS.centroY,
          transform: "translateY(-50%)",
          textAlign: "center",
          fontFamily: FUENTES.subtitulos,
          fontSize: SUBTITULOS.tamaño,
          lineHeight: 1.15,
          textShadow: SUBTITULOS.sombra,
        }}
      >
        {pagina.map((p) => {
          if (ms < p.startMs) return null; // palabra por palabra
          const clave = p.clave && !claveUsada;
          if (clave) claveUsada = true;
          const f = Math.round(((ms - p.startMs) / 1000) * fps);
          const pop = spring({ frame: f, fps, durationInFrames: SUBTITULOS.entradaFrames, config: { damping: 14 } });
          const escala = interpolate(pop, [0, 1], [0.6, 1]);
          return (
            <span
              key={p.startMs}
              style={{
                display: "inline-block",
                margin: "0 0.13em",
                // la palabra clave es más grande vía tamaño de fuente (no escala) para que no pise a las vecinas
                fontSize: clave ? SUBTITULOS.tamaño * SUBTITULOS.escalaClave : undefined,
                fontWeight: clave ? 900 : 700,
                color: clave ? COLORES.rojo : COLORES.blanco,
                transform: `scale(${escala})`,
                opacity: pop,
              }}
            >
              {p.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
