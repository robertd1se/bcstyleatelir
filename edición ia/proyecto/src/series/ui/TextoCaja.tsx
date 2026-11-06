import { Caption } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, COLORES, FUENTES } from "../../estilo";

// Texto de la serie: combinación editorial dentro de la misma frase.
// · Serif editorial (Bodoni Moda) en blanco para el texto.
// · Manuscrita (Allura) dorada o roja, 1,55× más grande, para las palabras clave.
// Palabra por palabra; las manuscritas se "escriben" de izquierda a derecha.
export const TEXTO_CAJA = {
  tamaño: 70,
  escalaManuscrita: 1.55,
  maxPalabras: 6,
  centroY: 0.245, // debajo del encabezado, dentro de la zona segura
  margenLateral: 120,
  sombra: "0 4px 18px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.6)",
};

type Tipo = "normal" | "oro" | "rojo";
type Palabra = Caption & { tipo: Tipo };

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
 * doradas / rojas: palabras clave en manuscrita (sin importar tildes ni mayúsculas).
 * Los números de lista ("1.", "2.") van en manuscrita dorada.
 */
export const TextoCaja: React.FC<{ palabras: Caption[]; doradas?: string[]; rojas?: string[]; centroY?: number; tamaño?: number }> = ({
  palabras,
  doradas = [],
  rojas = [],
  centroY = TEXTO_CAJA.centroY,
  tamaño = TEXTO_CAJA.tamaño,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const paginas = useMemo(() => {
    const d = new Set(doradas.map(norm));
    const r = new Set(rojas.map(norm));
    return paginar(
      palabras.map((p) => ({
        ...p,
        tipo: (r.has(norm(p.text)) ? "rojo" : d.has(norm(p.text)) || /^\d+\.$/.test(p.text) ? "oro" : "normal") as Tipo,
      })),
    );
  }, [palabras, doradas, rojas]);

  const pagina = paginas.find((p, i) => {
    const fin = Math.min(p[p.length - 1].endMs + 500, paginas[i + 1]?.[0].startMs ?? Infinity);
    return ms >= p[0].startMs - 30 && ms < fin;
  });
  if (!pagina) return null;

  const inicioPagina = Math.round((pagina[0].startMs / 1000) * fps);
  const sube =
    pagina[0].startMs === 0
      ? 0
      : interpolate(frame - inicioPagina, [0, 8], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: TEXTO_CAJA.margenLateral,
          right: TEXTO_CAJA.margenLateral,
          top: ALTO * centroY,
          transform: `translateY(calc(-50% + ${sube}px))`,
          textAlign: "center",
          fontFamily: FUENTES.editorial,
          fontWeight: 500,
          fontSize: tamaño,
          lineHeight: 1.18,
          letterSpacing: "-0.01em",
          color: COLORES.blanco,
          textShadow: TEXTO_CAJA.sombra,
        }}
      >
        {pagina.map((p) => {
          if (ms < p.startMs - 30) return null;
          const desde = p.startMs === 0 ? -100 : Math.round((p.startMs / 1000) * fps);
          const f = frame - desde;
          if (p.tipo === "normal") {
            const o = interpolate(f, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span key={p.startMs + p.text} style={{ display: "inline-block", margin: "0 0.13em", opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
                {p.text}
              </span>
            );
          }
          // manuscrita: se escribe de izquierda a derecha en 9 cuadros
          const escrito = interpolate(f, [0, 9], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
          return (
            <span
              key={p.startMs + p.text}
              style={{
                display: "inline-block",
                margin: "0 0.1em 0 0.12em",
                padding: "0 0.12em",
                fontFamily: FUENTES.manuscrita,
                fontWeight: 400,
                fontSize: tamaño * TEXTO_CAJA.escalaManuscrita,
                lineHeight: 0.8,
                letterSpacing: 0,
                verticalAlign: "-0.06em",
                color: p.tipo === "oro" ? COLORES.dorado : COLORES.rojoTexto,
                clipPath: `inset(-30% ${100 - escrito}% -30% -10%)`,
              }}
            >
              {p.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
