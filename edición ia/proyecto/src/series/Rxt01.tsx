// Serie RXT, parte 1/9: "¿Qué hacemos en RXT?"
// Voz: guiones/rxt-01.txt → python3 scripts/voz.py guiones/rxt-01.txt public/series/rxt-01
import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, ANCHO, COLORES, FPS, FUENTES } from "../estilo";
import palabrasJson from "../../public/series/rxt-01/palabras.json";
import { Gimnasio3D } from "./gym3d/Gimnasio3D";
import { cuandoSeDice, interpolarClaves } from "./linea";
import { EtiquetaSerie } from "./ui/EtiquetaSerie";
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
  { frame: 0, ...GENERAL },
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
  const cam = interpolarClaves(frame, camaraClaves, ["x", "z", "zoom", "giro"]);

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
  const moverCamara = camaraClaves.slice(1).map((c) => c.frame - 11);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07080d" }}>
      <Gimnasio3D ancho={ANCHO} alto={ALTO} t={t} cam={cam} activas={activas} marcadores={marcadores} coachResaltado={coach} />
      {/* degradado arriba para que el texto se lea */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #07080df0 0%, #07080dcc 22%, transparent 38%)" }} />

      <EtiquetaSerie parte={1} total={9} />
      <TextoCaja palabras={PALABRAS} cajasRojas={["RXT?", "integral", "objetivo", "rendimiento"]} cajasAzules={["coaches", "dentro", "fuera"]} />
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
        <Tarjeta titulo="Cómo entrenamos" durationInFrames={T.objetivo - T.sesiones}>
          <Linea texto="Sesiones estructuradas" icono="▦" />
          <Linea texto="Dirigidas por coaches" icono="●" color={COLORES.azul} />
        </Tarjeta>
      </Sequence>
      <Sequence from={T.objetivo} durationInFrames={T.serie - T.objetivo}>
        <Tarjeta titulo="Nuestro objetivo" durationInFrames={T.serie - T.objetivo}>
          <Linea texto="Mejorar tu rendimiento" icono="↑" desde={T.rendimiento - T.objetivo} />
          <Linea texto="Sentirte mejor, dentro y fuera" icono="✓" color={COLORES.azul} desde={T.mejor - T.objetivo} />
        </Tarjeta>
      </Sequence>
      <Sequence from={T.serie} durationInFrames={durationInFrames - T.serie}>
        <Tarjeta titulo="Serie RXT" durationInFrames={durationInFrames - T.serie + 6}>
          <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i === 0 ? COLORES.rojo : "#ffffff26" }} />
            ))}
          </div>
          <div style={{ fontFamily: FUENTES.titulos, fontWeight: 800, fontSize: 40, color: COLORES.blanco }}>
            Parte 1 de 9 · <span style={{ color: COLORES.rojo }}>Síguenos</span>
          </div>
        </Tarjeta>
      </Sequence>

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

const Linea: React.FC<{ texto: string; icono: string; color?: string; desde?: number }> = ({ texto, icono, color = COLORES.rojo, desde = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [desde, desde + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 10, opacity: o, transform: `translateX(${(1 - o) * 30}px)` }}>
      <div style={{ width: 58, height: 58, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 32, color: COLORES.blanco }}>
        {icono}
      </div>
      <div style={{ fontFamily: FUENTES.titulos, fontWeight: 800, fontSize: 42, color: COLORES.blanco }}>{texto}</div>
    </div>
  );
};
