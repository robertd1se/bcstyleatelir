// Piezas del formato "Capítulos premium" (video 5 razones de RXT).
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHO, COLORES, FUENTES, ZONA_SEGURA } from "../estilo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Fondo oscuro con luces de marca grandes y desenfocadas que se mueven lento. */
export const FondoLuces: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const luz = (x: number, y: number, r: number, c: string) => (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c, filter: "blur(120px)", opacity: 0.55 }} />
  );
  return (
    <AbsoluteFill style={{ background: "#07080d", overflow: "hidden" }}>
      {luz(200 + 80 * Math.sin(t * 0.4), 500 + 60 * Math.cos(t * 0.3), 420, COLORES.rojo)}
      {luz(900 + 60 * Math.cos(t * 0.35), 1300 + 80 * Math.sin(t * 0.25), 460, COLORES.azul)}
      {luz(620 + 90 * Math.sin(t * 0.2 + 2), 950 + 50 * Math.cos(t * 0.45), 300, COLORES.dorado)}
      <AbsoluteFill style={{ background: "rgba(7,8,13,0.35)" }} />
    </AbsoluteFill>
  );
};

/** Encabezado liviano: logo + RXT a la izquierda, rótulo a la derecha y línea de avance. */
export const EncabezadoRazones: React.FC<{ derecha: string }> = ({ derecha }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const avance = interpolate(frame, [0, durationInFrames - 1], [0, 100]);
  return (
    <div style={{ position: "absolute", top: ZONA_SEGURA.arriba + 6, left: 110, right: 110 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile("marca/logo-x-blanco.png")} style={{ width: 34, height: 36 }} />
          <div style={{ fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 26, letterSpacing: "0.12em", color: COLORES.blanco }}>RXT</div>
        </div>
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 22, letterSpacing: "0.25em", color: "#ffffffb0" }}>{derecha}</div>
      </div>
      <div style={{ marginTop: 16, height: 4, borderRadius: 2, background: "#ffffff1f", overflow: "hidden" }}>
        <div style={{ width: `${avance}%`, height: "100%", background: COLORES.rojo, boxShadow: `0 0 10px ${COLORES.rojo}` }} />
      </div>
    </div>
  );
};

/** Insignia numerada de vidrio con brillo (promesa "5 razones" y progreso). */
export const Insignia: React.FC<{ n: number; x: number; y: number; desde: number; estado?: "pendiente" | "actual" | "hecha"; tamaño?: number }> = ({ n, x, y, desde, estado = "pendiente", tamaño = 92 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, durationInFrames: 10, config: { damping: 10 } });
  if (frame < desde) return null;
  const color = estado === "hecha" ? COLORES.dorado : estado === "actual" ? COLORES.rojo : "#ffffff";
  const flota = 6 * Math.sin((frame + n * 9) / 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x - tamaño / 2,
        top: y - tamaño / 2 + flota,
        width: tamaño,
        height: tamaño,
        transform: `rotate(45deg) scale(${interpolate(s, [0, 1], [0.2, 1])})`,
        borderRadius: tamaño * 0.22,
        border: `3px solid ${color}`,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        boxShadow: `0 0 ${estado === "pendiente" ? 18 : 34}px ${color}88, inset 0 0 18px ${color}33`,
        opacity: s,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ transform: "rotate(-45deg)", fontFamily: FUENTES.editorial, fontWeight: 600, fontSize: tamaño * 0.46, color: COLORES.blanco, textShadow: `0 0 12px ${color}` }}>
        {estado === "hecha" ? "✓" : n}
      </div>
    </div>
  );
};

