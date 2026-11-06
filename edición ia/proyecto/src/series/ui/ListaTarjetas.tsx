import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../../estilo";

export type Item = { icono: string; titulo: string; detalle?: string; desdeFrame: number; color?: string; tachado?: boolean };

// Lista de tarjetas apiladas: cada una entra desde abajo cuando se dice (frames relativos a la Sequence).
export const ListaTarjetas: React.FC<{ etiqueta: string; items: Item[]; durationInFrames: number; top?: number }> = ({
  etiqueta,
  items,
  durationInFrames,
  top = 1180,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sale = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const etiquetaEntra = spring({ frame, fps, durationInFrames: 10, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", top, left: 90, right: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: sale }}>
      <div
        style={{
          padding: "8px 22px",
          borderRadius: 30,
          border: `2px solid ${COLORES.rojo}`,
          fontFamily: FUENTES.textoChico,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "0.22em",
          color: COLORES.blanco,
          textTransform: "uppercase",
          background: "rgba(204,19,16,0.18)",
          opacity: etiquetaEntra,
          marginBottom: 6,
        }}
      >
        {etiqueta}
      </div>
      {items.map((it) => {
        const s = spring({ frame: frame - it.desdeFrame, fps, durationInFrames: 10, config: { damping: 15 } });
        if (frame < it.desdeFrame) return null;
        const color = it.color ?? COLORES.rojo;
        return (
          <div
            key={it.titulo}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "20px 26px",
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(30,32,44,0.78), rgba(12,13,19,0.86))",
              backdropFilter: "blur(14px)",
              border: `2px solid ${color}55`,
              boxShadow: `0 18px 50px rgba(0,0,0,0.55), inset 0 0 30px ${color}14`,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
            }}
          >
            <div style={{ width: 70, height: 70, flexShrink: 0, borderRadius: 18, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 34, color: COLORES.blanco }}>
              {it.icono}
            </div>
            <div>
              <div style={{ position: "relative", fontFamily: FUENTES.editorial, fontWeight: 600, fontSize: 44, color: it.tachado ? "#ffffff80" : COLORES.blanco, lineHeight: 1.05 }}>
                {it.titulo}
                {it.tachado ? (
                  // línea roja que tacha el texto, de izquierda a derecha
                  <div style={{ position: "absolute", left: -4, top: "52%", height: 6, borderRadius: 3, background: COLORES.rojo, width: `${interpolate(frame - it.desdeFrame - 6, [0, 8], [0, 104], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%` }} />
                ) : null}
              </div>
              {it.detalle ? <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 500, fontSize: 26, color: "#ffffffb0", marginTop: 4 }}>{it.detalle}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
