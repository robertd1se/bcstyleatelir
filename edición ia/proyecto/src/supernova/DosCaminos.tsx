// Formato "Dos caminos" de Supernova (ref. S1, clientes/supernova/marca.md): motion graphics sin voz.
// Dos teléfonos ("sin app" vs. "con Supernova"), cámara virtual que entra a uno, pasa al otro y se aleja,
// y cierre con logo + "Escríbeme APP por DM". Todo el texto sale del guion JSON (clientes/supernova/guiones/*.json),
// así cada reel nuevo es solo un archivo de datos. Renderizar con: node scripts/supernova.mjs <guion.json>
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Acabado } from "../series/ui/Acabado";
import { LogoSupernova } from "./LogoSupernova";

export type GuionDosCaminos = {
  id: string;
  gancho: string[]; // 2 etiquetas blancas, máx. 7 palabras entre las dos
  negocio: string; // "Tu negocio", "Tu barbería"…
  etiquetaSin: string; // "sin app"
  etiquetaCon: string; // "con Supernova"
  cliente: string; // "Cliente nuevo"
  mensajes: string[]; // 3–4 mensajes que nadie contesta
  espera: string[]; // ["4 mensajes", "y sigue esperando"]
  perdida: string; // "Se fue con otro"
  horaInicio: string; // "10:12"
  horaFinSin: string; // hora a la que llega el reloj del lado "sin app" ("12:48")
  horaFinCon: string; // ídem del lado "con Supernova" ("10:14")
  respuesta: string; // mensaje automático con el link: "Aquí está todo 👇"
  app: { link: string; nombre: string; sub: string; items: string[]; boton: string; confirmacion: string };
  resuelto: string[]; // ["Todo resuelto", "desde un link"]
  comparacion: string[]; // ["Sin mensajes. Sin esperar.", "Todo desde un link."]
  cierre: { linea1: string; destacado: string; palabra: string; usuario: string }; // "Tu negocio," "en un solo link." "APP"
  musica: string | null; // ruta dentro de public/ (la genera scripts/supernova.mjs)
};

export const C = {
  fondo: "#0B0814",
  brillo: "#2A1550",
  morado: "#8B5CF6",
  lila: "#B49DFC",
  rojo: "#E5484D",
  telOscuro: "#0D0E13",
  telClaro: "#F2F0EE",
  blanco: "#FFFFFF",
};
const FUENTE = "Inter, sans-serif";

// --- línea de tiempo (cuadros a 30 fps) ---
const T = {
  camA: [55, 78], // la cámara entra al teléfono "sin app"
  mensajes: [88, 113, 138, 163],
  espera: 183,
  perdida: 215,
  camB: [226, 250], // pasa al teléfono "con Supernova"
  msgB: 252,
  respuesta: 272,
  app: 296, // la pantalla se vuelve la app
  items: [318, 332, 346],
  toque: 366,
  confirmacion: 372,
  resuelto: 392,
  camFuera: [412, 438], // se aleja para comparar
  comparacion: 436,
  cierre: 492,
};
export const DURACION_DOS_CAMINOS = 568; // 18,9 s

