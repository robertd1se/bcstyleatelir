import { Caption } from "@remotion/captions";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CierreLogo } from "./componentes/CierreLogo";
import { FondoDemo } from "./componentes/FondoDemo";
import { Gancho } from "./componentes/Gancho";
import { latigo, tiempoLatigo } from "./componentes/Latigo";
import { Subtitulos } from "./componentes/Subtitulos";
import { Zocalo } from "./componentes/Zocalo";
import { TRANSICION_LATIGO } from "./estilo";

// Muestra de 10 s (300 cuadros) del estilo. Los fondos son planos de ejemplo:
// con grabaciones reales se reemplazan por <OffthreadVideo>.

const palabra = (text: string, desde: number, hasta: number): Caption => ({
  text,
  startMs: desde,
  endMs: hasta,
  timestampMs: null,
  confidence: 1,
});

const CAPTIONS: Caption[] = [
  palabra("El", 2100, 2280),
  palabra("problema", 2280, 2750),
  palabra("no", 2900, 3050),
  palabra("es", 3050, 3200),
  palabra("el", 3200, 3330),
  palabra("esfuerzo.", 3330, 3950),
  palabra("8", 6250, 6550),
  palabra("semanas.", 6550, 7100),
  palabra("Tu", 7300, 7450),
  palabra("mejor", 7450, 7750),
  palabra("versión.", 7750, 8000),
];

// Línea de tiempo (las transiciones superponen planos, por eso se restan):
// plano1 0-28 | plano2 28-60 | plano3 60-126 | látigo 120-126 | plano4 120-186 | látigo 180-186 | plano5 180-240 | cierre 240-300
const L = TRANSICION_LATIGO.frames;
const LATIGO_1 = 126 - L;
const LATIGO_2 = 186 - L;

export const MuestraEstilo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {/* Gancho: 2 cortes en los primeros 2 s */}
        <TransitionSeries.Sequence durationInFrames={28}>
          <FondoDemo variante={0} etiqueta="PLANO 1" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={32}>
          <FondoDemo variante={1} etiqueta="PLANO 2" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={66}>
          <FondoDemo variante={2} etiqueta="PLANO 3" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={latigo("izquierda")} timing={tiempoLatigo} />
        <TransitionSeries.Sequence durationInFrames={66}>
          <FondoDemo variante={3} etiqueta="PLANO 4" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={latigo("derecha")} timing={tiempoLatigo} />
        <TransitionSeries.Sequence durationInFrames={60}>
          <FondoDemo variante={4} etiqueta="PLANO 5" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={60}>
          <CierreLogo llamada="Registrate" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence durationInFrames={60}>
        <Gancho linea1="¿Entrenás" linea2="sin plan?" />
      </Sequence>
      <Sequence from={126} durationInFrames={54}>
        <Zocalo nombre="Tu nombre" rol="Coach" frase="Hoy no hay excusas. Bueno, una." />
      </Sequence>
      <Sequence durationInFrames={240}>
        <Subtitulos captions={CAPTIONS} palabrasClave={["problema", "8"]} />
      </Sequence>

      {/* Efectos de sonido: golpe en el gancho, whoosh en cada látigo, golpe en el logo */}
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.7} />
      <Sequence from={LATIGO_1 - 2}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={LATIGO_2 - 2}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={240 + 12}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
