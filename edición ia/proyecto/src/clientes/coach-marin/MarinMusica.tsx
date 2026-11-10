// Coach Marín · reel fresco con música: los 3 reels animados de la app, recortados y cortados al ritmo.
// Música: python3 scripts/musica.py public/musica-generada/marin-fresco.wav --duracion 25 --bpm 120 --semilla 5 --estilo fresco
// Videos: copias de clientes/coach-marin/grabaciones/ en public/entrada/marin/ (no se suben a Git).
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabado } from "../../series/ui/Acabado";

const BEAT = 15; // cuadros por tiempo a 120 BPM y 30 fps
const ANUNCIO = "entrada/marin/Reel_Anuncio_Metodo_Marin.mp4";
const HOME = "entrada/marin/Reel_Home_Challenge.mp4";
const METODO = "entrada/marin/Reel_Metodo_Marin.mp4";

// [video, segundo de inicio en el original, duración en tiempos]
const PLANOS: [string, number, number][] = [
  [METODO, 0.0, 3], // gancho: "¿Entrenas sin plan?"
  [METODO, 1.7, 1], // "Así nunca vas a ver resultados" (ya completo)
  [ANUNCIO, 1.0, 6], // DROP: la rutina en una foto vieja + mensajes
  [HOME, 2.6, 4], // "Tu rutina en casa, en tu celular"
  [ANUNCIO, 5.0, 4], // "Tu entreno de hoy, listo antes del gym"
  [HOME, 5.9, 3], // ejercicios que se van tildando
  [METODO, 9.1, 3], // "Terminas y sumas a tu racha"
  [ANUNCIO, 9.4, 4], // "Cada kilo que bajas, registrado" -5.6 kg
  [METODO, 12.1, 3], // +22.5 kg en sentadilla
  [ANUNCIO, 14.0, 4], // "Tu coach, siempre a un mensaje"
  [HOME, 10.6, 4], // $399 Home Challenge
  [METODO, 15.0, 4], // "Elige tu programa" + precios
  [METODO, 17.2, 6], // cierre: "Escríbeme por WhatsApp"
];
const INICIOS = PLANOS.reduce<number[]>((a, p, i) => [...a, i === 0 ? 0 : a[i - 1] + PLANOS[i - 1][2] * BEAT], []);
export const DURACION_MARIN_MUSICA = INICIOS[INICIOS.length - 1] + PLANOS[PLANOS.length - 1][2] * BEAT;
const DROP = INICIOS[2];
const DESTELLOS = [DROP, INICIOS[10], INICIOS[12]]; // golpes fuertes: drop, precio y cierre

const Plano: React.FC<{ src: string; desde: number; duracion: number; primero: boolean }> = ({ src, desde, duracion, primero }) => {
  const f = useCurrentFrame();
  // golpe de zoom al entrar (en el corte) + zoom lento continuo + pulso suave en cada tiempo
  const golpe = primero ? 0 : interpolate(f, [0, 8], [0.08, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lento = interpolate(f, [0, duracion], [0, 0.03]);
  const pulso = 0.008 * Math.max(0, 1 - (f % BEAT) / 5);
  const blur = primero ? 0 : interpolate(f, [0, 5], [4, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#05070c" }}>
      <OffthreadVideo
        src={staticFile(src)}
        trimBefore={Math.round(desde * 30)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + golpe + lento + pulso})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}
      />
    </AbsoluteFill>
  );
};

const Destello: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 2, 9], [0.85, 0.6, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #ffffff 0%, #8fb4ff 35%, #1e6bff 70%)", opacity: o, mixBlendMode: "screen" }} />;
};

export const MarinMusica: React.FC = () => {
  const f = useCurrentFrame();
  const fin = interpolate(f, [DURACION_MARIN_MUSICA - 18, DURACION_MARIN_MUSICA], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070c" }}>
      {PLANOS.map(([src, desde, tiempos], i) => (
        <Sequence key={i} from={INICIOS[i]} durationInFrames={tiempos * BEAT}>
          <Plano src={src} desde={desde} duracion={tiempos * BEAT} primero={i === 0} />
        </Sequence>
      ))}
      {DESTELLOS.map((d) => (
        <Sequence key={d} from={d} durationInFrames={10}>
          <Destello />
        </Sequence>
      ))}
      <Acabado grano={0.04} />
      <Audio src={staticFile("musica-generada/marin-fresco.wav")} volume={(fr) => interpolate(fr, [DURACION_MARIN_MUSICA - 24, DURACION_MARIN_MUSICA], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <AbsoluteFill style={{ backgroundColor: "#05070c", opacity: 1 - fin }} />
    </AbsoluteFill>
  );
};