const NUMEROS = ["uno", "dos", "tres", "cuatro", "cinco"];
/** Tarjeta de capítulo a pantalla completa: "Razón *uno*" con una onda roja que sube. */
export const TarjetaCapitulo: React.FC<{ n: number; duracion: number }> = ({ n, duracion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = interpolate(frame, [0, 4], [0, 1], clamp);
  const sale = interpolate(frame, [duracion - 5, duracion], [1, 0], clamp);
  const sube = spring({ frame, fps, durationInFrames: 12, config: { damping: 16 } });
  const escrito = interpolate(frame, [3, 13], [0, 100], { ...clamp, easing: Easing.out(Easing.quad) });
  const ola = (fase: number, alto: number) => {
    let d = `M0 ${alto}`;
    for (let x = 0; x <= ANCHO; x += 20) d += ` L${x} ${alto + 26 * Math.sin(x / 140 + frame / 5 + fase)}`;
    return d + ` L${ANCHO} 1920 L0 1920 Z`;
  };
  const altoOla = interpolate(sube, [0, 1], [1920, 1380]);
  return (
    <AbsoluteFill style={{ background: "#0b0c12", opacity: Math.min(entra, sale) }}>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={ola(1.5, altoOla + 30)} fill={COLORES.rojo} opacity={0.35} />
        <path d={ola(0, altoOla)} fill={COLORES.rojo} />
      </svg>
      <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", transform: `translateY(${(1 - sube) * 40}px)` }}>
        <span style={{ fontFamily: FUENTES.editorial, fontStyle: "italic", fontWeight: 500, fontSize: 150, color: COLORES.blanco }}>Razón </span>
        <span style={{ display: "inline-block", fontFamily: FUENTES.manuscrita, fontSize: 230, color: COLORES.dorado, clipPath: `inset(-30% ${100 - escrito}% -30% -10%)`, verticalAlign: "-0.08em" }}>
          {NUMEROS[n - 1]}
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** Tarjeta de vidrio que contiene la ilustración de cada razón. */
export const TarjetaVidrio: React.FC<{ x: number; y: number; w: number; h: number; duracion: number; children: React.ReactNode; etiqueta?: string }> = ({ x, y, w, h, duracion, children, etiqueta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, durationInFrames: 14, config: { damping: 15 } });
  const sale = interpolate(frame, [duracion - 6, duracion], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 40,
        overflow: "hidden",
        background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
        backdropFilter: "blur(18px)",
        border: "2px solid rgba(255,255,255,0.16)",
        boxShadow: "0 30px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
        opacity: Math.min(s, sale),
        transform: `translateY(${(1 - s) * 60}px) scale(${0.95 + 0.05 * s})`,
      }}
    >
      {children}
      {etiqueta ? (
        <div style={{ position: "absolute", top: 26, left: 30, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 22, letterSpacing: "0.22em", color: "#ffffffb8", textTransform: "uppercase" }}>
          <span style={{ color: COLORES.rojo }}>●</span> {etiqueta}
        </div>
      ) : null}
    </div>
  );
};

/** Tarjeta de perfil con botón "Seguir" que un dedo toca y pasa a "Siguiendo". */
export const TarjetaSeguir: React.FC<{ usuario: string; nombre: string; y: number }> = ({ usuario, nombre, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, durationInFrames: 12, config: { damping: 14 } });
  const toque = 24;
  const siguiendo = frame >= toque;
  const dedo = interpolate(frame, [10, toque, toque + 6], [110, 0, 14], clamp);
  return (
    <div style={{ position: "absolute", left: 130, right: 170, top: y, opacity: s, transform: `translateY(${(1 - s) * 50}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 28px", borderRadius: 30, background: "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))", backdropFilter: "blur(16px)", border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 24px 70px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 92, height: 92, borderRadius: "50%", background: "#0a0a0a", border: `3px solid ${COLORES.rojo}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Img src={staticFile("marca/logo-x-blanco.png")} style={{ width: 46, height: 49 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 30, color: COLORES.blanco }}>{usuario}</div>
          <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 500, fontSize: 22, color: "#ffffff99", marginTop: 4 }}>{nombre}</div>
        </div>
        <div style={{ position: "relative", padding: "14px 30px", borderRadius: 14, background: siguiendo ? "#ffffff22" : COLORES.azul, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 26, color: COLORES.blanco, transform: `scale(${siguiendo && frame < toque + 6 ? 0.92 : 1})` }}>
          {siguiendo ? "Siguiendo" : "Seguir"}
          <svg width={64} height={64} viewBox="0 0 70 70" style={{ position: "absolute", left: 40, top: 26 + dedo, opacity: interpolate(frame, [8, 12, toque + 12, toque + 18], [0, 1, 1, 0], clamp) }}>
            <path d="M18 14 C18 8 26 8 26 14 L26 34 L40 36 C48 38 50 44 48 52 L44 64 L20 64 L8 42 C6 38 12 34 16 38 L18 40 Z" fill="#fff" stroke="#0b0d14" strokeWidth={3} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
