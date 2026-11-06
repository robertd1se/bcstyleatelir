// Piezas gráficas del formato explicativo 2D (inspirado en la ref. 7, con la marca RXT).
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../estilo";

export const TINTA = "#0b0d14";
export const PANEL = "#121828";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Fondo azul noche con resplandor central y viñeta. */
export const Fondo2D: React.FC = () => {
  const frame = useCurrentFrame();
  const d = 6 * Math.sin(frame / 40);
  return (
    <AbsoluteFill style={{ background: "#070a12" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at ${50 + d}% 48%, #17223f 0%, #0b1020 55%, #06080e 100%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 15% 85%, rgba(204,19,16,0.12), transparent 40%), radial-gradient(circle at 90% 20%, rgba(31,79,255,0.16), transparent 45%)" }} />
    </AbsoluteFill>
  );
};

/** Entrada de escena: sube y aparece; sale con fundido corto. */
export const useEntrada = (duracion: number, retraso = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - retraso, fps, durationInFrames: 12, config: { damping: 15 } });
  const sale = interpolate(frame, [duracion - 5, duracion], [1, 0], clamp);
  return { s, opacidad: Math.min(s, sale), y: (1 - s) * 40, escala: 0.94 + 0.06 * s };
};

/** Etiqueta tipo pastilla (Inter en mayúsculas espaciadas). */
export const Pastilla: React.FC<{ texto: string; color?: string; desde?: number; estilo?: React.CSSProperties; grande?: boolean }> = ({ texto, color = COLORES.azul, desde = 0, estilo, grande }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, durationInFrames: 9, config: { damping: 11 } });
  if (frame < desde) return null;
  return (
    <div
      style={{
        display: "inline-block",
        padding: grande ? "12px 26px" : "8px 18px",
        borderRadius: 10,
        background: color,
        border: `3px solid ${TINTA}`,
        boxShadow: `0 6px 0 ${TINTA}`,
        fontFamily: FUENTES.textoChico,
        fontWeight: 700,
        fontSize: grande ? 30 : 22,
        letterSpacing: "0.12em",
        color: COLORES.blanco,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`,
        opacity: s,
        ...estilo,
      }}
    >
      {texto}
    </div>
  );
};

/** Panel oscuro con borde, como una tarjeta de app. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; titulo?: string; children?: React.ReactNode; colorTitulo?: string }> = ({ x, y, w, h, titulo, children, colorTitulo = COLORES.azul }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 24, background: PANEL, border: `4px solid ${TINTA}`, boxShadow: `0 10px 0 ${TINTA}, inset 0 0 0 2px #ffffff10`, overflow: "hidden" }}>
    {titulo ? (
      <div style={{ position: "absolute", top: 18, left: 22, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: colorTitulo, textTransform: "uppercase" }}>{titulo}</div>
    ) : null}
    {children}
  </div>
);

/** Línea de progreso que se dibuja (SVG). */
export const GraficoLinea: React.FC<{ w: number; h: number; puntos: number[]; color?: string; desde?: number; duracion?: number; zigzag?: number[] }> = ({ w, h, puntos, color = "#3fd17a", desde = 0, duracion = 20, zigzag }) => {
  const frame = useCurrentFrame();
  const avance = interpolate(frame - desde, [0, duracion], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const camino = (ps: number[]) => ps.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (ps.length - 1)) * w} ${h - v * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="#ffffff12" strokeWidth={2} />
      ))}
      <line x1={0} x2={w} y1={h} y2={h} stroke="#ffffff40" strokeWidth={3} />
      {zigzag ? <path d={camino(zigzag)} stroke={COLORES.rojoTexto} strokeWidth={8} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - avance} /> : null}
      <path d={camino(puntos)} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - avance} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      {avance > 0.98 ? <circle cx={w} cy={h - puntos[puntos.length - 1] * h} r={16} fill={color} stroke={TINTA} strokeWidth={5} /> : null}
    </svg>
  );
};

