import { Caption } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, COLORES, FUENTES } from "../../estilo";

// Formato explicativo: texto arriba, palabra por palabra, con las palabras clave sobre un recuadro de color.
export const TEXTO_CAJA = {
  tamaño: 66,
  maxPalabras: 6,
  centroY: 0.14,
  margenLateral: 80,
};

type Palabra = Caption & { caja: string | null };

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

// Parte cada oración en trozos parejos de hasta maxPalabras, cortando de preferencia después de una coma.
const paginar = (ps: Palabra[]) => {
  const oraciones: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const p of ps) {
    actual.push(p);
    if (/[.?!:]$/.test(p.text)) {
      oraciones.push(actual);
      actual = [];
    }
  }
  if (actual.length) oraciones.push(actual);

  const paginas: Palabra[][] = [];
  for (const o of oraciones) {
    const trozos = Math.ceil(o.length / TEXTO_CAJA.maxPalabras);
    const objetivo = Math.ceil(o.length / trozos);
    let pag: Palabra[] = [];
    o.forEach((p, i) => {
      pag.push(p);
      const quedan = o.length - i - 1;
      const coma = /,$/.test(p.text) && pag.length >= 3 && quedan >= 2;
      if (quedan > 0 && (pag.length >= objetivo || coma)) {
        paginas.push(pag);
        pag = [];
      }
    });
    if (pag.length) paginas.push(pag);
  }
  return paginas;
};

/**
 * cajasRojas / cajasAzules: palabras que van sobre recuadro (sin importar tildes ni mayúsculas).
 * Las palabras seguidas con caja del mismo color se unen en un solo recuadro.
 */
export const TextoCaja: React.FC<{ palabras: Caption[]; cajasRojas?: string[]; cajasAzules?: string[] }> = ({
  palabras,
  cajasRojas = [],
  cajasAzules = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const paginas = useMemo(() => {
    const r = new Set(cajasRojas.map(norm));
    const a = new Set(cajasAzules.map(norm));
    return paginar(
      palabras.map((p) => ({
        ...p,
        caja: r.has(norm(p.text)) || /^\d+\.$/.test(p.text) ? COLORES.rojo : a.has(norm(p.text)) ? COLORES.azul : null,
      })),
    );
  }, [palabras, cajasRojas, cajasAzules]);

  const pagina = paginas.find((p, i) => {
    const fin = Math.min(p[p.length - 1].endMs + 500, paginas[i + 1]?.[0].startMs ?? Infinity);
    return ms >= p[0].startMs - 30 && ms < fin;
  });
  if (!pagina) return null;

  // agrupar palabras seguidas con la misma caja
  const grupos: { caja: string | null; ps: Palabra[] }[] = [];
  for (const p of pagina) {
    const g = grupos[grupos.length - 1];
    if (g && g.caja && g.caja === p.caja) g.ps.push(p);
    else grupos.push({ caja: p.caja, ps: [p] });
  }

  // cada página entra subiendo 24 px en 6 cuadros
  const inicioPagina = Math.round((pagina[0].startMs / 1000) * fps);
  const sube = pagina[0].startMs === 0 ? 0 : interpolate(frame - inicioPagina, [0, 6], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: TEXTO_CAJA.margenLateral,
          right: TEXTO_CAJA.margenLateral,
          top: ALTO * TEXTO_CAJA.centroY,
          transform: `translateY(calc(-50% + ${sube}px))`,
          textAlign: "center",
          fontFamily: FUENTES.titulos,
          fontWeight: 800,
          fontSize: TEXTO_CAJA.tamaño,
          lineHeight: 1.25,
          color: COLORES.blanco,
          textShadow: "0 4px 18px rgba(0,0,0,0.8)",
        }}
      >
        {grupos.map((g, gi) => {
          const visibles = g.ps.filter((p) => ms >= p.startMs - 30);
          if (!visibles.length) return null;
          const f0 = Math.round(((ms - g.ps[0].startMs) / 1000) * fps);
          const pop = spring({ frame: f0, fps, durationInFrames: 5, config: { damping: 14 } });
          const contenido = visibles.map((p) => p.text).join(" ");
          if (!g.caja) {
            return visibles.map((p) => {
              const fp = Math.round(((ms - p.startMs) / 1000) * fps);
              // las palabras del gancho (startMs 0) se ven completas desde el cuadro 0
              const o = p.startMs === 0 ? 1 : interpolate(fp, [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span key={`${gi}-${p.startMs}`} style={{ opacity: o, margin: "0 0.12em", display: "inline-block" }}>
                  {p.text}
                </span>
              );
            });
          }
          return (
            <span
              key={gi}
              style={{
                display: "inline-block",
                margin: "0.08em 0.12em",
                padding: "0.02em 0.28em 0.08em",
                background: g.caja,
                borderRadius: 10,
                textShadow: "none",
                transform: `scale(${g.ps[0].startMs === 0 ? 1 : interpolate(pop, [0, 1], [0.7, 1])})`,
              }}
            >
              {contenido}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
