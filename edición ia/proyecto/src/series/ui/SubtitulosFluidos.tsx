import { Caption } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, COLORES, FUENTES } from "../../estilo";

// Subtítulos fluidos: la frase aparece completa (fundido + leve subida + desenfoque que se aclara),
// cada palabra se ilumina cuando se dice (karaoke) y la frase queda hasta que llega la siguiente,
// con un fundido cruzado entre frases. Serif editorial + manuscrita para las palabras clave.
export const SUB_FLUIDOS = {
  tamaño: 70,
  escalaManuscrita: 1.5,
  maxPalabras: 5,
  margenLateral: 120,
  entrada: 7, // cuadros
  salida: 4,
  anticipo: 90, // ms: la frase aparece un poco antes de que empiece a decirse
  pausaLarga: 1100, // ms: si la pausa es más larga, la frase se va antes
  sombra: "0 4px 18px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.6)",
};

type Tipo = "normal" | "oro" | "rojo";
type Palabra = Caption & { tipo: Tipo; numero: boolean };
const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const esNumero = (t: string) => /^\d+\.$/.test(t);

// Frases naturales: primero se corta en la puntuación (, . : ; ? !) y en pausas largas; un número de lista ("1.")
// va pegado a lo que sigue. Un tramo de más de maxPalabras se parte en partes parejas (6 → 3+3, 7 → 4+3)
// y un tramo de una sola palabra se une al vecino más corto, así nunca queda una palabra suelta.
const enFrases = (ps: Palabra[]) => {
  const tramos: Palabra[][] = [];
  let actual: Palabra[] = [];
  ps.forEach((p, i) => {
    actual.push(p);
    const sig = ps[i + 1];
    const corte = !p.numero && /[,.:;?!]$/.test(p.text);
    const pausa = sig && sig.startMs - p.endMs > 600;
    if (!sig || ((corte || pausa) && !p.numero)) {
      tramos.push(actual);
      actual = [];
    }
  });
  const cuenta = (f: Palabra[]) => f.filter((x) => !x.numero).length;
  // partir tramos largos en partes parejas
  const partes: Palabra[][] = [];
  for (const t of tramos) {
    const n = cuenta(t);
    if (n <= SUB_FLUIDOS.maxPalabras) {
      partes.push(t);
      continue;
    }
    const k = Math.ceil(n / SUB_FLUIDOS.maxPalabras);
    const tam = Math.ceil(n / k);
    let pag: Palabra[] = [];
    let c = 0;
    t.forEach((p, idx) => {
      pag.push(p);
      if (!p.numero) c++;
      if (c >= tam && idx < t.length - 1) {
        partes.push(pag);
        pag = [];
        c = 0;
      }
    });
    if (pag.length) partes.push(pag);
  }
  // unir tramos de una sola palabra con el vecino más corto
  const res: Palabra[][] = [];
  for (let i = 0; i < partes.length; i++) {
    const f = partes[i];
    if (cuenta(f) > 1) {
      res.push(f);
      continue;
    }
    const prev = res[res.length - 1];
    const next = partes[i + 1];
    const alPrev = prev && (!next || cuenta(prev) <= cuenta(next)) && cuenta(prev) < SUB_FLUIDOS.maxPalabras + 1;
    if (alPrev) res[res.length - 1] = [...prev, ...f];
    else if (next) partes[i + 1] = [...f, ...next];
    else res.push(f);
  }
  return res;
};

