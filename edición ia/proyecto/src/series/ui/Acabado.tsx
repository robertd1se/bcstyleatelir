import { AbsoluteFill, useCurrentFrame } from "remotion";

// Terminación de "cine": viñeta suave y grano fino que cambia en cada cuadro.
export const Acabado: React.FC<{ grano?: number }> = ({ grano = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 55%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ opacity: grano, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grano">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 100} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grano)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
