// Serie RXT, parte 2/9: "¿Por qué elegir RXT?" — formato explicativo 2D (inspirado en la ref. 7).
// Voz: python3 scripts/voz.py guiones/rxt-02.txt public/series/rxt-02
// Música: python3 scripts/musica.py public/musica-generada/rxt-02.wav --duracion <voz + 1 s> --semilla 2
import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FPS, FUENTES } from "../estilo";
import palabrasJson from "../../public/series/rxt-02/palabras.json";
import { cuandoSeDice } from "../series/linea";
import { prepararPalabras } from "../series/ReelSerie";
import { volumenMusica } from "../series/sonido";
import { Acabado } from "../series/ui/Acabado";
import { CierreSerie } from "../series/ui/CierreSerie";
import { Encabezado } from "../series/ui/Encabezado";
import { CtaGuardar, FRAMES_CTA_GUARDAR } from "../series/ui/CtaGuardar";
import { LogoRxt } from "../series/ui/LogoRxt";
import { TextoCaja } from "../series/ui/TextoCaja";
import { Persona2D } from "./Persona2D";
import { Barras, Diana, Fondo2D, FRAMES_RAYO, GraficoLinea, Lista, Panel, Pastilla, Rayo, Sello, useEntrada } from "./piezas";

const PALABRAS: Caption[] = prepararPalabras(palabrasJson as Caption[]);
const dice = (p: string, n = 0) => cuandoSeDice(PALABRAS, p, n);
export const DURACION_RXT02 = Math.round((PALABRAS[PALABRAS.length - 1].endMs / 1000) * FPS) + Math.round(0.8 * FPS);

const T = {
  en: dice("en"),
  cada: dice("cada"),
  objetivos: dice("objetivos"),
  capacidades: dice("capacidades"),
  necesidades: dice("necesidades"),
  no: dice("no"),
  levantar: dice("levantar"),
  terminar: dice("terminar"),
  rutina: dice("rutina"),
  se: dice("se", 1),
  intencion: dice("intención"),
  cuidar: dice("cuidar"),
  tecnica: dice("técnica"),
  trabajar: dice("trabajar"),
  progresiva: dice("progresiva"),
  tener: dice("tener"),
  profesional: dice("profesional"),
  aqui: dice("aquí"),
  comunidad: dice("comunidad"),
  disciplina: dice("disciplina"),
  motivacion: dice("motivación"),
  cada2: dice("cada", 1),
  superar: dice("superar"),
  limites: dice("límites"),
  serie: dice("esta"),
};
const FIN_LOGO = T.cada + 4;

// Escenas: [desde, hasta)
const ESCENAS: [number, number][] = [
  [0, T.en - 3],
  [FIN_LOGO - 2, T.no],
  [T.no, T.se],
  [T.se, T.cuidar],
  [T.cuidar, T.trabajar],
  [T.trabajar, T.tener],
  [T.tener, T.aqui],
  [T.aqui, T.cada2],
  [T.cada2, T.serie],
];

const Escena: React.FC<{ d: number; children: React.ReactNode; primera?: boolean }> = ({ d, children, primera }) => {
  const e = useEntrada(d);
  const frame = useCurrentFrame();
  // la primera escena (gancho) se ve completa desde el cuadro 0: no entra, solo sale
  if (primera) return <AbsoluteFill style={{ opacity: interpolate(frame, [d - 5, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ opacity: e.opacidad, transform: `translateY(${e.y}px) scale(${e.escala})` }}>{children}</AbsoluteFill>;
};

const useT = () => useCurrentFrame() / FPS;
const PIE = 1180; // línea del piso de los personajes

// 0 · Gancho: personaje pensando con signos de pregunta
const Gancho: React.FC = () => {
  const t = useT();
  return (
    <>
      <div style={{ position: "absolute", top: 410, width: "100%", display: "flex", justifyContent: "center" }}>
        <Pastilla texto="¿Por qué RXT?" color={COLORES.rojo} grande desde={-12} />
      </div>
      <Persona2D x={540} y={PIE + 40} alto={560} pose="pensando" t={t} remera={COLORES.azul} />
      {[
        [330, 560, -14, 0],
        [760, 500, 12, 4],
        [700, 760, 6, 8],
      ].map(([x, y, g, d], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y + 8 * Math.sin(t * 3 + i), transform: `rotate(${g}deg)`, fontFamily: FUENTES.manuscrita, fontSize: 150, color: i === 1 ? COLORES.dorado : "#ffffffcc", opacity: Math.min(1, Math.max(0, (t * 30 - d) / 6)) }}>
          ?
        </div>
      ))}
    </>
  );
};