// --- cámara virtual ---
// Mundo: los dos teléfonos (420x860) con centros en x=±260, y=0. La cámara pone el punto (x, y) del mundo
// en (540, ancla) de la pantalla con escala s.
type Cam = { x: number; y: number; s: number; ancla: number };
const GENERAL: Cam = { x: 0, y: 0, s: 0.78, ancla: 1100 };
const EN_A: Cam = { x: -260, y: 0, s: 1.18, ancla: 1065 };
const EN_B: Cam = { x: 260, y: 0, s: 1.18, ancla: 1065 };
const PLANOS_CAM: [number, Cam][] = [
  [0, GENERAL],
  [T.camA[0], GENERAL],
  [T.camA[1], EN_A],
  [T.camB[0], EN_A],
  [T.camB[1], EN_B],
  [T.camFuera[0], EN_B],
  [T.camFuera[1], GENERAL],
];
const camara = (f: number): Cam => {
  let i = 0;
  while (i < PLANOS_CAM.length - 1 && f >= PLANOS_CAM[i + 1][0]) i++;
  const [t0, a] = PLANOS_CAM[i];
  const sig = PLANOS_CAM[i + 1];
  if (!sig) return a;
  const [t1, b] = sig;
  const p = interpolate(f, [t0, t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const m = (k: keyof Cam) => a[k] + (b[k] - a[k]) * p;
  // deriva suave para que nunca quede quieta
  return { x: m("x") + Math.sin(f / 40) * 6, y: m("y") + Math.cos(f / 52) * 5, s: m("s") * (1 + Math.sin(f / 60) * 0.006), ancla: m("ancla") };
};

// --- utilidades ---
const usePop = (desde: number, dur = 8) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - desde, fps, config: { damping: 14, stiffness: 180 }, durationInFrames: dur * 2 });
  return frame < desde ? 0 : p;
};
const aMin = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
};
const aHora = (min: number) => {
  const m = Math.floor(min) % (24 * 60);
  const hh = Math.floor(m / 60) % 12 || 12;
  return `${hh}:${String(m % 60).padStart(2, "0")}`;
};

// Etiqueta: caja blanca (o morada) con texto en Inter 800
const Etiqueta: React.FC<{ texto: string; tamaño: number; morada?: boolean; desde: number }> = ({ texto, tamaño, morada, desde }) => {
  const p = usePop(desde);
  return (
    <div
      style={{
        fontFamily: FUENTE,
        fontWeight: 800,
        fontSize: tamaño,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        padding: `${tamaño * 0.12}px ${tamaño * 0.28}px`,
        borderRadius: tamaño * 0.14,
        backgroundColor: morada ? C.morado : C.blanco,
        color: morada ? C.blanco : "#0A0A0A",
        boxShadow: morada ? `0 0 40px ${C.morado}66` : "0 10px 30px rgba(0,0,0,0.35)",
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px) scale(${0.9 + p * 0.1})`,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

// Reloj analógico con la hora; con "▶▶" mientras el tiempo corre rápido
const Reloj: React.FC<{ g: GuionDosCaminos }> = ({ g }) => {
  const frame = useCurrentFrame();
  const ini = aMin(g.horaInicio);
  const sin = interpolate(frame, [T.mensajes[0], T.espera + 20], [ini, aMin(g.horaFinSin)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const con = interpolate(frame, [T.msgB, T.confirmacion], [ini, aMin(g.horaFinCon)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enB = frame >= T.camB[0];
  const min = frame >= T.camFuera[1] ? aMin(g.horaFinCon) : enB ? con : sin;
  const rapido = !enB && frame > T.mensajes[0] && frame < T.espera + 20;
  const angMin = (min % 60) * 6;
  const angHora = ((min / 60) % 12) * 30;
  const salida = interpolate(frame, [T.cierre - 6, T.cierre + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 318, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: salida }}>
      <svg width={84} height={84} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#F4F3F7" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="50" y1="7" x2="50" y2={i % 3 === 0 ? 15 : 11} stroke="#1A1A22" strokeWidth={i % 3 === 0 ? 3 : 1.6} transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <line x1="50" y1="50" x2="50" y2="27" stroke="#1A1A22" strokeWidth="4.5" strokeLinecap="round" transform={`rotate(${angHora} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="14" stroke="#1A1A22" strokeWidth="3" strokeLinecap="round" transform={`rotate(${angMin} 50 50)`} />
        <circle cx="50" cy="50" r="4.5" fill={C.morado} />
      </svg>
      <div style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 40, color: C.blanco, fontVariantNumeric: "tabular-nums", width: 110 }}>{aHora(min)}</div>
      <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 34, color: C.lila, opacity: rapido ? 0.6 + 0.4 * Math.sin(frame / 3) : 0, width: 50 }}>▶▶</div>
    </div>
  );
};

// --- teléfonos ---
const ANCHO_TEL = 420;
const ALTO_TEL = 860;

