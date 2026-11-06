// RXT · "5 razones por las que la gente elige RXT" (une los reels 1 y 2 con una estructura nueva).
// Voz: python3 scripts/voz.py guiones/rxt-5razones.txt public/series/rxt-5razones --motor chatterbox --perfil locutor
// Música: python3 scripts/musica.py public/musica-generada/rxt-5razones.wav --duracion <voz + 1 s> --semilla 3
import { Caption } from "@remotion/captions";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FPS, FUENTES } from "../estilo";
import palabrasJson from "../../public/series/rxt-5razones/palabras.json";
import { Gimnasio3D } from "../series/gym3d/Gimnasio3D";
import { cuandoSeDice } from "../series/linea";
import { prepararPalabras } from "../series/ReelSerie";
import { volumenMusica } from "../series/sonido";
import { Acabado } from "../series/ui/Acabado";
import { CtaGuardar, FRAMES_CTA_GUARDAR } from "../series/ui/CtaGuardar";
import { LogoRxt } from "../series/ui/LogoRxt";
import { SubtitulosFluidos } from "../series/ui/SubtitulosFluidos";
import { Persona2D } from "../series2d/Persona2D";
import { Pastilla, Sello } from "../series2d/piezas";
import { EncabezadoRazones, FondoLuces, Insignia, TarjetaCapitulo, TarjetaSeguir, TarjetaVidrio } from "./piezas";

const PALABRAS: Caption[] = prepararPalabras(palabrasJson as Caption[]);
const dice = (p: string, n = 0) => cuandoSeDice(PALABRAS, p, n);
const FIN_VOZ = Math.round((PALABRAS[PALABRAS.length - 1].endMs / 1000) * FPS);
export const DURACION_5RAZONES = FIN_VOZ + Math.round(1.0 * FPS);

// "5." aparece dos veces: en el gancho ("5 razones") y en la razón 5
const R = [dice("1."), dice("2."), dice("número"), dice("4."), dice("5.", 1)]; // la razón 3 arranca en "Número tres"
const T = {
  funcional: dice("funcional"),
  fuerza: dice("fuerza"),
  acond: dice("acondicionamiento"),
  hibrido: dice("híbrido."),
  objetivos: dice("objetivos"),
  capacidades: dice("capacidades"),
  necesidades: dice("necesidades."),
  levantar: dice("levantar"),
  intencion: dice("intención"),
  tecnica: dice("técnica."),
  coach: dice("coach"),
  corrige: dice("corrige"),
  antes: dice("antes"),
  comunidad: dice("comunidad"),
  limites: dice("límites."),
  esto: dice("esto"),
};
const CAP = 20; // cuadros de la tarjeta de capítulo
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const tramo = (desde: number, hasta: number) => PALABRAS.filter((p) => {
  const f = (p.startMs / 1000) * FPS;
  return f >= desde - 2 && f < hasta - 2;
});
const useT = () => useCurrentFrame() / FPS;

// ---------- escenas ----------
const Gancho: React.FC = () => {
  const pos: [number, number][] = [[180, 560], [370, 470], [710, 470], [900, 560], [540, 1250]];
  const sombra = "0 6px 24px rgba(0,0,0,0.6)";
  return (
    <>
      {pos.map(([x, y], i) => (
        <Insignia key={i} n={i + 1} x={x} y={y} desde={i === 0 ? -20 : 2 + i * 5} />
      ))}
      <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", textShadow: sombra }}>
        <span style={{ fontFamily: FUENTES.manuscrita, fontSize: 300, color: COLORES.dorado, lineHeight: 0.9 }}>5</span>
        <span style={{ fontFamily: FUENTES.editorial, fontStyle: "italic", fontWeight: 500, fontSize: 132, color: COLORES.blanco, marginLeft: 18 }}>razones</span>
        <div style={{ fontFamily: FUENTES.editorial, fontWeight: 500, fontSize: 60, color: COLORES.blanco, marginTop: 16 }}>
          por las que la gente elige <span style={{ fontFamily: FUENTES.manuscrita, fontSize: 96, color: COLORES.rojoTexto }}>RXT</span>
        </div>
      </div>
    </>
  );
};

