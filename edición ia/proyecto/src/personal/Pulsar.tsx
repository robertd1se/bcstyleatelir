// Video personal: Pulsar NS (gris, morado y llantas verde lima). Video de producto sin voz (marca personal, ref. P4).
// Grabaciones: clientes/personal/grabaciones/DJI_20261024_*.mov (6 clips 4K verticales).
// Antes de renderizar hacen falta las copias en H.264 1080x1920 (public/entrada no se sube a Git), en orden de nombre:
//   i=1; for f in ../clientes/personal/grabaciones/DJI_*.mov; do ffmpeg -i "$f" -vf "scale=1080:1920:flags=lanczos,fps=30" \
//     -an -c:v libx264 -crf 16 -pix_fmt yuv420p public/entrada/pulsar/p$i.mp4; i=$((i+1)); done
// Música: python3 scripts/musica.py public/musica-generada/pulsar.wav --duracion 18.5 --bpm 120 --semilla 3
// A 120 BPM cada golpe dura 15 cuadros: todos los cortes caen en múltiplos de 15.
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Acabado } from "../series/ui/Acabado";

const G = 15; // un golpe (0,5 s)
const W = 3; // medio látigo: 3 cuadros de cada lado del corte (6 en total)
export const DURACION_PULSAR = 37 * G; // 18,5 s

const AMARILLO = "#F2C230";
const LIMA = "#B6F23A";