const Telefono: React.FC<{ claro: boolean; children: React.ReactNode }> = ({ claro, children }) => (
  <div
    style={{
      width: ANCHO_TEL,
      height: ALTO_TEL,
      borderRadius: 64,
      padding: 10,
      background: "linear-gradient(160deg, #3A3A46, #15151C 40%, #2B2B35)",
      boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54, overflow: "hidden", backgroundColor: claro ? C.telClaro : C.telOscuro }}>
      {children}
      <div style={{ position: "absolute", top: 16, left: "50%", width: 116, height: 34, marginLeft: -58, borderRadius: 20, backgroundColor: "#000" }} />
    </div>
  </div>
);

const Encabezado: React.FC<{ nombre: string; claro: boolean }> = ({ nombre, claro }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "70px 26px 18px", borderBottom: `1px solid ${claro ? "#E2DFDA" : "#1E1F26"}` }}>
    <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(140deg,#D8A777,#B88456)", color: "white", fontFamily: FUENTE, fontWeight: 700, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
    <div>
      <div style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: 25, color: claro ? "#111" : "#F2F2F5" }}>{nombre}</div>
      <div style={{ fontFamily: FUENTE, fontWeight: 500, fontSize: 17, color: claro ? "#8B8790" : "#7A7B86" }}>en línea</div>
    </div>
  </div>
);

const Burbuja: React.FC<{ texto: string; desde: number; claro?: boolean; hora: string; propia?: boolean; children?: React.ReactNode }> = ({ texto, desde, claro, hora, propia, children }) => {
  const p = usePop(desde, 7);
  return (
    <div style={{ display: "flex", justifyContent: propia ? "flex-end" : "flex-start", opacity: p, transform: `translateY(${(1 - p) * 18}px) scale(${0.85 + 0.15 * p})`, transformOrigin: propia ? "right bottom" : "left bottom" }}>
      <div
        style={{
          maxWidth: 320,
          padding: "13px 18px 8px",
          borderRadius: 22,
          backgroundColor: propia ? "#EDE7FF" : claro ? "#FFFFFF" : "#1E1F27",
          color: claro || propia ? "#16131F" : "#ECECF1",
          fontFamily: FUENTE,
          fontWeight: 500,
          fontSize: 24,
          lineHeight: 1.25,
          boxShadow: claro ? "0 2px 6px rgba(0,0,0,0.06)" : undefined,
        }}
      >
        {texto}
        {children}
        <div style={{ fontSize: 14, textAlign: "right", opacity: 0.5, marginTop: 4 }}>{hora}</div>
      </div>
    </div>
  );
};

// Teléfono "sin app": mensajes que nadie contesta → espera → se fue con otro
const PantallaSin: React.FC<{ g: GuionDosCaminos }> = ({ g }) => {
  const frame = useCurrentFrame();
  const ini = aMin(g.horaInicio);
  const fin = aMin(g.horaFinSin);
  const desenfoque = interpolate(frame, [T.perdida, T.perdida + 10], [0, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pEspera = usePop(T.espera, 9);
  const pPerdida = usePop(T.perdida + 4, 9);
  return (
    <Telefono claro={false}>
      <div style={{ filter: desenfoque > 0.2 ? `blur(${desenfoque}px)` : undefined, opacity: 1 - desenfoque / 20, height: "100%" }}>
        <Encabezado nombre={g.cliente} claro={false} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 20px" }}>
          {g.mensajes.slice(0, 4).map((m, i) => (
            <Burbuja key={i} texto={m} desde={T.mensajes[i]} hora={aHora(ini + ((fin - ini) * i) / Math.max(1, g.mensajes.length - 1))} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 610, opacity: pEspera, transform: `scale(${0.8 + 0.2 * pEspera})` }}>
        <div style={{ backgroundColor: C.rojo, borderRadius: 18, padding: "14px 10px 16px", textAlign: "center", boxShadow: `0 10px 40px ${C.rojo}55` }}>
          <div style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 21, color: "#FFE3E3" }}>{g.espera[0]}</div>
          <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 33, color: C.blanco }}>{g.espera[1]}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", opacity: pPerdida, transform: `scale(${1.3 - 0.3 * pPerdida})` }}>
        <div style={{ border: `3px solid ${C.rojo}`, borderRadius: 16, padding: "12px 26px", backgroundColor: "rgba(13,14,19,0.85)", fontFamily: FUENTE, fontWeight: 800, fontSize: 32, color: C.blanco }}>{g.perdida}</div>
      </div>
    </Telefono>
  );
};