const Razon1: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const r0 = R[0];
  const enc = (w: number) => interpolate(f + r0, [w, w + 8], [0, 1], clamp);
  return (
    <TarjetaVidrio x={70} y={640} w={940} h={820} duracion={d} etiqueta="Todo tu cuerpo">
      <div style={{ position: "absolute", inset: 0 }}>
        <Gimnasio3D
          ancho={940}
          alto={820}
          t={f / FPS}
          cam={{ x: 0.5, z: 2.5, zoom: 38 + f * 0.04, giro: -0.15 + f * 0.003 }}
          activas={{ funcional: enc(T.funcional), fuerza: enc(T.fuerza), acondicionamiento: enc(T.acond), hibrido: enc(T.hibrido) }}
        />
      </div>
    </TarjetaVidrio>
  );
};

const Razon2: React.FC<{ d: number }> = ({ d }) => {
  const t = useT();
  const r = R[1];
  const personas = [
    { x: 170, alto: 340, remera: "#2bb673", pose: "festejo" as const, et: "Objetivos", w: T.objetivos, c: "#2bb673" },
    { x: 450, alto: 390, remera: COLORES.azul, pose: "sentadilla" as const, et: "Capacidades", w: T.capacidades, c: COLORES.azul },
    { x: 730, alto: 360, remera: "#8b5cf6", pose: "caminar" as const, et: "Necesidades", w: T.necesidades, c: "#8b5cf6" },
  ];
  return (
    <TarjetaVidrio x={70} y={450} w={940} h={760} duracion={d} etiqueta="Hecho para ti">
      {personas.map((p, i) => (
        <div key={i}>
          <Persona2D x={p.x + 20} y={680} alto={p.alto} pose={p.pose} t={t} fase={i * 0.4} remera={p.remera} />
          <div style={{ position: "absolute", left: p.x + 20, top: 680 - p.alto - 80, transform: "translateX(-50%)" }}>
            <Pastilla texto={p.et} color={p.c} desde={p.w - r} />
          </div>
        </div>
      ))}
    </TarjetaVidrio>
  );
};

const Razon3: React.FC<{ d: number }> = ({ d }) => {
  const t = useT();
  const f = useCurrentFrame();
  const r = R[2];
  return (
    <TarjetaVidrio x={70} y={640} w={940} h={800} duracion={d} etiqueta="Con intención">
      <Persona2D x={250} y={720} alto={420} pose="levantar" t={t} remera="#e05a2b" opacidad={f >= T.intencion - r ? 0.35 : 1} />
      <Sello texto="No solo peso" desde={T.levantar - r + 8} x={260} y={330} giro={-10} tamaño={50} />
      <div style={{ position: "absolute", left: 500, top: 250, display: "flex", flexDirection: "column", gap: 26 }}>
        <Pastilla texto="✓ Intención" color={COLORES.azul} desde={T.intencion - r} grande />
        <Pastilla texto="✓ Técnica" color="#2bb673" desde={T.tecnica - r} grande />
      </div>
    </TarjetaVidrio>
  );
};

const Razon4: React.FC<{ d: number }> = ({ d }) => {
  const t = useT();
  const r = R[3];
  return (
    <TarjetaVidrio x={70} y={450} w={940} h={760} duracion={d} etiqueta="Siempre acompañado">
      <Persona2D x={300} y={690} alto={400} pose="sentadilla" t={t} remera={COLORES.azul} />
      <Persona2D x={640} y={690} alto={440} pose="pulgar" t={t} remera={COLORES.rojo} gorra espejo />
      <div style={{ position: "absolute", left: 640, top: 160, transform: "translateX(-50%)" }}>
        <Pastilla texto="Coach RXT" color={COLORES.rojo} desde={T.coach - r} />
      </div>
      <div style={{ position: "absolute", right: 40, top: 300 }}>
        <Pastilla texto="✓ Te corrige" color="#2bb673" desde={T.corrige - r} grande />
      </div>
    </TarjetaVidrio>
  );
};

const Razon5: React.FC<{ d: number }> = ({ d }) => {
  const t = useT();
  const r = R[4];
  const remeras = ["#2bb673", COLORES.azul, COLORES.rojo, "#8b5cf6", "#e05a2b"];
  return (
    <TarjetaVidrio x={70} y={640} w={940} h={800} duracion={d} etiqueta="Comunidad">
      {remeras.map((c, i) => (
        <Persona2D key={i} x={130 + i * 170} y={700 - (i % 2) * 24} alto={330 + (i % 3) * 24} pose="festejo" t={t} fase={i * 0.27} remera={c} gorra={i === 2} />
      ))}
      <Sello texto="Superado" desde={T.limites - r} x={470} y={180} giro={-7} tamaño={64} />
    </TarjetaVidrio>
  );
};