export const SubtitulosFluidos: React.FC<{
  palabras: Caption[];
  doradas?: string[];
  rojas?: string[];
  centroY?: number;
  tamaño?: number;
  hasta?: number; // ms: no mostrar nada después de este momento
}> = ({ palabras, doradas = [], rojas = [], centroY = 0.27, tamaño = SUB_FLUIDOS.tamaño, hasta = Infinity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const frases = useMemo(() => {
    const d = new Set(doradas.map(norm));
    const r = new Set(rojas.map(norm));
    return enFrases(
      palabras.map((p) => ({
        ...p,
        numero: esNumero(p.text),
        tipo: (r.has(norm(p.text)) ? "rojo" : d.has(norm(p.text)) || esNumero(p.text) ? "oro" : "normal") as Tipo,
      })),
    );
  }, [palabras, doradas, rojas]);

  // ventana de cada frase: desde (inicio - anticipo) hasta que empieza la siguiente
  const ventanas = frases.map((f, i) => {
    const inicio = f[0].startMs - SUB_FLUIDOS.anticipo;
    const finDicha = f[f.length - 1].endMs;
    const siguiente = frases[i + 1];
    const sig = siguiente ? siguiente[0].startMs - SUB_FLUIDOS.anticipo : undefined;
    const msSalida = (SUB_FLUIDOS.salida / 30) * 1000;
    // la que sale termina de irse justo cuando entra la siguiente (nunca dos frases a la vez)
    let fin = sig !== undefined ? sig - msSalida : finDicha + 700;
    if (sig !== undefined && sig - finDicha > SUB_FLUIDOS.pausaLarga) fin = finDicha + 500;
    return { inicio, fin: Math.min(fin, hasta) };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {frases.map((f, i) => {
        const { inicio, fin } = ventanas[i];
        const fIni = (inicio / 1000) * fps;
        const fFin = (fin / 1000) * fps;
        if (frame < fIni - 1 || frame > fFin + SUB_FLUIDOS.salida) return null;
        const entra = inicio <= 0 ? 1 : interpolate(frame, [fIni, fIni + SUB_FLUIDOS.entrada], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        const sale = interpolate(frame, [fFin, fFin + SUB_FLUIDOS.salida], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
        const opacidad = entra * (1 - sale);
        const y = (1 - entra) * 18 - sale * 14;
        const blur = (1 - entra) * 6 + sale * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: SUB_FLUIDOS.margenLateral,
              right: SUB_FLUIDOS.margenLateral,
              top: ALTO * centroY,
              transform: `translateY(calc(-50% + ${y}px))`,
              opacity: opacidad,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
              textAlign: "center",
              fontFamily: FUENTES.editorial,
              fontWeight: 500,
              fontSize: tamaño,
              lineHeight: 1.18,
              letterSpacing: "-0.01em",
              color: COLORES.blanco,
              textShadow: SUB_FLUIDOS.sombra,
            }}
          >
            {f.map((p, j) => {
              const dicha = ms >= p.startMs - 40 || inicio <= 0;
              const actual = ms >= p.startMs - 40 && ms < p.endMs + 60;
              const brillo = dicha ? 1 : 0.5;
              if (p.tipo === "normal") {
                return (
                  <span key={j} style={{ display: "inline-block", margin: "0 0.17em", opacity: brillo, transform: `scale(${actual ? 1.04 : 1})` }}>
                    {p.text}
                  </span>
                );
              }
              // manuscrita: se "escribe" cuando se dice; antes se ve tenue
              const fp = frame - (p.startMs / 1000) * fps;
              const escrito = inicio <= 0 ? 100 : interpolate(fp, [0, 9], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
              return (
                <span key={j} style={{ position: "relative", display: "inline-block", margin: "0 0.1em 0 0.12em", padding: "0 0.1em", fontFamily: FUENTES.manuscrita, fontWeight: 400, fontSize: tamaño * SUB_FLUIDOS.escalaManuscrita, lineHeight: 0.8, verticalAlign: "-0.06em", color: p.tipo === "rojo" ? COLORES.rojoTexto : COLORES.dorado }}>
                  <span style={{ opacity: 0.3 }}>{p.text}</span>
                  <span style={{ position: "absolute", left: "0.1em", top: 0, clipPath: `inset(-30% ${100 - escrito}% -30% -10%)` }}>{p.text}</span>
                </span>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
