// RXT · Reel 1 (martes 17 nov) · Grupales: "¿Alguna vez te lastimaste entrenando?"
// Estilo de la ref. 9: comparación en pantalla partida con monitos de línea blanca, sin voz, se entiende sin audio.
// Arriba "ENTRENANDO SOLO" (la técnica se rompe y se lesiona); abajo "CON COACH RXT" (lo corrigen y sigue entrenando).
// Música: python3 scripts/musica.py public/musica-generada/rxt-lesion.wav --duracion 21.5 --bpm 100 --semilla 9
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../../estilo";
import { Acabado } from "../../series/ui/Acabado";
import { Monito } from "./Monito";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Fases (4,5 s cada ejercicio): sentadilla · swing · peso muerto (lesión de arriba) · press · thruster · burpees · seguimiento
const F = { gancho: 90, lesion: 470, seguimiento: 900, fin: 1050, frase: 1055, cta: 1125 };
export const DURACION_RXT_LESION = 1225;
type Pose = "sentadilla" | "swing" | "pesoMuerto" | "press" | "thruster" | "burpee";
const EJERCICIOS: { desde: number; nombre: string; pose: Pose; consejos: string[] }[] = [
  { desde: 90, nombre: "SENTADILLA", pose: "sentadilla", consejos: ["Espalda neutra", "Rodillas afuera"] },
  { desde: 225, nombre: "SWING CON PESA RUSA", pose: "swing", consejos: ["Empuja con la cadera", "Brazos relajados"] },
  { desde: 360, nombre: "PESO MUERTO", pose: "pesoMuerto", consejos: ["Cadera atrás", "Barra pegada a las piernas"] },
  { desde: 495, nombre: "PRESS ARRIBA", pose: "press", consejos: ["Abdomen firme", "No arquees la espalda"] },
  { desde: 630, nombre: "THRUSTER", pose: "thruster", consejos: ["Talones apoyados", "Usa el impulso de las piernas"] },
  { desde: 765, nombre: "BURPEES", pose: "burpee", consejos: ["Abdomen firme en la plancha", "Aterriza suave"] },
  { desde: F.seguimiento, nombre: "SEGUIMIENTO", pose: "sentadilla", consejos: [] },
];
const SEGUIMIENTO = ["Valoración inicial", "Plan ajustado cada semana", "+20 kg en sentadilla", "Sin dolor de espalda"];
const PISO_ARRIBA = 800;
const PISO_ABAJO = 1360;
const semana = (f: number) => Math.max(1, Math.min(12, 1 + Math.floor(((f - F.gancho) / (F.fin - F.gancho)) * 12)));
const fase = (f: number) => EJERCICIOS.filter((e) => f >= e.desde).length - 1 || 0;

const Carril: React.FC<{ y: number; titulo: string; rojo?: boolean; opacidad?: number }> = ({ y, titulo, rojo, opacidad = 1 }) => (
  <div style={{ position: "absolute", left: 110, top: y, opacity: opacidad, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 26, letterSpacing: "0.28em", color: "#ffffffcc" }}>
    {rojo ? <span style={{ color: COLORES.rojoTexto }}>● </span> : null}
    {titulo}
  </div>
);

