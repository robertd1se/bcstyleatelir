import { CalculateMetadataFunction, Composition } from "remotion";
import { FRAMES_CIERRE } from "./componentes/CierreLogo";
import { ALTO, ANCHO, FPS } from "./estilo";
import { MuestraEstilo } from "./MuestraEstilo";
import { DURACION_RXT01, Rxt01 } from "./series/Rxt01";
import { DURACION_RXT02, Rxt02 } from "./series2d/Rxt02";
import { DURACION_ELEGIDO, Elegido } from "./ediciones/Elegido";
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
      <Composition id="Elegido" component={Elegido} fps={FPS} width={ANCHO} height={ALTO} durationInFrames={DURACION_ELEGIDO} />
      <Composition id="Rxt01" component={Rxt01} fps={FPS} width={ANCHO} height={ALTO} durationInFrames={DURACION_RXT01} />
      <Composition id="Rxt02" component={Rxt02} fps={FPS} width={ANCHO} height={ALTO} durationInFrames={DURACION_RXT02} />
      <Composition id="MuestraEstilo" component={MuestraEstilo} fps={FPS} width={ANCHO} height={ALTO} durationInFrames={300} />
    </>
  );
};
