import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, COLORES, FUENTES } from "../../estilo";

// Barra de progreso: TÍTULO  ① ② ③ ④ — el actual en rojo, los terminados en azul con ✓.
export const Progreso: React.FC<{ titulo: string; total: number; actual: number; inicioActualFrame: number; etiqueta?: string }> = ({
  titulo,
  total,
  actual,
  inicioActualFrame,
  etiqueta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - inicioActualFrame, fps, durationInFrames: 8, config: { damping: 10 } });
  return (
    <div style={{ position: "absolute", top: ALTO * 0.325, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", color: "#ffffffaa", marginRight: 10 }}>
          {titulo}
        </span>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const hecho = n < actual;
          const ahora = n === actual;
          return (
            <div
              key={n}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FUENTES.titulos,
                fontWeight: 900,
                fontSize: 24,
                color: COLORES.blanco,
                background: hecho ? COLORES.azul : ahora ? COLORES.rojo : "transparent",
                border: hecho || ahora ? "none" : "3px solid #ffffff55",
                transform: ahora ? `scale(${interpolate(pop, [0, 1], [1.5, 1.12])})` : undefined,
                boxShadow: ahora ? `0 0 24px ${COLORES.rojo}` : undefined,
              }}
            >
              {hecho ? "✓" : n}
            </div>
          );
        })}
      </div>
      {etiqueta ? (
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 26, letterSpacing: "0.18em", color: COLORES.blanco, textTransform: "uppercase", opacity: interpolate(frame - inicioActualFrame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <span style={{ color: COLORES.rojo }}>●</span> {etiqueta}
        </div>
      ) : null}
    </div>
  );
};