// Progreso 1–5 arriba (debajo del encabezado) mientras corren las razones
const Progreso5: React.FC = () => {
  const f = useCurrentFrame();
  const actual = R.filter((r) => f >= r).length; // 1..5
  const op = interpolate(f, [R[0], R[0] + 8, T.esto - 6, T.esto], [0, 1, 1, 0], clamp);
  return (
    <div style={{ opacity: op }}>
      {R.map((r, i) => (
        <Insignia key={i} n={i + 1} x={340 + i * 100} y={392} desde={R[0]} tamaño={46} estado={i + 1 < actual ? "hecha" : i + 1 === actual ? "actual" : "pendiente"} />
      ))}
    </div>
  );
};

// Cierre: logo RXT que se arma + tarjeta de seguir; últimos cuadros vuelven al gancho (loop)
const Cierre: React.FC = () => {
  return (
    <>
      <Sequence durationInFrames={54}>
        <LogoRxt />
      </Sequence>
      <Sequence from={40}>
        <TarjetaSeguir usuario="roxet_trainingclub" nombre="Roxet Training Club" y={1200} />
      </Sequence>
    </>
  );
};

export const Rxt5Razones: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const escenas = [
    { C: Razon1, a: R[0], b: R[1], texto: 0.272 },
    { C: Razon2, a: R[1], b: R[2], texto: 0.715 },
    { C: Razon3, a: R[2], b: R[3], texto: 0.272 },
    { C: Razon4, a: R[3], b: T.antes, texto: 0.715 },
    { C: Razon5, a: R[4], b: T.esto, texto: 0.272 },
  ];
  const loop = interpolate(useCurrentFrame(), [durationInFrames - 10, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <FondoLuces />

      {/* gancho: promesa contable visible desde el cuadro 0 */}
      <Sequence durationInFrames={R[0]}>
        <Gancho />
      </Sequence>

      {escenas.map(({ C, a, b, texto }, i) => (
        <Sequence key={i} from={a} durationInFrames={b - a}>
          <Sequence from={CAP - 6}>
            <C d={b - a - CAP + 6} />
          </Sequence>
          <SubtitulosFluidos palabras={tramo(a, b).map((p) => ({ ...p, startMs: p.startMs - (a / FPS) * 1000 }))} doradas={["cuerpo:", "ti:", "intención,", "coach", "comunidad"]} rojas={["técnica.", "límites."]} centroY={texto} />
          <Sequence durationInFrames={CAP}>
            <TarjetaCapitulo n={i + 1} duracion={CAP} />
          </Sequence>
        </Sequence>
      ))}

      {/* guardar antes de la última razón */}
      <Sequence from={T.antes} durationInFrames={R[4] - T.antes}>
        <SubtitulosFluidos palabras={tramo(T.antes, R[4]).map((p) => ({ ...p, startMs: p.startMs - (T.antes / FPS) * 1000 }))} doradas={["guarda"]} centroY={0.36} tamaño={78} />
        <Sequence durationInFrames={Math.max(FRAMES_CTA_GUARDAR, R[4] - T.antes)}>
          <CtaGuardar texto="Guárdalo" y={1000} />
        </Sequence>
      </Sequence>

      {/* cierre */}
      <Sequence from={T.esto}>
        <SubtitulosFluidos palabras={tramo(T.esto, durationInFrames + 999).map((p) => ({ ...p, startMs: p.startMs - (T.esto / FPS) * 1000 }))} doradas={["síguenos"]} rojas={["RXT."]} centroY={0.245} />
        <Cierre />
      </Sequence>

      <Progreso5 />
      <EncabezadoRazones derecha="5 RAZONES" />
      <Acabado />

      {/* loop: los últimos 10 cuadros vuelven al gancho */}
      <AbsoluteFill style={{ opacity: loop, pointerEvents: "none" }}>
        <FondoLuces />
        <Gancho />
      </AbsoluteFill>

      <Audio src={staticFile("series/rxt-5razones/voz.wav")} />
      <Audio src={staticFile("musica-generada/rxt-5razones.wav")} volume={volumenMusica(PALABRAS, fps, durationInFrames)} />
      <Audio src={staticFile("sfx/impacto.wav")} volume={0.5} />
      {[...R, T.antes, T.esto].map((f) => (
        <Sequence key={`w${f}`} from={Math.max(0, f - 6)} durationInFrames={20}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
      {[T.levantar + 8, T.limites, T.esto + 12].map((f) => (
        <Sequence key={`i${f}`} from={f}>
          <Audio src={staticFile("sfx/impacto.wav")} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
