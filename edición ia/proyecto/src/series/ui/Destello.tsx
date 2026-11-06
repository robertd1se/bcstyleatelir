import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Transición de destello entre secciones: una luz cálida barre la pantalla en diagonal (12 cuadros).
export const FRAMES_DESTELLO = 12;
export const Destello: React.FC = () => {
  const frame = useCurrentFrame();
  const avance = interpolate(frame, [0, FRAMES_DESTELLO], [-60, 160]);
  const intensidad = interpolate(frame, [0, FRAMES_DESTELLO / 2, FRAMES_DESTELLO], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${avance - 40}%, rgba(255,226,200,${0.85 * intensidad}) ${avance}%, transparent ${avance + 40}%)` }} />
      <AbsoluteFill style={{ background: `rgba(255,240,230,${0.25 * intensidad})` }} />
    </AbsoluteFill>
  );
};