// Teléfono "con Supernova": llega el link → la pantalla se vuelve la app → apartar cita
const PantallaCon: React.FC<{ g: GuionDosCaminos }> = ({ g }) => {
  const frame = useCurrentFrame();
  const ini = aMin(g.horaInicio);
  const pApp = interpolate(frame, [T.app, T.app + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const toque = interpolate(frame, [T.toque, T.toque + 4, T.toque + 9], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pConf = usePop(T.confirmacion, 8);
  const pRes = usePop(T.resuelto, 10);
  const dedo = interpolate(frame, [T.toque - 14, T.toque, T.toque + 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Telefono claro>
      {/* chat */}
      <div style={{ height: "100%", opacity: 1 - pApp, transform: `scale(${1 - 0.06 * pApp})` }}>
        <Encabezado nombre={g.cliente} claro />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 20px" }}>
          <Burbuja texto={g.mensajes[0]} desde={T.msgB} claro hora={aHora(ini)} />
          <Burbuja texto={g.respuesta} desde={T.respuesta} propia hora={aHora(ini)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, padding: 10, borderRadius: 14, backgroundColor: "white" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LogoSupernova tamaño={34} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 19 }}>{g.app.nombre.charAt(0) + g.app.nombre.slice(1).toLowerCase()} · App</div>
                <div style={{ fontSize: 15, opacity: 0.55 }}>Toca para abrir</div>
              </div>
            </div>
          </Burbuja>
        </div>
      </div>
      {/* app */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#0E0B18", opacity: pApp, transform: `translateY(${(1 - pApp) * 60}px)`, padding: "74px 26px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FUENTE, fontSize: 17, color: "#A7A3B5", backgroundColor: "#1A1726", borderRadius: 14, padding: "5px 14px" }}>🔒 {g.app.link}</div>
        <div style={{ marginTop: 22, width: 92, height: 92, borderRadius: 46, backgroundColor: "#050408", border: "1px solid #2A2638", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LogoSupernova tamaño={60} giro={frame * 0.6} />
        </div>
        <div style={{ marginTop: 18, fontFamily: FUENTE, fontWeight: 800, fontSize: 34, letterSpacing: "0.14em", color: C.blanco, paddingLeft: "0.14em" }}>{g.app.nombre}</div>
        <div style={{ fontFamily: FUENTE, fontWeight: 500, fontSize: 18, color: "#9C98AA" }}>{g.app.sub}</div>
        <div style={{ marginTop: 22, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          {g.app.items.slice(0, 3).map((it, i) => (
            <Item key={i} texto={it} desde={T.items[i]} />
          ))}
        </div>
        <div style={{ marginTop: 18, width: "100%", borderRadius: 30, backgroundColor: C.blanco, padding: "16px 0", textAlign: "center", fontFamily: FUENTE, fontWeight: 800, fontSize: 25, color: "#111", transform: `scale(${toque})`, opacity: usePop(T.items[2] + 8) }}>{g.app.boton}</div>
        <div style={{ marginTop: 12, fontFamily: FUENTE, fontWeight: 600, fontSize: 18, color: C.lila, opacity: pConf }}>✓ {g.app.confirmacion}</div>
        <div style={{ position: "absolute", bottom: 46, left: 70, right: 70, borderRadius: 22, backgroundColor: C.morado, padding: "14px 0 16px", textAlign: "center", opacity: pRes, transform: `scale(${0.8 + 0.2 * pRes})`, boxShadow: `0 10px 40px ${C.morado}88` }}>
          <div style={{ fontFamily: FUENTE, fontWeight: 600, fontSize: 21, color: "#EFE9FF" }}>{g.resuelto[0]}</div>
          <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 33, color: C.blanco }}>{g.resuelto[1]}</div>
        </div>
      </div>
      {/* dedo que toca el botón */}
      <div style={{ position: "absolute", left: 175, top: 556, width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.35)", border: "2px solid rgba(255,255,255,0.8)", opacity: dedo, transform: `scale(${1.4 - 0.4 * dedo})` }} />
    </Telefono>
  );
};

const Item: React.FC<{ texto: string; desde: number }> = ({ texto, desde }) => {
  const p = usePop(desde, 7);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: 14, backgroundColor: "#16131F", opacity: 0.35 + 0.65 * p }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: p > 0.05 ? C.morado : "#2A2638", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 900, transform: `scale(${0.6 + 0.4 * p})` }}>✓</div>
      <div style={{ fontFamily: FUENTE, fontWeight: 500, fontSize: 23, color: "#EDEBF3" }}>{texto}</div>
    </div>
  );
};

// Etiqueta sobre cada teléfono: "✕ Tu negocio / sin app" o "✓ Tu negocio / con Supernova"
const EtiquetaTel: React.FC<{ negocio: string; sub: string; bien: boolean }> = ({ negocio, sub, bien }) => (
  <div style={{ position: "absolute", top: -102, left: 0, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: C.blanco, borderRadius: 8, padding: "6px 14px 6px 10px", fontFamily: FUENTE, fontWeight: 800, fontSize: 32, color: "#0A0A0A" }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: bien ? C.morado : C.rojo, color: "white", fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{bien ? "✓" : "✕"}</div>
      {negocio}
    </div>
    <div style={{ marginTop: 2, backgroundColor: bien ? C.morado : C.rojo, borderRadius: 6, padding: "3px 10px", fontFamily: FUENTE, fontWeight: 700, fontSize: 21, color: C.blanco }}>{sub}</div>
  </div>
);

const Mundo: React.FC<{ g: GuionDosCaminos }> = ({ g }) => {
  const frame = useCurrentFrame();
  const cam = camara(frame);
  // el teléfono que no se mira se oscurece un poco
  const focoA = interpolate(frame, [T.camA[0], T.camA[1], T.camB[0], T.camB[1], T.camFuera[0], T.camFuera[1]], [1, 1, 1, 0.45, 0.45, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const focoB = interpolate(frame, [T.camA[0], T.camA[1], T.camB[0], T.camB[1]], [1, 0.45, 0.45, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tel = (x: number, foco: number, hijo: React.ReactNode) => (
    <div style={{ position: "absolute", left: x - ANCHO_TEL / 2, top: -ALTO_TEL / 2, width: ANCHO_TEL, height: ALTO_TEL, opacity: 0.25 + 0.75 * foco, filter: foco < 0.99 ? `brightness(${0.6 + 0.4 * foco})` : undefined }}>
      {hijo}
    </div>
  );
  return (
    <AbsoluteFill style={{ transform: `translate(${540 - cam.x * cam.s}px, ${cam.ancla - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: "0 0" }}>
      {tel(-260, focoA, <><EtiquetaTel negocio={g.negocio} sub={g.etiquetaSin} bien={false} /><PantallaSin g={g} /></>)}
      {tel(260, focoB, <><EtiquetaTel negocio={g.negocio} sub={g.etiquetaCon} bien /><PantallaCon g={g} /></>)}
    </AbsoluteFill>
  );
};

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const x = 30 + Math.sin(frame / 70) * 12;
  const y = 45 + Math.cos(frame / 90) * 8;
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at ${x}% ${y}%, ${C.brillo} 0%, ${C.fondo} 60%, #050309 100%)` }} />;
};

const Cierre: React.FC<{ g: GuionDosCaminos }> = ({ g }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const l1 = usePop(6, 8);
  const l2 = usePop(11, 8);
  const cta = usePop(20, 8);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 560 }}>
      <div style={{ transform: `scale(${0.5 + 0.5 * logo}) rotate(${(1 - logo) * -40}deg)`, opacity: logo, filter: `drop-shadow(0 0 30px ${C.morado})` }}>
        <LogoSupernova tamaño={200} giro={Math.sin(frame / 20) * 4} />
      </div>
      <div style={{ marginTop: 40, fontFamily: FUENTE, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", lineHeight: 1.02, textAlign: "center", color: C.blanco }}>
        <div style={{ opacity: l1, transform: `translateY(${(1 - l1) * 24}px)` }}>{g.cierre.linea1}</div>
        <div style={{ opacity: l2, transform: `translateY(${(1 - l2) * 24}px)` }}>
          {g.cierre.destacado.split(" ").map((w, i, arr) => (
            <span key={i} style={{ color: i === 0 ? C.blanco : C.lila }}>
              {w}
              {i < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 22, opacity: cta, transform: `scale(${0.9 + 0.1 * cta})` }}>
        <span style={{ fontFamily: FUENTE, fontWeight: 500, fontSize: 40, color: "#E4E1EC" }}>Escríbeme</span>
        <span style={{ fontFamily: FUENTE, fontWeight: 900, fontSize: 58, color: "#0A0A0A", backgroundColor: C.blanco, borderRadius: 20, padding: "8px 26px", boxShadow: `0 0 40px ${C.lila}88` }}>{g.cierre.palabra}</span>
        <span style={{ fontFamily: FUENTE, fontWeight: 500, fontSize: 40, color: "#E4E1EC" }}>por DM</span>
      </div>
      <div style={{ marginTop: 24, fontFamily: FUENTE, fontWeight: 600, fontSize: 30, color: "#B9B5C6", opacity: cta }}>{g.cierre.usuario}</div>
    </AbsoluteFill>
  );
};

export const DosCaminos: React.FC<GuionDosCaminos> = (g) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const salidaGancho = interpolate(frame, [T.camA[0] - 4, T.camA[0] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const salidaComp = interpolate(frame, [T.cierre - 8, T.cierre + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const velo = interpolate(frame, [T.cierre - 8, T.cierre + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const volMusica = interpolate(frame, [0, 8, durationInFrames - 40, durationInFrames - 1], [0.6, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pops: number[] = [...T.mensajes.slice(0, g.mensajes.length), T.msgB, T.respuesta, ...T.items, T.confirmacion];
  return (
    <AbsoluteFill style={{ backgroundColor: C.fondo, overflow: "hidden" }}>
      <Fondo />
      <AbsoluteFill style={{ filter: velo > 0.01 ? `blur(${velo * 14}px)` : undefined, opacity: 1 - velo * 0.75 }}>
        <Mundo g={g} />
        <Reloj g={g} />
        {/* gancho */}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 452, gap: 12, opacity: salidaGancho }}>
          <Etiqueta texto={g.gancho[0]} tamaño={70} desde={0} />
          <Etiqueta texto={g.gancho[1]} tamaño={70} desde={5} />
        </AbsoluteFill>
        {/* comparación */}
        {frame >= T.comparacion - 2 ? (
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 452, gap: 12, opacity: salidaComp }}>
            <Etiqueta texto={g.comparacion[0]} tamaño={58} desde={T.comparacion} />
            <Etiqueta texto={g.comparacion[1]} tamaño={58} desde={T.comparacion + 6} morada />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
      <Sequence from={T.cierre}>
        <Cierre g={g} />
      </Sequence>
      <Acabado grano={0.05} />

      {/* sonido */}
      {g.musica ? <Audio src={staticFile(g.musica)} volume={volMusica} /> : null}
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.55} />
      {[T.camA[0], T.camB[0], T.camFuera[0]].map((t) => (
        <Sequence key={`w${t}`} from={t - 2}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} />
        </Sequence>
      ))}
      {pops.map((t, i) => (
        <Sequence key={`p${i}`} from={t}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={T.toque}>
        <Audio src={staticFile("sfx/clic.wav")} volume={0.7} />
      </Sequence>
      <Sequence from={T.espera}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={T.cierre}>
        <Audio src={staticFile("sfx/impacto.wav")} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
