// Serie RXT, parte 1/9: "¿Qué hacemos en RXT?"
// Voz: python3 scripts/voz.py guiones/rxt-01.txt public/series/rxt-01
// Música: python3 scripts/musica.py public/musica-generada/rxt-01.wav --duracion <voz + 1 s>
import { Caption } from "@remotion/captions";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { COLORES, FPS } from "../estilo";
import palabrasJson from "../../public/series/rxt-01/palabras.json";
import { cuandoSeDice } from "./linea";
import { ClaveCamara, prepararPalabras, ReelSerie } from "./ReelSerie";
import { ListaTarjetas } from "./ui/ListaTarjetas";
import { Progreso } from "./ui/Progreso";
import { Chips, Tarjeta } from "./ui/Tarjeta";

const PALABRAS: Caption[] = prepararPalabras(palabrasJson as Caption[]);
const dice = (p: string, n = 0) => cuandoSeDice(PALABRAS, p, n);
export const DURACION_RXT01 = Math.round((PALABRAS[PALABRAS.length - 1].endMs / 1000) * FPS) + Math.round(0.8 * FPS);

const T = {
  pilares: dice("pilares"),
  p1: dice("1."),
  p2: dice("2."),
  p3: dice("3."),
  p4: dice("4."),
  asi: dice("así"),
  sesiones: dice("sesiones"),
  dirigidas: dice("dirigidas"),
  objetivo: dice("nuestro"),
  rendimiento: dice("rendimiento"),
  mejor: dice("mejor"),
  serie: dice("esta"),
};

const GENERAL = { x: 0.5, z: 2.5, zoom: 47, giro: 0 };
const CAMARA: ClaveCamara[] = [
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
const INICIOS = [T.p1, T.p2, T.p3, T.p4];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pilarActual = (f: number) => (f >= T.asi ? 5 : INICIOS.filter((i) => f >= i).length);

const estado3D = (f: number) => {
  const actual = pilarActual(f);
  const activas: Record<string, number> = {};
  ZONAS_PILARES.forEach((z, i) => {
    activas[z] = actual === i + 1 ? interpolate(f, [INICIOS[i], INICIOS[i] + 8], [0, 1], clamp) : 0;
  });
  const marcadores = ZONAS_PILARES.map((z, i) => ({
    zona: z,
    numero: actual > i + 1 ? "✓" : String(i + 1),
    color: actual > i + 1 ? COLORES.azul : COLORES.rojo,
    opacidad: interpolate(f, [T.pilares + i * 4, T.pilares + i * 4 + 6], [0, 1], clamp) * interpolate(f, [T.objetivo, T.objetivo + 10], [1, 0], clamp),
    escala: actual === i + 1 ? 1.25 : 1,
  }));
  const coachResaltado = interpolate(f, [T.sesiones, T.sesiones + 8, T.objetivo - 4, T.objetivo + 4], [0, 1, 1, 0], clamp);
  return { activas, marcadores, coachResaltado };
};

const ProgresoPilares: React.FC<{ frame: number }> = ({ frame }) => {
  const actual = pilarActual(frame);
  const opacidad = interpolate(frame, [T.pilares, T.pilares + 8, T.sesiones - 6, T.sesiones], [0, 1, 1, 0], clamp);
  return (
    <div style={{ opacity: opacidad }}>
      <Progreso
        titulo="PILARES"
        total={4}
        actual={actual}
        inicioActualFrame={actual >= 1 && actual <= 4 ? INICIOS[actual - 1] : T.asi}
        etiqueta={actual >= 1 && actual <= 4 ? NOMBRES_PILARES[actual - 1] : undefined}
      />
    </div>
  );
};

export const Rxt01: React.FC = () => {
  const capacidades = ["fuerza", "resistencia", "velocidad", "coordinación", "movilidad", "estabilidad"].map((c) => ({
    texto: c[0].toUpperCase() + c.slice(1),
    desdeFrame: dice(c, c === "fuerza" ? 1 : 0),
  }));
  return (
    <ReelSerie
      parte={1}
      palabras={PALABRAS}
      carpeta="rxt-01"
      camara={CAMARA}
      estado3D={estado3D}
      doradas={["hacemos", "integral,", "pilares.", "coaches.", "objetivo", "fuera"]}
      rojas={["rendimiento", "híbrido."]}
      secciones={[T.asi, T.sesiones, T.objetivo]}
      inicioCierre={T.serie}
      logo={{ desde: dice("en", 1) - 3, hasta: dice("desarrollo") + 12 }}
    >
      <FrameProgreso />
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
            { icono: "●", titulo: "Dirigidas por coaches", detalle: "Supervisan tu técnica", desdeFrame: T.dirigidas - T.sesiones, color: COLORES.azul },
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
    </ReelSerie>
  );
};

const FrameProgreso: React.FC = () => <ProgresoPilares frame={useCurrentFrame()} />;
