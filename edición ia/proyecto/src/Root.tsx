import { CalculateMetadataFunction, Composition } from "remotion";
import { FRAMES_CIERRE } from "./componentes/CierreLogo";
import { ALTO, ANCHO, FPS } from "./estilo";
import { MuestraEstilo } from "./MuestraEstilo";
import { VideoVertical, VideoVerticalProps } from "./VideoVertical";

const calculateMetadata: CalculateMetadataFunction<VideoVerticalProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(props.duracionSeg * FPS) + (props.conCierre ? FRAMES_CIERRE : 0)),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoVertical"
        component={VideoVertical}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        durationInFrames={FPS * 5}
        calculateMetadata={calculateMetadata}
        defaultProps={{
          video: null,
          duracionSeg: 5,
          captions: [],
          palabrasClave: [],
          musica: null,
          volumenMusica: 0.12,
          conCierre: true,
          llamada: "Registrate",
        }}
      />
      <Composition id="MuestraEstilo" component={MuestraEstilo} fps={FPS} width={ANCHO} height={ALTO} durationInFrames={300} />
    </>
  );
};
