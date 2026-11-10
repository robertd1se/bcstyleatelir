// Coach Marín · "Todo el método" con ganchos: video completo con música, cortado al ritmo (120 BPM).
// Música: python3 scripts/musica.py public/musica-generada/marin-todo.wav --duracion 36 --bpm 120 --semilla 8 --estilo fresco
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabado } from "../../series/ui/Acabado";
import { BEAT, MARIN } from "./marca";
import { CierreMarin, ClipReel, CtaComenta, Datos, DestelloAzul, FondoMarin, ListaProgramas, TarjetaPaso, TextoGancho } from "./piezas";

const ANUNCIO = "entrada/marin/Reel_Anuncio_Metodo_Marin.mp4";
const HOME = "entrada/marin/Reel_Home_Challenge.mp4";
const METODO = "entrada/marin/Reel_Metodo_Marin.mp4";

type Escena = { tiempos: number; C: React.FC<{ d: number }>; destello?: boolean };
const clip = (src: string, desde: number): React.FC<{ d: number }> => ({ d }) => <ClipReel src={src} desde={desde} duracion={d} />;
const conFondo = (Cont: React.FC): React.FC<{ d: number }> => () => (
  <>
    <FondoMarin />
    <Cont />
  </>
);

const ESCENAS: Escena[] = [
  // 1 · GANCHO (intro filtrada de la música)
  { tiempos: 4, C: conFondo(() => <TextoGancho lineas={[{ t: "¿Entrenas", tiempo: 0 }, { t: "sin plan?", azul: true, tiempo: 0 }]} />) },
  // DROP: el problema
  { tiempos: 6, C: clip(ANUNCIO, 1.0), destello: true },
  { tiempos: 2, C: clip(METODO, 1.7) }, // "Así nunca vas a ver resultados"
  // 2 · RE-GANCHO: el método
  {
    tiempos: 4,
    C: conFondo(() => (
      <TextoGancho lineas={[{ t: "El método", tiempo: 0 }, { t: "en 4 pasos", azul: true, tiempo: 1 }, { t: "↓", azul: true, tiempo: 3 }]} tamaño={120} />
    )),
    destello: true,
  },
  { tiempos: 4, C: () => <TarjetaPaso n="01" titulo="Evaluación" detalle="Tu objetivo, tu nivel y tu historial." /> },
  { tiempos: 2, C: () => <TarjetaPaso n="02" titulo="Plan a tu medida" detalle="Con estrategia, no con improvisación." /> },
  { tiempos: 4, C: clip(ANUNCIO, 5.0) }, // tu entreno de hoy
  { tiempos: 2, C: () => <TarjetaPaso n="03" titulo="Seguimiento" detalle="Ajustamos tu plan para que no te estanques." /> },
  { tiempos: 4, C: clip(ANUNCIO, 14.0) }, // tu coach, siempre a un mensaje
  { tiempos: 2, C: () => <TarjetaPaso n="04" titulo="Resultados" detalle="Progreso medible y sostenible." /> },
  { tiempos: 3, C: clip(ANUNCIO, 9.4) }, // -5.6 kg
  { tiempos: 3, C: clip(METODO, 12.1) }, // +22.5 kg en sentadilla
  // 3 · RE-GANCHO: los programas
  { tiempos: 2, C: conFondo(() => <TextoGancho lineas={[{ t: "¿Cuál es", tiempo: 0 }, { t: "para ti?", azul: true, tiempo: 0 }]} />), destello: true },
  {
    tiempos: 8,
    C: conFondo(() => (
      <>
        <TextoGancho lineas={[{ t: "Elige tu programa", tiempo: 0 }]} y={440} tamaño={72} />
        <ListaProgramas
          programas={[
            { nombre: "Home Challenge", precio: "$399", extra: "28 días · 21 entrenamientos · pago único", destacado: true },
            { nombre: "Strength Program", precio: "$1,000", extra: "Más fuerza y músculo · al mes" },
            { nombre: "Online Coaching", precio: "$1,500", extra: "100 % personalizado · al mes" },
            { nombre: "Rehab", precio: "$2,000", extra: "Vuelve a moverte sin dolor · al mes" },
            { nombre: "HYROX Challenge", precio: "$2,500", extra: "Prepárate para competir · al mes" },
          ]}
        />
      </>
    )),
  },
  { tiempos: 4, C: clip(HOME, 10.6), destello: true }, // $399
  // 4 · CREDIBILIDAD
  {
    tiempos: 6,
    C: conFondo(() => (
      <Datos
        datos={[
          { valor: 11, texto: "títulos y certificaciones" },
          { valor: 100, sufijo: "%", texto: "personalizado" },
          { valor: 1, prefijo: "1:", texto: "seguimiento real" },
        ]}
      />
    )),
  },
  // 5 · LLAMADA A LA ACCIÓN
  {
    tiempos: 4,
    C: conFondo(() => (
      <>
        <TextoGancho lineas={[{ t: "Comenta", tiempo: 0 }, { t: "«PLAN»", azul: true, tiempo: 0 }]} y={700} />
        <CtaComenta palabra="PLAN" />
      </>
    )),
    destello: true,
  },
  { tiempos: 6, C: () => <CierreMarin usuario="coachmarinmartinez" /> },
];

const INICIOS = ESCENAS.reduce<number[]>((a, e, i) => [...a, i === 0 ? 0 : a[i - 1] + ESCENAS[i - 1].tiempos * BEAT], []);
export const DURACION_MARIN_TODO = INICIOS[INICIOS.length - 1] + ESCENAS[ESCENAS.length - 1].tiempos * BEAT;

export const MarinTodo: React.FC = () => {
  const f = useCurrentFrame();
  const total = DURACION_MARIN_TODO;
  // loop: los últimos 8 cuadros vuelven al gancho
  const loop = interpolate(f, [total - 8, total], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Gancho = ESCENAS[0].C;
  return (
    <AbsoluteFill style={{ backgroundColor: MARIN.fondo }}>
      {ESCENAS.map((e, i) => (
        <Sequence key={i} from={INICIOS[i]} durationInFrames={e.tiempos * BEAT}>
          <e.C d={e.tiempos * BEAT} />
        </Sequence>
      ))}
      {ESCENAS.map((e, i) =>
        e.destello ? (
          <Sequence key={`d${i}`} from={INICIOS[i]} durationInFrames={10}>
            <DestelloAzul />
          </Sequence>
        ) : null,
      )}
      <AbsoluteFill style={{ opacity: loop }}>
        <Gancho d={60} />
      </AbsoluteFill>
      <Acabado grano={0.04} />
      <Audio src={staticFile("musica-generada/marin-todo.wav")} volume={(fr) => interpolate(fr, [total - 20, total], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
