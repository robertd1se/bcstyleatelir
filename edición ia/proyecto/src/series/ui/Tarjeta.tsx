import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../../estilo";

// Tarjeta tipo app que sube desde abajo. Entra con un resorte y sale en 6 cuadros.
export const Tarjeta: React.FC<{ titulo: string; children: React.ReactNode; durationInFrames: number; bottom?: number }> = ({
  titulo,
  children,
  durationInFrames,
  bottom = 170,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, durationInFrames: 12, config: { damping: 16 } });
  const sale = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom,
        padding: "34px 38px",
        borderRadius: 34,
        background: "linear-gradient(135deg, rgba(30,32,44,0.78), rgba(12,13,19,0.86))",
        backdropFilter: "blur(14px)",
        border: "2px solid #ffffff1f",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        transform: `translateY(${interpolate(entra, [0, 1], [180, 0])}px)`,
        opacity: Math.min(entra, sale),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: COLORES.rojo, boxShadow: `0 0 12px ${COLORES.rojo}` }} />
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 26, letterSpacing: "0.22em", color: "#ffffffb0", textTransform: "uppercase" }}>{titulo}</div>
      </div>
      {children}
    </div>
  );
};

/** Chips que aparecen de a uno cuando se dice cada palabra. */
export const Chips: React.FC<{ items: { texto: string; desdeFrame: number }[]; tarjetaDesde: number }> = ({ items, tarjetaDesde }) => {
  const frame = useCurrentFrame() + tarjetaDesde;
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {items.map((it) => {
        const s = spring({ frame: frame - it.desdeFrame, fps, durationInFrames: 8, config: { damping: 12 } });
        const activo = frame >= it.desdeFrame;
        return (
          <div
            key={it.texto}
            style={{
              padding: "14px 26px",
              borderRadius: 40,
              fontFamily: FUENTES.editorial,
              fontWeight: 600,
              fontSize: 36,
              color: COLORES.blanco,
              background: activo ? COLORES.azul : "#ffffff12",
              opacity: activo ? 1 : 0.35,
              transform: `scale(${activo ? interpolate(s, [0, 1], [1.25, 1]) : 1})`,
            }}
          >
            {it.texto}
          </div>
        );
      })}
    </div>
  );
};