const Grafico: React.FC<{ x: number; y: number; puntos: number[]; color: string; avance: number }> = ({ x, y, puntos, color, avance }) => {
  const w = 190, h = 90;
  const d = puntos.map((v, i) => `${i ? "L" : "M"}${(i / (puntos.length - 1)) * w} ${h - v * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <line x1={0} y1={h} x2={w} y2={h} stroke="#ffffff30" strokeWidth={2} />
      <path d={d} stroke={color} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - avance} />
    </svg>
  );
};

const Escena: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rep = 0.5 - 0.5 * Math.cos((2 * Math.PI * f) / 36);
  const rep2 = 0.5 - 0.5 * Math.cos((2 * Math.PI * (f + 9)) / 36);
  const s = semana(f);
  const fz = Math.max(0, fase(f));
  const ej = EJERCICIOS[fz];
  const avance = interpolate(f, [F.gancho, F.fin], [0, 1], clamp);
  const poseEj = ej.pose;
  const ciclo = ((f % 45) + 45) % 45 / 45; // fase del burpee (0..1)

  // ARRIBA: solo (la técnica se rompe; se lesiona en el peso muerto)
  const lesionado = f >= F.lesion;
  const malaArriba = interpolate(f, [F.gancho, F.lesion], [0.1, 1], clamp);
  const dolor = interpolate(f, [F.lesion, F.lesion + 8, F.lesion + 150], [0, 1, 0.4], clamp);
  const poseArriba = !lesionado ? EJERCICIOS[Math.min(fz, 2)].pose : f < F.lesion + 30 ? "dolor" : "sentado";
  const opArriba = interpolate(f, [F.lesion + 60, F.lesion + 90], [1, 0.55], clamp);

  // ABAJO: con coach
  const coach = spring({ frame: f - (F.gancho + 15), fps, durationInFrames: 12, config: { damping: 14 } });
  const enFase = f - ej.desde;
  const consejoIdx = Math.floor((enFase - 14) / 60);
  const consejo = enFase >= 14 && consejoIdx >= 0 && consejoIdx < ej.consejos.length ? ej.consejos[consejoIdx] : null;
  const seguimiento = f >= F.seguimiento;
  const amigo1 = interpolate(f, [F.seguimiento + 60, F.seguimiento + 75], [0, 1], clamp);
  const amigo2 = interpolate(f, [F.seguimiento + 100, F.seguimiento + 115], [0, 1], clamp);
  const cambio = interpolate(enFase, [0, 6], [0.4, 1], clamp); // parpadeo suave al cambiar de ejercicio

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={110} x2={930} y1={PISO_ARRIBA} y2={PISO_ARRIBA} stroke="#ffffff33" strokeWidth={3} />
        <line x1={110} x2={930} y1={PISO_ABAJO} y2={PISO_ABAJO} stroke="#ffffff33" strokeWidth={3} />
        {/* arriba */}
        <Monito x={330} y={PISO_ARRIBA} escala={1.2} pose={poseArriba} bajada={lesionado ? 0 : poseArriba === "burpee" ? ciclo : rep} mala={malaArriba} kilos={lesionado ? 0 : s * 0.7} dolor={dolor} opacidad={opArriba} />
        {lesionado && f >= F.lesion + 30 ? <circle cx={470} cy={PISO_ARRIBA - 24} r={36} fill="#0a0a0a" stroke="#ffffff88" strokeWidth={4} opacity={opArriba} /> : null}
        {/* abajo */}
        <Monito x={150} y={PISO_ABAJO} escala={1.05} pose={seguimiento ? "tablet" : "senalar"} gorra opacidad={coach} />
        <Monito x={360} y={PISO_ABAJO} escala={1.2} pose={poseEj} bajada={poseEj === "burpee" ? ciclo : rep} mala={0.04} kilos={s * 0.45} opacidad={cambio} />
        <Monito x={690} y={PISO_ABAJO} escala={0.65} pose="sentadilla" bajada={rep2} mala={0.04} kilos={2} opacidad={amigo1 * 0.8} />
        <Monito x={830} y={PISO_ABAJO} escala={0.6} pose="pesoMuerto" bajada={rep} mala={0.04} kilos={1} opacidad={amigo2 * 0.7} />
        {/* guía de postura (abajo, mientras corrige) */}
        {!seguimiento ? <line x1={400} y1={PISO_ABAJO - 340} x2={400} y2={PISO_ABAJO} stroke="#22c55e" strokeWidth={3} strokeDasharray="10 10" opacity={0.5 * coach} /> : null}
      </svg>

      <Carril y={340} titulo="ENTRENANDO SOLO" />
      <Carril y={900} titulo="CON COACH RXT" rojo />

      {consejo ? (
        <div key={consejo} style={{ position: "absolute", left: 480, top: PISO_ABAJO - 290, padding: "10px 20px", borderRadius: 14, background: "#ffffff", color: "#0a0a0a", fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 30, transform: `scale(${spring({ frame: (enFase - 14) % 60, fps, durationInFrames: 8, config: { damping: 12 } })})`, transformOrigin: "left center" }}>
          {consejo}
        </div>
      ) : null}

      {/* seguimiento: tarjetas que aparecen una a una */}
      {seguimiento ? (
        <div style={{ position: "absolute", left: 500, top: 925, display: "flex", flexDirection: "column", gap: 8 }}>
          {SEGUIMIENTO.map((t, i) => {
            const d = i * 30;
            if (enFase < d) return null;
            const e = spring({ frame: enFase - d, fps, durationInFrames: 10, config: { damping: 13 } });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)", fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 23, color: "#ffffff", opacity: e, transform: `translateX(${(1 - e) * 40}px)` }}>
                <span style={{ color: "#22c55e" }}>✓</span> {t}
              </div>
            );
          })}
        </div>
      ) : null}

      {lesionado ? (
        <div style={{ position: "absolute", left: 560, top: PISO_ARRIBA - 230, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 30, color: COLORES.rojoTexto, opacity: interpolate(f, [F.lesion + 20, F.lesion + 32], [0, 1], clamp) }}>
          Lesión
          <div style={{ fontWeight: 500, fontSize: 26, color: "#ffffffaa", marginTop: 6 }}>{f >= F.seguimiento ? "sin plan, sin seguimiento" : "3 meses sin entrenar"}</div>
        </div>
      ) : null}
      {f >= F.fin - 40 ? (
        <div style={{ position: "absolute", left: 110, top: PISO_ABAJO + 22, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 30, color: "#22c55e", opacity: interpolate(f, [F.fin - 40, F.fin - 28], [0, 1], clamp) }}>
          ✓ Sigue entrenando
          <div style={{ fontWeight: 500, fontSize: 26, color: "#ffffffaa", marginTop: 6 }}>y cada vez más fuerte</div>
        </div>
      ) : null}

      <Grafico x={700} y={410} puntos={[0.1, 0.25, 0.4, 0.55, 0.68, 0.78, 0.05, 0.05, 0.05]} color={lesionado ? COLORES.rojoTexto : "#ffffff"} avance={avance} />
      {!seguimiento ? <Grafico x={700} y={955} puntos={[0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88]} color="#22c55e" avance={avance} /> : null}

      {/* semana + ejercicio */}
      <div style={{ position: "absolute", top: 838, width: "100%", textAlign: "center", fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", color: "#ffffff88" }}>
        SEMANA <span style={{ fontFamily: FUENTES.editorial, fontSize: 40, letterSpacing: 0, color: "#ffffff" }}>{s}</span>
        <span style={{ margin: "0 14px", color: "#ffffff44" }}>·</span>
        <span key={ej.nombre} style={{ color: ej.nombre === "SEGUIMIENTO" ? "#22c55e" : "#ffffff", opacity: cambio }}>{ej.nombre}</span>
      </div>
    </AbsoluteFill>
  );
};

const TextoCentro: React.FC<{ arriba: string; clave: string; abajo?: string; duracion: number; fijo?: boolean }> = ({ arriba, clave, abajo, duracion, fijo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = fijo ? 1 : spring({ frame: f, fps, durationInFrames: 10, config: { damping: 15 } });
  const sale = interpolate(f, [duracion - 8, duracion], [1, 0], clamp);
  const escrito = fijo ? 100 : interpolate(f, [6, 16], [0, 100], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: `rgba(5,5,8,${0.72 * sale})` }}>
      <div style={{ position: "absolute", top: 760, width: "100%", transform: `translateY(calc(-50% + ${(1 - e) * 30}px))`, textAlign: "center", opacity: e * sale, padding: "0 120px", textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>
        <div style={{ fontFamily: FUENTES.editorial, fontWeight: 500, fontSize: 84, color: "#ffffff", lineHeight: 1.1 }}>{arriba}</div>
        <div style={{ fontFamily: FUENTES.manuscrita, fontSize: 170, color: COLORES.rojoTexto, lineHeight: 0.95, clipPath: `inset(-30% ${100 - escrito}% -30% -10%)` }}>{clave}</div>
        {abajo ? <div style={{ fontFamily: FUENTES.editorial, fontWeight: 500, fontSize: 84, color: "#ffffff", lineHeight: 1.1 }}>{abajo}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, durationInFrames: 12, config: { damping: 14 } });
  const b = spring({ frame: f - 10, fps, durationInFrames: 12, config: { damping: 12 } });
  const palabra = "VALORACIÓN";
  const letras = Math.min(palabra.length, Math.max(0, Math.floor((f - 24) / 2)));
  return (
    <AbsoluteFill style={{ background: "#050508" }}>
      <Img src={staticFile("marca/logo-rxt-blanco.png")} style={{ position: "absolute", left: 540 - 150, top: 420, width: 300, height: 120, opacity: a }} />
      <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", opacity: a }}>
        <div style={{ fontFamily: FUENTES.editorial, fontWeight: 500, fontSize: 90, color: "#ffffff" }}>Escríbenos</div>
        <div style={{ fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 120, color: COLORES.rojoTexto, letterSpacing: "0.02em", transform: `scale(${interpolate(b, [0, 1], [1.3, 1])})`, opacity: b, textShadow: `0 0 40px ${COLORES.rojo}88` }}>VALORACIÓN</div>
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 500, fontSize: 32, color: "#ffffffaa", marginTop: 14, opacity: b }}>y te agendamos tu primera evaluación</div>
      </div>
      <div style={{ position: "absolute", left: 140, right: 180, top: 1080, opacity: b }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 26px", borderRadius: 40, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.16)" }}>
          <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 38, color: "#ffffff" }}>
            {palabra.slice(0, letras)}
            <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: COLORES.rojoTexto }}>|</span>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 28, color: COLORES.azul }}>Enviar</div>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 26, color: "#ffffff88" }}>@roxet_trainingclub</div>
      </div>
    </AbsoluteFill>
  );
};

export const RxtLesion: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#050508" }}>
      <Escena />
      {/* gancho: se entiende sin audio, visible desde el cuadro 0 */}
      <Sequence durationInFrames={F.gancho}>
        <TextoCentro arriba="¿Alguna vez te" clave="lastimaste" abajo="entrenando?" duracion={F.gancho} fijo />
      </Sequence>
      <Sequence from={F.frase} durationInFrames={F.cta - F.frase}>
        <TextoCentro arriba="La técnica es lo que te deja entrenar" clave="muchos años." duracion={F.cta - F.frase} />
      </Sequence>
      <Sequence from={F.cta}>
        <Cta />
      </Sequence>
      <Acabado grano={0.05} />
      <Audio src={staticFile("musica-generada/rxt-lesion.wav")} volume={(fr) => interpolate(fr, [0, 20, DURACION_RXT_LESION - 25, DURACION_RXT_LESION], [0.6, 1, 1, 0], clamp)} />
      <Sequence from={F.lesion}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.9} />
      </Sequence>
      {[F.gancho - 4, F.frase - 4, F.cta - 4].map((w) => (
        <Sequence key={w} from={w} durationInFrames={20}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ opacity: interpolate(f, [DURACION_RXT_LESION - 6, DURACION_RXT_LESION], [0, 1], clamp), background: "#050508" }} />
    </AbsoluteFill>
  );
};