/** Barras que crecen de a una. */
export const Barras: React.FC<{ w: number; h: number; valores: number[]; desde?: number; etiquetas?: string[] }> = ({ w, h, valores, desde = 0, etiquetas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ancho = w / valores.length;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {valores.map((v, i) => {
        const s = spring({ frame: frame - desde - i * 4, fps, durationInFrames: 12, config: { damping: 13 } });
        const ultimo = i === valores.length - 1;
        return (
          <div key={i} style={{ position: "absolute", bottom: 0, left: i * ancho + ancho * 0.12, width: ancho * 0.76 }}>
            <div style={{ height: v * h * s, borderRadius: "10px 10px 0 0", background: ultimo ? COLORES.rojo : COLORES.azul, border: `4px solid ${TINTA}`, boxShadow: ultimo ? `0 0 24px ${COLORES.rojo}` : undefined }} />
            {etiquetas ? <div style={{ position: "absolute", bottom: -36, width: "100%", textAlign: "center", fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 18, color: "#ffffff90" }}>{etiquetas[i]}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

/** Sello rojo estampado (entra grande y golpea). */
export const Sello: React.FC<{ texto: string; desde: number; x: number; y: number; giro?: number; tamaño?: number }> = ({ texto, desde, x, y, giro = -10, tamaño = 64 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const s = spring({ frame: frame - desde, fps, durationInFrames: 8, config: { damping: 9, stiffness: 220 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${giro}deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`,
        opacity: Math.min(1, s * 1.5),
        padding: "10px 30px",
        border: `8px solid ${COLORES.rojoTexto}`,
        borderRadius: 14,
        fontFamily: FUENTES.titulos,
        fontWeight: 900,
        fontSize: tamaño,
        color: COLORES.rojoTexto,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: "rgba(12,6,8,0.55)",
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

/** Cruz roja que se dibuja encima de algo. */
export const Cruz: React.FC<{ desde: number; w: number; h: number }> = ({ desde, w, h }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame - desde, [0, 6], [0, 1], clamp);
  const b = interpolate(frame - desde, [4, 10], [0, 1], clamp);
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {[
        [0, 0, w, h, a],
        [w, 0, 0, h, b],
      ].map(([x1, y1, x2, y2, v], i) => (
        <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * v} y2={y1 + (y2 - y1) * v} stroke={COLORES.rojoTexto} strokeWidth={22} strokeLinecap="round" style={{ filter: `drop-shadow(0 6px 0 ${TINTA})` }} />
      ))}
    </svg>
  );
};

/** Diana con flecha que llega al centro. */
export const Diana: React.FC<{ desde: number; tamaño?: number }> = ({ desde, tamaño = 360 }) => {
  const frame = useCurrentFrame();
  const llega = interpolate(frame - desde, [6, 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const vibra = frame - desde > 16 ? 4 * Math.sin((frame - desde) * 2.2) * Math.exp(-(frame - desde - 16) / 6) : 0;
  const r = tamaño / 2;
  return (
    <svg width={tamaño} height={tamaño} style={{ overflow: "visible" }}>
      {[1, 0.75, 0.5, 0.25].map((f, i) => (
        <circle key={f} cx={r} cy={r} r={r * f} fill={i % 2 === 0 ? COLORES.rojo : "#f3efe6"} stroke={TINTA} strokeWidth={6} />
      ))}
      <g transform={`translate(${r + (1 - llega) * 420} ${r - (1 - llega) * 300}) rotate(${-35 + vibra})`}>
        <line x1={0} y1={0} x2={170} y2={0} stroke={TINTA} strokeWidth={14} strokeLinecap="round" />
        <line x1={0} y1={0} x2={170} y2={0} stroke={COLORES.dorado} strokeWidth={7} strokeLinecap="round" />
        <path d="M150 -18 L185 0 L150 18 Z" fill={COLORES.azul} stroke={TINTA} strokeWidth={5} />
      </g>
    </svg>
  );
};

/** Lista con casillas que se van tildando. */
export const Lista: React.FC<{ items: string[]; desde: number; paso?: number; w: number; tachar?: boolean }> = ({ items, desde, paso = 4, w }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: w, display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((it, i) => {
        const hecho = frame >= desde + i * paso;
        return (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 18px", borderRadius: 12, background: "#ffffff0d" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, border: `3px solid ${hecho ? "#3fd17a" : "#ffffff40"}`, background: hecho ? "#3fd17a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: TINTA, fontSize: 24, fontFamily: FUENTES.textoChico }}>
              {hecho ? "✓" : ""}
            </div>
            <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 26, color: "#ffffffd0", letterSpacing: "0.04em", textTransform: "uppercase" }}>{it}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Transición: raya de luz azul-blanca que cruza en diagonal (10 cuadros). */
export const FRAMES_RAYO = 10;
export const Rayo: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, FRAMES_RAYO], [-30, 130], clamp);
  const i = interpolate(frame, [0, FRAMES_RAYO / 2, FRAMES_RAYO], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, transparent ${p - 8}%, rgba(120,170,255,${0.5 * i}) ${p - 2}%, rgba(255,255,255,${0.95 * i}) ${p}%, rgba(120,170,255,${0.5 * i}) ${p + 2}%, transparent ${p + 8}%)` }} />
      <AbsoluteFill style={{ background: `rgba(90,140,255,${0.12 * i})` }} />
    </AbsoluteFill>
  );
};
