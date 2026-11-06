// Edición de grabaciones/copy_BE5F3685-CE9E-4E08-B460-9E7C10DBFD39.MOV
// Recorrido por el gym sin voz; textos tomados del cartel "RXT te ha ELEGIDO".
// Antes de renderizar hace falta la copia en H.264 (public/entrada no se sube a Git):
//   ffmpeg -i ../grabaciones/copy_BE5F3685-CE9E-4E08-B460-9E7C10DBFD39.MOV -c:v libx264 -crf 16 \
//     -pix_fmt yuv420p -r 30 -c:a aac public/entrada/elegido.mp4
import { Caption } from "@remotion/captions";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { CierreLogo, FRAMES_CIERRE } from "../componentes/CierreLogo";
import { Gancho } from "../componentes/Gancho";
import { latigo, tiempoLatigo } from "../componentes/Latigo";
import { Plano } from "../componentes/Plano";
import { Subtitulos } from "../componentes/Subtitulos";
import { FPS, SUBTITULOS, TRANSICION_LATIGO } from "../estilo";

const VIDEO = "entrada/elegido.mp4";
const L = TRANSICION_LATIGO.frames;
const f = (seg: number) => Math.round(seg * FPS);

// Planos que se conservan (segundos del original). El resto se corta.
const PLANOS = [
  { desde: 0.25, hasta: 2.5, entra: "corte" }, // sala con gente entrenando
  { desde: 2.75, hasta: 4.25, entra: "latigo" }, // puerta a la sala de neón
  { desde: 4.5, hasta: 6.0, entra: "corte" }, // sala de neón
  { desde: 6.5, hasta: 8.5, entra: "latigo" }, // energy bar
  { desde: 9.75, hasta: 12.5, entra: "corte" }, // acercamiento al cartel
] as const;

const framesPlanos = PLANOS.reduce((t, p) => t + f(p.hasta - p.desde) - (p.entra === "latigo" ? L : 0), 0);
export const DURACION_ELEGIDO = framesPlanos + FRAMES_CIERRE;

// Inicio de cada plano en la línea de tiempo final (para ubicar sonidos)
const inicios: number[] = [];
PLANOS.reduce((t, p) => {
  const inicio = t - (p.entra === "latigo" ? L : 0);
  inicios.push(inicio);
  return inicio + f(p.hasta - p.desde);
}, 0);

const w = (text: string, desde: number, hasta: number): Caption => ({
  text,
  startMs: desde,
  endMs: hasta,
  timestampMs: null,
  confidence: 1,
});

// Textos del cartel, con ortografía revisada. Las pausas de >350 ms separan los grupos.
const TEXTOS: Caption[] = [
  w("Una", 2150, 2350),
  w("vez", 2350, 2650),
  w("al", 3050, 3200),
  w("año.", 3200, 3500),
  w("Las", 3650, 3850),
  w("puertas", 3850, 4250),
  w("se", 4650, 4800),
  w("abren.", 4800, 5150),
  w("Noche", 5300, 5550),
  w("de", 5550, 5700),
  w("terror,", 5700, 6150),
  w("retos", 6550, 6800),
  w("y", 6800, 6900),
  w("celebración.", 6900, 7450),
];

// Sobre el cartel: van más arriba para no tapar "ELEGIDO"
const TEXTOS_CARTEL: Caption[] = [w("¿Eres", 7850, 8250), w("digno?", 8250, 9300)];

export const Elegido: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {PLANOS.flatMap((p, i) => {
          const elementos = [];
          if (p.entra === "latigo") {
            elementos.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={latigo(i % 4 === 1 ? "izquierda" : "derecha")}
                timing={tiempoLatigo}
              />,
            );
          }
          elementos.push(
            <TransitionSeries.Sequence key={`p${i}`} durationInFrames={f(p.hasta - p.desde)}>
              <Plano src={VIDEO} desde={p.desde} />
            </TransitionSeries.Sequence>,
          );
          return elementos;
        })}
        <TransitionSeries.Sequence durationInFrames={FRAMES_CIERRE}>
          <CierreLogo llamada="Training Club" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence durationInFrames={60}>
        <Gancho linea1="¿Te atreves" linea2="a entrar?" />
      </Sequence>
      <Sequence durationInFrames={framesPlanos}>
        <Subtitulos captions={TEXTOS} palabrasClave={["abren", "terror"]} />
        <Subtitulos captions={TEXTOS_CARTEL} palabrasClave={["digno"]} centroY={SUBTITULOS.centroYAlternativo} />
      </Sequence>

      {/* Música original del video, continua (sin saltos en los cortes), con salida de 1,5 s */}
      <Audio
        src={staticFile(VIDEO)}
        trimBefore={f(PLANOS[0].desde)}
        volume={(fr) =>
          0.6 * interpolate(fr, [durationInFrames - f(1.5), durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        }
      />
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.9} />
      {PLANOS.map((p, i) =>
        p.entra === "latigo" ? (
          <Sequence key={i} from={inicios[i] - 2}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.9} />
          </Sequence>
        ) : null,
      )}
      <Sequence from={framesPlanos + 12}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
