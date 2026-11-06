import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, COLORES, FUENTES } from "../../estilo";

// Logo RXT que se arma: la R entra por la izquierda, la T por la derecha y las dos mitades de la X
// se juntan; brillo rojo al encajar, "TRAINING CLUB" debajo y salida con un pequeño golpe de escala.
// Piezas recortadas de public/marca/logo-rxt-blanco.png (1463x584).
const ANCHO_LOGO = 1463;
const ALTO_LOGO = 584;
const PIEZAS = [
  { src: "r", x: 0, y: 0, w: 438, h: 584, dx: -280, dy: 0, retraso: 2 },
  { src: "t", x: 1012, y: 0, w: 451, h: 584, dx: 280, dy: 0, retraso: 2 },
  { src: "x-arriba", x: 438, y: 0, w: 574, h: 280, dx: 0, dy: -200, retraso: 5 },
  { src: "x-abajo", x: 438, y: 280, w: 574, h: 304, dx: 0, dy: 200, retraso: 5 },
];

export const LogoRxt: React.FC<{ ancho?: number }> = ({ ancho = 800 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const k = ancho / ANCHO_LOGO;
  const fondo = interpolate(frame, [0, 6, durationInFrames - 6, durationInFrames], [0, 0.7, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const encaje = spring({ frame: frame - 12, fps, durationInFrames: 10, config: { damping: 9 } });
  const brillo = interpolate(frame, [12, 16, 30], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const salida = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textoEntra = interpolate(frame, [14, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: `rgba(5,6,10,${fondo})` }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: ALTO * 0.5,
          width: ancho,
          height: ALTO_LOGO * k,
          transform: `translate(-50%, -50%) scale(${(1 + 0.04 * encaje - 0.04) * (1 + 0.18 * salida)})`,
          opacity: 1 - salida,
          filter: `drop-shadow(0 0 ${20 + 30 * brillo}px rgba(204,19,16,${0.35 + 0.5 * brillo}))`,
        }}
      >
        {PIEZAS.map((p) => {
          const s = spring({ frame: frame - p.retraso, fps, durationInFrames: 12, config: { damping: 14 } });
          return (
            <Img
              key={p.src}
              src={staticFile(`marca/logo-rxt-${p.src}.png`)}
              style={{
                position: "absolute",
                left: p.x * k,
                top: p.y * k,
                width: p.w * k,
                height: p.h * k,
                opacity: s,
                transform: `translate(${p.dx * (1 - s)}px, ${p.dy * (1 - s)}px)`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ALTO * 0.5 + (ALTO_LOGO * k) / 2 + 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: textoEntra * (1 - salida),
        }}
      >
        <div style={{ width: interpolate(textoEntra, [0, 1], [0, 160]), height: 6, borderRadius: 3, background: COLORES.rojo, boxShadow: `0 0 16px ${COLORES.rojo}` }} />
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 30, letterSpacing: "0.5em", paddingLeft: "0.5em", color: COLORES.blanco }}>TRAINING CLUB</div>
      </div>
    </AbsoluteFill>
  );
};
