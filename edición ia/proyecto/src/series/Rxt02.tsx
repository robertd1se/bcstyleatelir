// Serie RXT, parte 2/9: "¿Por qué elegir RXT?"
// Voz: python3 scripts/voz.py guiones/rxt-02.txt public/series/rxt-02
// Música: python3 scripts/musica.py public/musica-generada/rxt-02.wav --duracion <voz + 1 s> --semilla 2
import { Caption } from "@remotion/captions";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { COLORES, FPS } from "../estilo";
import palabrasJson from "../../public/series/rxt-02/palabras.json";
import { cuandoSeDice } from "./linea";
import { ClaveCamara, prepararPalabras, ReelSerie } from "./ReelSerie";
import { ListaTarjetas } from "./ui/ListaTarjetas";
import { Progreso } from "./ui/Progreso";
import { Chips, Tarjeta } from "./ui/Tarjeta";

const PALABRAS: Caption[] = prepararPalabras(palabrasJson as Caption[]);
const dice = (p: string, n = 0) => cuandoSeDice(PALABRAS, p, n);
export const DURACION_RXT02 = Math.round((PALABRAS[PALABRAS.length - 1].endMs / 1000) * FPS) + Math.round(0.8 * FPS);

const T = {
  porque: dice("porque"),
  objetivos: dice("objetivos"),
  capacidades: dice("capacidades"),
  necesidades: dice("necesidades"),
  no: dice("no"),
  levantar: dice("levantar"),
  terminar: dice("terminar"),
  setrata: dice("se", 1),
  intencion: dice("intención"),
  tecnica: dice("cuidar"),
  progresiva: dice("trabajar"),
  acompanamiento: dice("tener"),
  aqui: dice("aquí"),
  comunidad: dice("comunidad"),
  disciplina: dice("disciplina"),
  motivacion: dice("motivación"),
  cada: dice("cada", 1),
  limites: dice("límites"),
  serie: dice("esta"),
};

const GENERAL = { x: 0.5, z: 2.5, zoom: 47, giro: 0 };
const CAMARA: ClaveCamara[] = [
  { frame: 0, x: 0, z: 1, zoom: 64, giro: 0.25 },
  { frame: 16, ...GENERAL },
  // cada persona es distinta: recorrido lento por tres zonas
  { frame: T.objetivos, x: -5.5, z: -4, zoom: 66, giro: -0.1 },
  { frame: T.capacidades, x: 5.5, z: -4, zoom: 66, giro: 0.05 },
  { frame: T.necesidades, x: -5.5, z: 4.5, zoom: 66, giro: 0.15 },
  // no se trata solo de levantar peso
  { frame: T.no, x: 5.5, z: -4.5, zoom: 88, giro: -0.2 },
  // se trata de: cuatro claves
  { frame: T.intencion, x: -5.5, z: -3.5, zoom: 78, giro: 0 },
  { frame: T.tecnica, x: 5.5, z: -3.5, zoom: 78, giro: 0 },
  { frame: T.progresiva, x: -5.5, z: 5, zoom: 78, giro: 0 },
  { frame: T.acompanamiento, x: 5.5, z: 5, zoom: 78, giro: 0 },
  // comunidad: vista general girando
  { frame: T.aqui, x: 0, z: 2, zoom: 50, giro: 0.35 },
  // superar tus límites: primer plano de los saltos
  { frame: T.cada, x: -7.2, z: -4.8, zoom: 120, giro: -0.15 },
  { frame: T.serie, ...GENERAL },
];

const ZONAS = ["funcional", "fuerza", "acondicionamiento", "hibrido"];
const CLAVES = ["Entrenar con intención", "Cuidar la técnica", "Trabajar progresivamente", "Acompañamiento profesional"];
const INICIOS = [T.intencion, T.tecnica, T.progresiva, T.acompanamiento];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const claveActual = (f: number) => (f >= T.aqui ? 5 : f < T.intencion ? 0 : INICIOS.filter((i) => f >= i).length);

