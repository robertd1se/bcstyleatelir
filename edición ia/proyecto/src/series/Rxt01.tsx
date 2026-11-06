// Serie RXT, parte 1/9: "¿Qué hacemos en RXT?"
// Voz: guiones/rxt-01.txt → python3 scripts/voz.py guiones/rxt-01.txt public/series/rxt-01
import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, ANCHO, COLORES, FPS } from "../estilo";
import palabrasJson from "../../public/series/rxt-01/palabras.json";
import { Gimnasio3D } from "./gym3d/Gimnasio3D";
import { cuandoSeDice, interpolarClaves } from "./linea";
import { Acabado } from "./ui/Acabado";
import { CierreSerie } from "./ui/CierreSerie";
import { Destello, FRAMES_DESTELLO } from "./ui/Destello";
import { Encabezado } from "./ui/Encabezado";
import { ListaTarjetas } from "./ui/ListaTarjetas";
import { Progreso } from "./ui/Progreso";
import { Chips, Tarjeta } from "./ui/Tarjeta";
import { TextoCaja } from "./ui/TextoCaja";

// gancho: la primera oración se ve entera desde el cuadro 0
const crudo = palabrasJson as Caption[];
const finGancho = crudo.findIndex((p) => /[?.!]$/.test(p.text));
const PALABRAS: Caption[] = crudo.map((p, i) => (i <= finGancho ? { ...p, startMs: 0 } : p));
const dice = (p: string, n = 0) => cuandoSeDice(PALABRAS, p, n);
const FIN_VOZ = Math.round((PALABRAS[PALABRAS.length - 1].endMs / 1000) * FPS);
export const DURACION_RXT01 = FIN_VOZ + Math.round(0.8 * FPS);

const T = {
  pilares: dice("pilares"),
  p1: dice("1."),
  p2: dice("2."),
  p3: dice("3."),
  p4: dice("4."),
  asi: dice("así"),
  sesiones: dice("sesiones"),
  objetivo: dice("nuestro"),
  rendimiento: dice("rendimiento"),
  mejor: dice("mejor"),
  serie: dice("esta"),
};

const GENERAL = { x: 0.5, z: 2.5, zoom: 47, giro: 0 };
const camaraClaves = [
  // gancho: arranca cerca y se abre
  { frame: 0, x: 0, z: 1, zoom: 64, giro: -0.25 },
  { frame: 16, ...GENERAL },
  { frame: T.p1, x: -5.5, z: -3.5, zoom: 78, giro: 0 },
  { frame: T.p2, x: 5.5, z: -3.5, zoom: 78, giro: 0 },
  { frame: T.p3, x: -5.5, z: 5, zoom: 78, giro: 0 },
  { frame: T.p4, x: 5.5, z: 5, zoom: 78, giro: 0 },
  { frame: T.asi, x: 0.5, z: 2.5, zoom: 50, giro: 0 },
  { frame: T.sesiones, x: 0, z: 0.5, zoom: 56, giro: 0.15 },
  { frame: T.objetivo, x: 0, z: 3, zoom: 50, giro: -0.12 },
  { frame: T.serie, ...GENERAL },
];
const ZONAS_PILARES = ["funcional", "fuerza", "acondicionamiento", "hibrido"];
const NOMBRES_PILARES = ["Entrenamiento funcional", "Fuerza", "Acondicionamiento físico", "Entrenamiento híbrido"];
const INICIOS_PILARES = [T.p1, T.p2, T.p3, T.p4];

