import { CalculateMetadataFunction, Composition } from "remotion";
import { VideoVertical, VideoVerticalProps } from "./VideoVertical";

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<VideoVerticalProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(props.duracionSeg * FPS)),
});

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoVertical"
      component={VideoVertical}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={FPS * 5}
      calculateMetadata={calculateMetadata}
      defaultProps={{
        video: null,
        duracionSeg: 5,
        captions: [],
        musica: null,
        volumenMusica: 0.15,
      }}
    />
  );
};
