import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../../estilo";

export type Item = { icono: string; titulo: string; detalle?: string; desdeFrame: number; color?: string };

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
              background: "rgba(16,17,24,0.9)",
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
              <div style={{ fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 40, color: COLORES.blanco, textTransform: "uppercase", lineHeight: 1.05 }}>{it.titulo}</div>
              {it.detalle ? <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 500, fontSize: 26, color: "#ffffffb0", marginTop: 4 }}>{it.detalle}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
