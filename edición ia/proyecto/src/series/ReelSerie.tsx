// Base común de los reels de la serie RXT: gimnasio 3D, encabezado, texto con recuadros, voz,
// música con ducking, destellos entre secciones, whooshes, acabado y cierre.
import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, ANCHO } from "../estilo";
import { Camara, Gimnasio3D, Marcador } from "./gym3d/Gimnasio3D";
import { interpolarClaves } from "./linea";
import { volumenMusica } from "./sonido";
import { Acabado } from "./ui/Acabado";
import { CierreSerie } from "./ui/CierreSerie";
import { Destello, FRAMES_DESTELLO } from "./ui/Destello";
import { Encabezado } from "./ui/Encabezado";
import { TextoCaja } from "./ui/TextoCaja";

export type Estado3D = { activas?: Record<string, number>; marcadores?: Marcador[]; coachResaltado?: number };
export type ClaveCamara = { frame: number } & Required<Camara>;

/** La primera oración (gancho) se ve entera desde el cuadro 0. */
export const prepararPalabras = (crudo: Caption[]) => {
  const finGancho = crudo.findIndex((p) => /[?.!]$/.test(p.text));
  return crudo.map((p, i) => (i <= finGancho ? { ...p, startMs: 0 } : p));
};

export const ReelSerie: React.FC<{
  parte: number;
  total?: number;
  palabras: Caption[];
  carpeta: string; // public/series/<carpeta>/voz.wav y musica-generada/<carpeta>.wav
  camara: ClaveCamara[];
  estado3D: (frame: number) => Estado3D;
  cajasRojas?: string[];
  cajasAzules?: string[];
  secciones: number[]; // cuadros donde empieza cada sección (destello + whoosh)
  inicioCierre: number;
  children?: React.ReactNode; // tarjetas y gráficos propios del reel
}> = ({ parte, total = 9, palabras, carpeta, camara, estado3D, cajasRojas, cajasAzules, secciones, inicioCierre, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const base = interpolarClaves(frame, camara, ["x", "z", "zoom", "giro"], 22);
  // deriva lenta: la cámara nunca queda quieta (y vuelve a 0 al final, para el loop)
  const ciclo = frame / durationInFrames;
  const cam = { ...base, giro: base.giro + 0.06 * Math.sin(ciclo * Math.PI * 2), zoom: base.zoom * (1 + 0.03 * Math.sin(ciclo * Math.PI * 4)) };
  const est = estado3D(frame);
  const whooshes = camara.slice(2).map((c) => c.frame - 13);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07080d" }}>
      {/* 3D con corrección de color */}
      <AbsoluteFill style={{ filter: "contrast(1.08) saturate(1.15) brightness(1.04)" }}>
        <Gimnasio3D ancho={ANCHO} alto={ALTO} t={frame / fps} cam={cam} activas={est.activas} marcadores={est.marcadores} coachResaltado={est.coachResaltado} />
      </AbsoluteFill>
      {/* desenfoque "miniatura" arriba y abajo */}
      <AbsoluteFill style={{ backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 30%, transparent 72%, #000 100%)", maskImage: "linear-gradient(180deg, #000 0%, transparent 30%, transparent 72%, #000 100%)" }} />
      {/* degradado arriba para que el texto se lea */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #07080df0 0%, #07080dc4 20%, transparent 36%)" }} />
      {/* luz ambiente de marca en las esquinas */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 0% 100%, rgba(204,19,16,0.16), transparent 40%), radial-gradient(circle at 100% 30%, rgba(31,79,255,0.14), transparent 45%)", mixBlendMode: "screen" }} />

      <Encabezado parte={parte} total={total} />
      <Sequence durationInFrames={inicioCierre}>
        <TextoCaja palabras={palabras} cajasRojas={cajasRojas} cajasAzules={cajasAzules} />
      </Sequence>
      {children}
      <Sequence from={inicioCierre}>
        <CierreSerie parte={parte} total={total} />
      </Sequence>
      {[...secciones, inicioCierre].map((f) => (
        <Sequence key={f} from={f - FRAMES_DESTELLO / 2} durationInFrames={FRAMES_DESTELLO}>
          <Destello />
        </Sequence>
      ))}

      <Acabado />

      <Audio src={staticFile(`series/${carpeta}/voz.wav`)} />
      <Audio src={staticFile(`musica-generada/${carpeta}.wav`)} volume={volumenMusica(palabras, fps, durationInFrames)} />
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.5} />
      {whooshes.map((f) => (
        <Sequence key={`w${f}`} from={Math.max(0, f)} durationInFrames={20}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={inicioCierre + 16}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
