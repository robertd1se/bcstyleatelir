import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../estilo";

// Plano de ejemplo (reemplaza a una grabación real en la muestra): luces de neón de marca
// moviéndose sobre un fondo oscuro, con zoom lento como si fuera cámara.
export const FondoDemo: React.FC<{ variante: number; etiqueta: string }> = ({ variante, etiqueta }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const t = frame / 30;
  const paletas = [
    [COLORES.rojo, COLORES.azul, "#1a1a1f"],
    [COLORES.azul, "#6b2bff", "#101018"],
    ["#ff2d55", COLORES.rojo, "#140d0d"],
    [COLORES.azul, COLORES.rojo, "#0d0f18"],
    ["#6b2bff", COLORES.azul, "#0f0c16"],
  ][variante % 5];
  const x1 = 30 + 20 * Math.sin(t * 1.3 + variante);
  const y1 = 35 + 15 * Math.cos(t * 0.9 + variante);
  const x2 = 70 + 18 * Math.cos(t * 1.1 + variante * 2);
  const y2 = 70 + 12 * Math.sin(t * 1.4 + variante);
  return (
    <AbsoluteFill style={{ backgroundColor: paletas[2], overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          background: `radial-gradient(circle at ${x1}% ${y1}%, ${paletas[0]}cc 0%, transparent 38%),
                       radial-gradient(circle at ${x2}% ${y2}%, ${paletas[1]}bb 0%, transparent 42%),
                       repeating-linear-gradient(${110 + variante * 25}deg, #ffffff08 0 2px, transparent 2px 90px)`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, #000000cc 100%)" }} />
      <div style={{ position: "absolute", top: 70, left: 60, fontFamily: FUENTES.textoChico, fontWeight: 500, fontSize: 24, color: "#ffffff66", letterSpacing: "0.2em" }}>
        {etiqueta}
      </div>
    </AbsoluteFill>
  );
};
