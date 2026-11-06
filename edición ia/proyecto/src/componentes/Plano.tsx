import { AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Un plano de una grabación: recorta desde `desde` (segundos), sin audio propio
// (el audio va aparte para que no salte en los cortes) y con zoom lento de 100 a 108 %.
export const Plano: React.FC<{ src: string; desde: number; zoom?: boolean }> = ({ src, desde, zoom = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const escala = zoom ? interpolate(frame, [0, durationInFrames], [1, 1.08]) : 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(src)}
        trimBefore={Math.round(desde * fps)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${escala})` }}
      />
    </AbsoluteFill>
  );
};