// 1 · Cada persona es distinta: tres personajes con su etiqueta
const Personas: React.FC = () => {
  const t = useT();
  const d0 = ESCENAS[1][0];
  return (
    <>
      <div style={{ position: "absolute", top: 410, width: "100%", display: "flex", justifyContent: "center" }}>
        <Pastilla texto="Cada persona es distinta" color={COLORES.azul} />
      </div>
      {[
        { x: 230, alto: 430, remera: "#2bb673", pose: "festejo" as const, et: "Objetivos", desde: T.objetivos, color: "#2bb673" },
        { x: 540, alto: 500, remera: COLORES.azul, pose: "sentadilla" as const, et: "Capacidades", desde: T.capacidades, color: COLORES.azul },
        { x: 850, alto: 460, remera: "#8b5cf6", pose: "caminar" as const, et: "Necesidades", desde: T.necesidades, color: "#8b5cf6" },
      ].map((p, i) => (
        <div key={i}>
          <Persona2D x={p.x} y={PIE} alto={p.alto} pose={p.pose} t={t} fase={i * 0.4} remera={p.remera} pelo={["#2a1a12", "#111", "#6b3f1d"][i]} />
          <div style={{ position: "absolute", left: p.x, top: PIE - p.alto - 70, transform: "translateX(-50%)" }}>
            <Pastilla texto={p.et} color={p.color} desde={p.desde - d0} />
          </div>
        </div>
      ))}
    </>
  );
};

// 2 · No se trata solo de levantar peso o terminar una rutina
const NoSoloEso: React.FC = () => {
  const t = useT();
  const d0 = ESCENAS[2][0];
  return (
    <>
      <div style={{ position: "absolute", top: 410, width: "100%", display: "flex", justifyContent: "center" }}>
        <Pastilla texto="No se trata solo de…" color="#3a3f55" />
      </div>
      <Panel x={80} y={470} w={430} h={600} titulo="Levantar peso">
        <Persona2D x={215} y={585} alto={420} pose="levantar" t={t} remera="#e05a2b" />
      </Panel>
      {useCurrentFrame() >= T.terminar - d0 - 4 ? (
        <Panel x={540} y={470} w={420} h={600} titulo="Terminar la rutina">
          <div style={{ position: "absolute", top: 80, left: 24 }}>
            <Lista items={["Sentadilla", "Press banca", "Remo", "Burpees", "Plancha"]} desde={T.terminar - d0} paso={3} w={372} />
          </div>
        </Panel>
      ) : null}
      <Sello texto="No es todo" desde={T.rutina - d0 - 3} x={540} y={790} giro={-9} tamaño={88} />
    </>
  );
};

// 3 · Intención: diana con flecha
const Intencion: React.FC = () => {
  const d0 = ESCENAS[3][0];
  return (
    <>
      <div style={{ position: "absolute", top: 410, width: "100%", display: "flex", justifyContent: "center" }}>
        <Pastilla texto="Se trata de" color={COLORES.rojo} />
      </div>
      <div style={{ position: "absolute", left: 540 - 200, top: 520 }}>
        <Diana desde={T.intencion - d0 - 8} tamaño={400} />
      </div>
      <div style={{ position: "absolute", top: 980, width: "100%", display: "flex", justifyContent: "center" }}>
        <Pastilla texto="Entrenar con intención" color={COLORES.azul} desde={T.intencion - d0 + 6} grande />
      </div>
    </>
  );
};