export const Rxt01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const base = interpolarClaves(frame, camaraClaves, ["x", "z", "zoom", "giro"], 22);
  // deriva lenta para que la cámara nunca quede quieta (vuelve a 0 al final, para el loop)
  const deriva = Math.sin((frame / durationInFrames) * Math.PI * 2);
  const cam = { ...base, giro: base.giro + 0.06 * deriva, zoom: base.zoom * (1 + 0.03 * Math.sin((frame / durationInFrames) * Math.PI * 4)) };

  // pilar actual (1..4), 5 = todos hechos, 0 = ninguno todavía
  const actual = frame >= T.asi ? 5 : INICIOS_PILARES.filter((f) => frame >= f).length;
  const activas: Record<string, number> = {};
  ZONAS_PILARES.forEach((z, i) => {
    activas[z] =
      actual === i + 1
        ? interpolate(frame, [INICIOS_PILARES[i], INICIOS_PILARES[i] + 8], [0, 1], { extrapolateRight: "clamp" })
        : 0;
  });
  const marcadores = ZONAS_PILARES.map((z, i) => {
    const aparece = T.pilares + i * 4;
    const op = interpolate(frame, [aparece, aparece + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hecho = actual > i + 1;
    return {
      zona: z,
      numero: hecho ? "✓" : String(i + 1),
      color: hecho ? COLORES.azul : COLORES.rojo,
      opacidad: op * interpolate(frame, [T.objetivo, T.objetivo + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      escala: actual === i + 1 ? 1.25 : 1,
    };
  });
  const coach = interpolate(frame, [T.sesiones, T.sesiones + 8, T.objetivo - 4, T.objetivo + 4], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progresoOpacidad = interpolate(frame, [T.pilares, T.pilares + 8, T.sesiones - 6, T.sesiones], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const capacidades = ["fuerza", "resistencia", "velocidad", "coordinación", "movilidad", "estabilidad"].map((c) => ({
    texto: c[0].toUpperCase() + c.slice(1),
    desdeFrame: dice(c, c === "fuerza" ? 1 : 0),
  }));
  const moverCamara = camaraClaves.slice(2).map((c) => c.frame - 13);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07080d" }}>
      <Gimnasio3D ancho={ANCHO} alto={ALTO} t={t} cam={cam} activas={activas} marcadores={marcadores} coachResaltado={coach} />
      {/* degradado arriba para que el texto se lea */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #07080df0 0%, #07080dcc 22%, transparent 38%)" }} />

      <Encabezado parte={1} total={9} />
      <Sequence durationInFrames={T.serie}>
        <TextoCaja palabras={PALABRAS} cajasRojas={["RXT?", "integral", "objetivo", "rendimiento"]} cajasAzules={["coaches", "dentro", "fuera"]} />
      </Sequence>
      <div style={{ opacity: progresoOpacidad }}>
        <Progreso
          titulo="PILARES"
          total={4}
          actual={actual}
          inicioActualFrame={actual >= 1 && actual <= 4 ? INICIOS_PILARES[actual - 1] : T.asi}
          etiqueta={actual >= 1 && actual <= 4 ? NOMBRES_PILARES[actual - 1] : undefined}
        />
      </div>

      <Sequence from={T.asi} durationInFrames={T.sesiones - T.asi}>
        <Tarjeta titulo="Capacidades que desarrollamos" durationInFrames={T.sesiones - T.asi}>
          <Chips items={capacidades} tarjetaDesde={T.asi} />
        </Tarjeta>
      </Sequence>
      <Sequence from={T.sesiones} durationInFrames={T.objetivo - T.sesiones}>
        <ListaTarjetas
          etiqueta="Cómo entrenamos"
          durationInFrames={T.objetivo - T.sesiones}
          items={[
            { icono: "▦", titulo: "Sesiones estructuradas", detalle: "Con planificación e intención", desdeFrame: 4 },
            { icono: "●", titulo: "Dirigidas por coaches", detalle: "Supervisan tu técnica", desdeFrame: dice("dirigidas") - T.sesiones, color: COLORES.azul },
          ]}
        />
      </Sequence>
      <Sequence from={T.objetivo} durationInFrames={T.serie - T.objetivo}>
        <ListaTarjetas
          etiqueta="Nuestro objetivo"
          durationInFrames={T.serie - T.objetivo}
          items={[
            { icono: "↑", titulo: "Mejor rendimiento", detalle: "Desarrolla tus capacidades", desdeFrame: T.rendimiento - T.objetivo },
            { icono: "✓", titulo: "Sentirte mejor", detalle: "Dentro y fuera del gimnasio", desdeFrame: T.mejor - T.objetivo, color: COLORES.azul },
          ]}
        />
      </Sequence>
      <Sequence from={T.serie}>
        <CierreSerie parte={1} total={9} />
      </Sequence>

      {/* destellos entre secciones */}
      {[T.asi, T.sesiones, T.objetivo, T.serie].map((f) => (
        <Sequence key={f} from={f - FRAMES_DESTELLO / 2} durationInFrames={FRAMES_DESTELLO}>
          <Destello />
        </Sequence>
      ))}

      <Acabado />

      <Audio src={staticFile("series/rxt-01/voz.wav")} />
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.5} />
      {moverCamara.map((f) => (
        <Sequence key={f} from={Math.max(0, f)} durationInFrames={20}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
