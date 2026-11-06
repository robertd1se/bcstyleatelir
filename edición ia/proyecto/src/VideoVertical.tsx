import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, OffthreadVideo, staticFile } from "remotion";
import { Subtitulos } from "./Subtitulos";

export type VideoVerticalProps = {
  /** Ruta dentro de public/ (la llena scripts/renderizar.mjs) */
  video: string | null;
  duracionSeg: number;
  captions: Caption[];
  musica: string | null;
  volumenMusica: number;
};

export const VideoVertical: React.FC<VideoVerticalProps> = ({ video, captions, musica, volumenMusica }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {video ? (
        // objectFit "cover": un video horizontal se recorta al centro para llenar 1080x1920
        <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      {captions.length > 0 ? <Subtitulos captions={captions} /> : null}
      {musica ? <Audio src={staticFile(musica)} volume={volumenMusica} loop /> : null}
    </AbsoluteFill>
  );
};