// --- fuentes (Google Fonts, OFL) ---
const useFuentes = () => {
  const [handle] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    const fuentes = [
      new FontFace("Anton", `url(${staticFile("fuentes/Anton.ttf")})`),
      new FontFace("Unbounded", `url(${staticFile("fuentes/Unbounded.ttf")})`, { weight: "200 900" }),
    ];
    Promise.all(fuentes.map((f) => f.load()))
      .then((cargadas) => {
        cargadas.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);
};

// --- planos ---
type Toma = {
  src: string; // p1..p6
  desde: number; // segundo del clip
  ini: number; // cuadro de entrada en el video
  fin: number; // cuadro de salida
  latigo?: "izquierda" | "derecha"; // entra con paneo látigo
  vel?: number; // velocidad (0,65 = cámara lenta)
  bn?: "todo" | "aColor"; // blanco y negro / pasa a color en 6 cuadros al entrar
  zoom?: [number, number];
};

const TOMAS: Toma[] = [
  // Gancho: blanco y negro sobre la intro filtrada de la música
  { src: "p1", desde: 0.3, ini: 0, fin: 2 * G, bn: "todo", zoom: [1.12, 1.04] }, // llanta lima trasera
  { src: "p4", desde: 2.6, ini: 2 * G, fin: 4 * G, bn: "todo" }, // la moto entra en cuadro
  // Entra el bombo: pasa a color con destello
  { src: "p3", desde: 0.9, ini: 4 * G, fin: 7 * G, bn: "aColor" }, // lateral contra la pared naranja
  { src: "p4", desde: 3.7, ini: 7 * G, fin: 10 * G, latigo: "derecha" }, // tres cuartos frontal
  // (ráfaga 1: 10G–11G)
  { src: "p5", desde: 5.6, ini: 11 * G, fin: 15 * G, vel: 0.8, zoom: [1.0, 1.1] }, // tanque, "Pulsar"
  { src: "p2", desde: 0.2, ini: 15 * G, fin: 18 * G }, // tres cuartos trasero
  { src: "p6", desde: 0.6, ini: 18 * G, fin: 21 * G, latigo: "izquierda" }, // frente, ángulo holandés
  // (ráfaga 2: 21G–22G)
  { src: "p6", desde: 4.4, ini: 22 * G, fin: 25 * G, latigo: "derecha", vel: 1.2 }, // giro cenital
  // (ráfaga 3: 25G–26G)
  // Plano final largo en cámara lenta (respira)
  { src: "p1", desde: 4.4, ini: 26 * G, fin: 37 * G, vel: 0.62, zoom: [1.0, 1.06] }, // vuelta hasta el frente
];

// Ráfagas de 1–2 cuadros entre detalles (ref. P4)
const RAFAGAS: { ini: number; cortes: [string, number][] }[] = [
  { ini: 10 * G, cortes: [["p5", 7.6], ["p2", 1.1], ["p6", 6.6], ["p1", 7.2], ["p5", 8.3], ["p3", 2.6], ["p2", 2.4], ["p6", 2.1]] },
  { ini: 21 * G, cortes: [["p1", 0.8], ["p5", 7.0], ["p6", 7.6], ["p3", 3.1], ["p2", 0.6], ["p5", 8.6], ["p4", 5.2], ["p1", 6.6]] },
  { ini: 25 * G, cortes: [["p6", 5.6], ["p5", 7.9], ["p2", 1.8], ["p1", 1.4], ["p6", 3.2], ["p3", 1.6], ["p5", 6.5], ["p1", 5.0]] },
];
const largoCorte = (i: number) => (i % 3 === 2 ? 1 : 2); // 2,2,1,2,2,1… = 15 cuadros con 8 cortes

const Video: React.FC<{ src: string; desde: number; vel?: number; estilo?: React.CSSProperties }> = ({ src, desde, vel = 1, estilo }) => (
  <OffthreadVideo
    src={staticFile(`entrada/pulsar/${src}.mp4`)}
    trimBefore={Math.round(desde * 30)}
    playbackRate={vel}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover", ...estilo }}
  />
);

const latigoX = (p: number) => Math.sin(Math.PI * p) * 60; // desenfoque máximo en el medio

const PlanoToma: React.FC<{ t: Toma; saleLatigo?: Toma["latigo"]; entra: number; dur: number }> = ({ t, saleLatigo, entra, dur }) => {
  const frame = useCurrentFrame(); // 0 = inicio de la secuencia (incluye el medio látigo de entrada)
  const local = frame - entra; // 0 = cuadro del corte
  const [z0, z1] = t.zoom ?? [1.0, 1.08];
  const escala = interpolate(local, [0, t.fin - t.ini], [z0, z1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let x = 0;
  let blur = 0;
  if (t.latigo && local < W) {
    const p = interpolate(local, [-W, W], [0, 1]);
    const s = t.latigo === "izquierda" ? -1 : 1;
    x = -s * (1 - p) * 100;
    blur = latigoX(p);
  }
  if (saleLatigo && frame >= dur - 2 * W) {
    const p = interpolate(frame, [dur - 2 * W, dur], [0, 1]);
    const s = saleLatigo === "izquierda" ? -1 : 1;
    x = s * p * 100;
    blur = latigoX(p);
  }
  const gris = t.bn === "todo" ? 1 : t.bn === "aColor" ? interpolate(local, [0, 6], [1, 0], { extrapolateRight: "clamp" }) : 0;
  const id = `lat-${t.src}-${t.ini}`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-50%" y="0" width="200%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${x}%)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
        <AbsoluteFill style={{ transform: `scale(${escala})`, filter: `grayscale(${gris}) contrast(${1.1 + gris * 0.15})` }}>
          <Video src={t.src} desde={t.desde} vel={t.vel} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Rafaga: React.FC<{ cortes: [string, number][] }> = ({ cortes }) => {
  let ini = 0;
  return (
    <>
      {cortes.map(([src, desde], i) => {
        const dur = largoCorte(i);
        const desde0 = ini;
        ini += dur;
        const dx = (random(`rx${src}${desde}`) - 0.5) * 40;
        const dy = (random(`ry${src}${desde}`) - 0.5) * 40;
        return (
          <Sequence key={i} from={desde0} durationInFrames={dur}>
            <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
              <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${1.16 + (i % 2) * 0.08})` }}>
                <Video src={src} desde={desde} />
              </AbsoluteFill>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

// --- efectos ---
// Destello de luz cálida (#FFB347 → #FFE08A) en modo pantalla
const LuzCalida: React.FC<{ dur?: number; lado?: "izq" | "der" }> = ({ dur = 10, lado = "der" }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 2, dur], [0, 1, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const cx = lado === "der" ? 85 : 15;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: a,
        background: `radial-gradient(ellipse 70% 55% at ${cx}% 35%, #FFE08A 0%, #FFB347 35%, rgba(255,120,40,0.35) 60%, transparent 80%)`,
      }}
    />
  );
};

// Glitch (ref. P5): bloques de píxeles desplazados y negativo; como acento
const Glitch: React.FC<{ t: Toma; tipo: "bloques" | "negativo"; dur: number }> = ({ t, tipo, dur }) => {
  const frame = useCurrentFrame();
  if (tipo === "negativo") {
    return (
      <AbsoluteFill style={{ filter: "invert(1) hue-rotate(180deg) contrast(1.3) saturate(1.6)" }}>
        <Video src={t.src} desde={t.desde} />
      </AbsoluteFill>
    );
  }
  const franjas = 6;
  return (
    <AbsoluteFill>
      {Array.from({ length: franjas }).map((_, i) => {
        const y0 = random(`gy${i}${frame}`) * 90;
        const alto = 3 + random(`gh${i}${frame}`) * 9;
        const dx = (random(`gx${i}${frame}`) - 0.5) * 220;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${y0}% 0 ${Math.max(0, 100 - y0 - alto)}% 0)`, transform: `translateX(${dx}px)` }}>
            <AbsoluteFill style={{ filter: i % 2 ? "saturate(2.2) hue-rotate(40deg)" : undefined, transform: `scale(${1 + (frame % dur) * 0.01})` }}>
              <Video src={t.src} desde={t.desde + 0.1} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const Blanco: React.FC = () => <AbsoluteFill style={{ backgroundColor: "white", opacity: 0.92 }} />;

// Grado de cine: teal & orange, contraste, negros apenas levantados
const Grado: React.FC = () => (
  <>
    <AbsoluteFill style={{ mixBlendMode: "soft-light", background: "linear-gradient(180deg, rgba(0,95,110,0.45) 0%, rgba(0,70,90,0.30) 55%, rgba(255,150,70,0.30) 100%)" }} />
    <AbsoluteFill style={{ mixBlendMode: "screen", backgroundColor: "rgba(12,22,28,0.10)" }} />
  </>
);

// --- texto cinético (P1/P6) ---
const TextoAncho: React.FC<{ texto: string; invertido?: boolean; y: number }> = ({ texto, invertido, y }) => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: y }}>
      <div
        style={{
          fontFamily: "Unbounded",
          fontWeight: 600,
          fontSize: 52,
          letterSpacing: "0.18em",
          color: invertido ? "#0A0A0A" : "white",
          backgroundColor: invertido ? "white" : "transparent",
          padding: "14px 26px 14px 34px",
          textShadow: invertido ? undefined : "0 4px 18px rgba(0,0,0,0.7)",
          opacity: entra,
          transform: `translateY(${(1 - entra) * 16}px)`,
          filter: `blur(${(1 - entra) * 6}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// Cortina diagonal de 6 cuadros entre frases
const Cortina: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 6], [-30, 130], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ background: `linear-gradient(120deg, transparent ${p - 25}%, #0A0A0A ${p - 12}%, #0A0A0A ${p}%, transparent ${p + 1}%)` }} />;
};

// Título final tipo póster de película
const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const golpe = interpolate(frame, [0, 6], [1.25, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  const a = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const creditos = interpolate(frame, [8, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barras = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const altoBarra = ((1920 - 1080 / 2.39) / 2) * 0.42 * barras; // barras de cine discretas
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: altoBarra, backgroundColor: "#0A0A0A" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: altoBarra, backgroundColor: "#0A0A0A" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 1010 }}>
        <div
          style={{
            fontFamily: "Anton",
            fontSize: 250,
            lineHeight: 1,
            letterSpacing: "0.04em",
            color: AMARILLO,
            opacity: a,
            transform: `scale(${golpe})`,
            textShadow: "0 0 40px rgba(242,194,48,0.35), 0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          PULSAR
        </div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 22, opacity: creditos }}>
          <div style={{ width: 60, height: 3, backgroundColor: LIMA, boxShadow: `0 0 12px ${LIMA}` }} />
          <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, letterSpacing: "0.42em", color: "white", paddingLeft: "0.42em" }}>
            GRIS · MORADO · LIMA
          </div>
          <div style={{ width: 60, height: 3, backgroundColor: LIMA, boxShadow: `0 0 12px ${LIMA}` }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Golpes de sonido: el bombo entra en 4G; el título en 30G
const INICIO_TITULO = 30 * G;

export const Pulsar: React.FC = () => {
  useFuentes();
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const volMusica = interpolate(frame, [durationInFrames - 45, durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Imagen */}
      <AbsoluteFill style={{ filter: "contrast(1.1) saturate(0.95)" }}>
        {TOMAS.map((t, i) => {
          const sig = TOMAS[i + 1];
          const saleLatigo = sig && sig.ini === t.fin ? sig.latigo : undefined;
          const entra = t.latigo ? W : 0;
          const from = t.ini - entra;
          const dur = t.fin + (saleLatigo ? W : 0) - from;
          return (
            <Sequence key={i} from={from} durationInFrames={dur}>
              <PlanoToma t={t} saleLatigo={saleLatigo} entra={entra} dur={dur} />
            </Sequence>
          );
        })}
        {RAFAGAS.map((r, i) => (
          <Sequence key={`r${i}`} from={r.ini} durationInFrames={G}>
            <Rafaga cortes={r.cortes} />
          </Sequence>
        ))}
        {/* Glitches: máximo 4 */}
        <Sequence from={15 * G} durationInFrames={3}>
          <Glitch t={TOMAS[5]} tipo="negativo" dur={3} />
        </Sequence>
        <Sequence from={15 * G + 3} durationInFrames={4}>
          <Glitch t={TOMAS[5]} tipo="bloques" dur={4} />
        </Sequence>
        <Sequence from={22 * G} durationInFrames={5}>
          <Glitch t={TOMAS[7]} tipo="bloques" dur={5} />
        </Sequence>
        <Grado />
      </AbsoluteFill>

      {/* Sobreexposición blanca de 1 cuadro al final de cada ráfaga */}
      {RAFAGAS.map((r, i) => (
        <Sequence key={`b${i}`} from={r.ini + G - 1} durationInFrames={1}>
          <Blanco />
        </Sequence>
      ))}

      {/* Destellos cálidos en los 3 golpes más fuertes */}
      <Sequence from={4 * G} durationInFrames={10}>
        <LuzCalida lado="der" />
      </Sequence>
      <Sequence from={11 * G} durationInFrames={10}>
        <LuzCalida lado="izq" />
      </Sequence>
      <Sequence from={INICIO_TITULO} durationInFrames={14}>
        <LuzCalida dur={14} lado="der" />
      </Sequence>

      {/* Gancho: texto ancho, primero blanco y en el golpe invertido */}
      <Sequence durationInFrames={2 * G}>
        <TextoAncho texto="NO ES SOLO" y={760} />
      </Sequence>
      <Sequence from={2 * G - 3} durationInFrames={6}>
        <Cortina />
      </Sequence>
      <Sequence from={2 * G} durationInFrames={2 * G}>
        <TextoAncho texto="UNA MOTO." invertido y={760} />
      </Sequence>

      <Sequence from={INICIO_TITULO}>
        <Titulo />
      </Sequence>

      <Acabado grano={0.07} />

      {/* Sonido */}
      <Audio src={staticFile("musica-generada/pulsar.wav")} volume={volMusica} />
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.6} />
      <Sequence from={4 * G}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.9} />
      </Sequence>
      <Sequence from={INICIO_TITULO}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={1} />
      </Sequence>
      {TOMAS.filter((t) => t.latigo).map((t) => (
        <Sequence key={`w${t.ini}`} from={t.ini - W - 2}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.7} />
        </Sequence>
      ))}
      {RAFAGAS.map((r) => (
        <Sequence key={`rw${r.ini}`} from={r.ini - 2}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
