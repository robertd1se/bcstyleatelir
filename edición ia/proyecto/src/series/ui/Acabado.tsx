import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";

// Terminación de "cine": viñeta suave y grano fino. El grano es una textura fija más grande que el cuadro
// (public/acabado/grano.png, 1592x2432) que se corre al azar en cada cuadro: se ve vivo y es liviano.
export const Acabado: React.FC<{ grano?: number }> = ({ grano = 0.06 }) => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`gx${frame}`) * 512);
  const y = Math.floor(random(`gy${frame}`) * 512);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 55%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ opacity: grano, mixBlendMode: "overlay" }}>
        <Img src={staticFile("acabado/grano.png")} style={{ position: "absolute", width: 1592, height: 2432, transform: `translate(${-x}px, ${-y}px)` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