const estado3D = (f: number) => {
  const actual = claveActual(f);
  const activas: Record<string, number> = {};
  ZONAS.forEach((z, i) => {
    const enClave = actual === i + 1 ? interpolate(f, [INICIOS[i], INICIOS[i] + 8], [0, 1], clamp) : 0;
    const enPersonas = [T.objetivos, T.capacidades, T.necesidades][i] !== undefined && i < 3 && f >= [T.objetivos, T.capacidades, T.necesidades][i] && f < T.no ? 0.55 : 0;
    const enComunidad = f >= T.aqui && f < T.cada ? 0.35 + 0.15 * Math.sin(f / 6 + i) : 0;
    const enLimites = z === "funcional" && f >= T.cada && f < T.serie ? interpolate(f, [T.cada, T.cada + 10], [0, 1], clamp) : 0;
    const enPeso = z === "fuerza" && f >= T.no && f < T.setrata ? 0.45 : 0;
    activas[z] = Math.max(enClave, enPersonas, enComunidad, enLimites, enPeso);
  });
  const marcadores =
    actual >= 1 && actual <= 5
      ? ZONAS.map((z, i) => ({
          zona: z,
          numero: actual > i + 1 ? "✓" : String(i + 1),
          color: actual > i + 1 ? COLORES.azul : COLORES.rojo,
          opacidad: interpolate(f, [T.intencion - 6, T.intencion + 4], [0, 1], clamp) * interpolate(f, [T.aqui + 20, T.aqui + 30], [1, 0], clamp),
          escala: actual === i + 1 ? 1.25 : 1,
        }))
      : [];
  const coachResaltado = Math.max(
    interpolate(f, [T.tecnica, T.tecnica + 6, T.progresiva - 2, T.progresiva + 4], [0, 1, 1, 0], clamp),
    interpolate(f, [T.acompanamiento, T.acompanamiento + 6, T.cada - 4, T.cada + 4], [0, 1, 1, 0], clamp),
  );
  return { activas, marcadores, coachResaltado };
};

const ProgresoClaves: React.FC = () => {
  const frame = useCurrentFrame();
  const actual = claveActual(frame);
  const opacidad = interpolate(frame, [T.setrata, T.setrata + 8, T.aqui - 6, T.aqui], [0, 1, 1, 0], clamp);
  return (
    <div style={{ opacity: opacidad }}>
      <Progreso
        titulo="LA CLAVE"
        total={4}
        actual={Math.max(actual, 1)}
        inicioActualFrame={actual >= 1 && actual <= 4 ? INICIOS[actual - 1] : T.setrata}
        etiqueta={actual >= 1 && actual <= 4 ? CLAVES[actual - 1] : undefined}
      />
    </div>
  );
};

export const Rxt02: React.FC = () => {
  const encontrar = [
    { texto: "Comunidad", desdeFrame: T.comunidad },
    { texto: "Disciplina", desdeFrame: T.disciplina },
    { texto: "Motivación", desdeFrame: T.motivacion },
  ];
  return (
    <ReelSerie
      parte={2}
      palabras={PALABRAS}
      carpeta="rxt-02"
      camara={CAMARA}
      estado3D={estado3D}
      cajasRojas={["RXT?", "diferentes.", "intención,", "límites."]}
      cajasAzules={["técnica,", "progresiva", "profesional."]}
      secciones={[T.no, T.setrata, T.aqui, T.cada]}
      inicioCierre={T.serie}
    >
      <Sequence from={T.porque} durationInFrames={T.no - T.porque}>
        <ListaTarjetas
          etiqueta="Cada persona es distinta"
          durationInFrames={T.no - T.porque}
          items={[
            { icono: "◎", titulo: "Objetivos", detalle: "Lo que quieres lograr", desdeFrame: T.objetivos - T.porque },
            { icono: "▲", titulo: "Capacidades", detalle: "Desde dónde empiezas", desdeFrame: T.capacidades - T.porque, color: COLORES.azul },
            { icono: "+", titulo: "Necesidades", detalle: "Lo que tu cuerpo pide", desdeFrame: T.necesidades - T.porque },
          ]}
        />
      </Sequence>
      <Sequence from={T.no} durationInFrames={T.setrata - T.no}>
        <ListaTarjetas
          etiqueta="No se trata solo de"
          durationInFrames={T.setrata - T.no}
          items={[
            { icono: "✕", titulo: "Levantar peso", desdeFrame: T.levantar - T.no, color: "#3a3d4a", tachado: true },
            { icono: "✕", titulo: "Terminar una rutina", desdeFrame: T.terminar - T.no, color: "#3a3d4a", tachado: true },
          ]}
        />
      </Sequence>
      <ProgresoClaves />
      <Sequence from={T.aqui} durationInFrames={T.cada - T.aqui}>
        <Tarjeta titulo="Lo que vas a encontrar" durationInFrames={T.cada - T.aqui}>
          <Chips items={encontrar} tarjetaDesde={T.aqui} />
        </Tarjeta>
      </Sequence>
    </ReelSerie>
  );
};