// 4 · Técnica: sentadilla con guías de alineación
const Tecnica: React.FC = () => {
  const t = useT();
  const d0 = ESCENAS[4][0];
  const f = useCurrentFrame();
  return (
    <>
      <Panel x={170} y={470} w={700} h={680} titulo="Técnica">
        <Persona2D x={350} y={640} alto={480} pose="sentadilla" t={t} remera={COLORES.azul} />
        {/* guías */}
        <svg width={700} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={350} y1={170} x2={350} y2={650} stroke="#3fd17a" strokeWidth={5} strokeDasharray="14 12" opacity={Math.min(1, f / 8)} />
          <line x1={210} y1={650} x2={490} y2={650} stroke="#3fd17a" strokeWidth={5} strokeDasharray="14 12" opacity={Math.min(1, f / 8)} />
        </svg>
        <div style={{ position: "absolute", right: 24, top: 70 }}>
          <Pastilla texto="✓ Bien hecho" color="#2bb673" desde={T.tecnica - d0 + 4} />
        </div>
      </Panel>
    </>
  );
};

// 5 · Progresiva: gráfico que sube vs zigzag sin plan
const Progresiva: React.FC = () => {
  const d0 = ESCENAS[5][0];
  return (
    <>
      <Panel x={80} y={470} w={880} h={640} titulo="Tu progreso">
        <div style={{ position: "absolute", left: 60, top: 110 }}>
          <GraficoLinea w={760} h={420} desde={4} duracion={T.progresiva - d0} puntos={[0.05, 0.14, 0.22, 0.33, 0.42, 0.55, 0.66, 0.8, 0.92]} zigzag={[0.1, 0.32, 0.12, 0.38, 0.16, 0.3, 0.1, 0.34, 0.2]} />
        </div>
        <div style={{ position: "absolute", right: 30, top: 70 }}>
          <Pastilla texto="Progresivo" color="#2bb673" desde={T.progresiva - d0} />
        </div>
        <div style={{ position: "absolute", left: 60, bottom: 30 }}>
          <Pastilla texto="Sin plan" color={COLORES.rojo} desde={10} />
        </div>
      </Panel>
    </>
  );
};

// 6 · Acompañamiento profesional: coach con pulgar arriba
const Acompanamiento: React.FC = () => {
  const t = useT();
  const d0 = ESCENAS[6][0];
  return (
    <>
      <Persona2D x={360} y={PIE} alto={480} pose="sentadilla" t={t} remera={COLORES.azul} />
      <Persona2D x={730} y={PIE} alto={520} pose="pulgar" t={t} remera={COLORES.rojo} gorra espejo />
      <div style={{ position: "absolute", left: 730, top: PIE - 520 - 80, transform: "translateX(-50%)" }}>
        <Pastilla texto="Coach RXT" color={COLORES.rojo} desde={4} />
      </div>
      <div style={{ position: "absolute", top: 410, width: "100%", display: "flex", justifyContent: "center" }}>
        <Pastilla texto="Acompañamiento profesional" color={COLORES.azul} desde={T.profesional - d0 - 6} grande />
      </div>
    </>
  );
};

// 7 · Comunidad, disciplina y motivación
const Comunidad: React.FC = () => {
  const t = useT();
  const d0 = ESCENAS[7][0];
  const remeras = ["#2bb673", COLORES.azul, COLORES.rojo, "#8b5cf6", "#e05a2b"];
  return (
    <>
      {remeras.map((r, i) => (
        <Persona2D key={i} x={170 + i * 180} y={PIE - (i % 2) * 30} alto={380 + (i % 3) * 30} pose="festejo" t={t} fase={i * 0.27} remera={r} gorra={i === 2} pelo={["#2a1a12", "#111", "#6b3f1d", "#111", "#3b2414"][i]} />
      ))}
      <div style={{ position: "absolute", top: 410, width: "100%", display: "flex", justifyContent: "center", gap: 18 }}>
        <Pastilla texto="Comunidad" color={COLORES.azul} desde={T.comunidad - d0} grande />
        <Pastilla texto="Disciplina" color={COLORES.rojo} desde={T.disciplina - d0} grande />
        <Pastilla texto="Motivación" color="#2bb673" desde={T.motivacion - d0} grande />
      </div>
    </>
  );
};

