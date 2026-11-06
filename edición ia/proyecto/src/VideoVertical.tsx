import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { CierreLogo, FRAMES_CIERRE } from "./componentes/CierreLogo";
import { Subtitulos } from "./componentes/Subtitulos";

export type VideoVerticalProps = {
  /** Ruta dentro de public/ (la llena scripts/renderizar.mjs) */
  video: string | null;
  duracionSeg: number;
  captions: Caption[];
  palabrasClave: string[];
  musica: string | null;
  volumenMusica: number;
  conCierre: boolean;
  llamada: string;
};

export const VideoVertical: React.FC<VideoVerticalProps> = ({
  video,
  duracionSeg,
  captions,
  palabrasClave,
  musica,
  volumenMusica,
  conCierre,
  llamada,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const framesVideo = Math.round(duracionSeg * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={framesVideo}>
        {video ? (
          // objectFit "cover": un video horizontal se recorta al centro para llenar 1080x1920
          <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
        {captions.length > 0 ? <Subtitulos captions={captions} palabrasClave={palabrasClave} /> : null}
      </Sequence>
      {conCierre ? (
        <Sequence from={framesVideo} durationInFrames={FRAMES_CIERRE}>
          <CierreLogo llamada={llamada} />
        </Sequence>
      ) : null}
      {musica ? (
        <Audio
          src={staticFile(musica)}
          loop
          // entra en 1 s y sale en los últimos 1,5 s
          volume={(f) =>
            volumenMusica *
            interpolate(f, [0, fps, durationInFrames - fps * 1.5, durationInFrames], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