// 8 · Superar tus límites: barras que pasan la línea del límite y personaje saltando
const Limites: React.FC = () => {
  const t = useT();
  const d0 = ESCENAS[8][0];
  const f = useCurrentFrame();
  return (
    <>
      <Panel x={80} y={470} w={580} h={640} titulo="Cada entrenamiento">
        <div style={{ position: "absolute", left: 40, top: 120 }}>
          <Barras w={520} h={440} valores={[0.25, 0.36, 0.45, 0.58, 0.7, 0.95]} desde={6} etiquetas={["S1", "S2", "S3", "S4", "S5", "HOY"]} />
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 120 + 440 * (1 - 0.78), borderTop: `5px dashed ${COLORES.dorado}`, opacity: Math.min(1, f / 10) }}>
          <div style={{ position: "absolute", right: 0, top: -40, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: COLORES.dorado }}>TU LÍMITE</div>
        </div>
      </Panel>
      <Persona2D x={810} y={PIE - 60} alto={420} pose="salto" t={t} remera={COLORES.rojo} />
      <Sello texto="Superado" desde={T.limites - d0} x={370} y={560} giro={-8} tamaño={70} />
    </>
  );
};

const COMPONENTES = [Gancho, Personas, NoSoloEso, Intencion, Tecnica, Progresiva, Acompanamiento, Comunidad, Limites];

export const Rxt02: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Fondo2D />
      {ESCENAS.map(([a, b], i) => {
        const C = COMPONENTES[i];
        return (
          <Sequence key={i} from={a} durationInFrames={b - a}>
            <Escena d={b - a} primera={i === 0}>
              <C />
            </Escena>
          </Sequence>
        );
      })}
      <Sequence from={T.en - 3} durationInFrames={FIN_LOGO - (T.en - 3)}>
        <LogoRxt />
      </Sequence>

      {/* pedir el guardado antes del último punto (ref. 8) */}
      <Sequence from={T.cada2 - FRAMES_CTA_GUARDAR + 6} durationInFrames={FRAMES_CTA_GUARDAR}>
        <CtaGuardar texto="Guárdalo para después" y={1000} />
      </Sequence>
      <Encabezado parte={2} total={9} />
      <Sequence durationInFrames={T.serie}>
        <TextoCaja palabras={PALABRAS} centroY={0.705} tamaño={60} doradas={["elegir", "diferentes.", "intención,", "técnica,", "progresiva", "comunidad,"]} rojas={["límites."]} />
      </Sequence>
      <Sequence from={T.serie}>
        <CierreSerie parte={2} total={9} />
      </Sequence>

      {/* rayos de luz en cada cambio de escena */}
      {[...ESCENAS.slice(2).map(([a]) => a), T.serie].map((f) => (
        <Sequence key={`r${f}`} from={f - FRAMES_RAYO / 2} durationInFrames={FRAMES_RAYO}>
          <Rayo />
        </Sequence>
      ))}
      <Acabado />

      <Audio src={staticFile("series/rxt-02/voz.wav")} />
      <Audio src={staticFile("musica-generada/rxt-02.wav")} volume={volumenMusica(PALABRAS, fps, durationInFrames)} />
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.5} />
      {[...ESCENAS.slice(2).map(([a]) => a), T.serie].map((f) => (
        <Sequence key={`w${f}`} from={f - 6} durationInFrames={20}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
        </Sequence>
      ))}
      <Sequence from={T.en - 7} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      </Sequence>
      {[T.en - 3 + 12, T.rutina - 3, T.limites, T.serie + 16].map((f) => (
        <Sequence key={`i${f}`} from={f}>
          <Audio src={staticFile("sfx/impacto.wav")} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
