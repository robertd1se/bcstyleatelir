import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CIERRE, COLORES, FUENTES } from "../estilo";

// Cierre de marca: las dos mitades del logo X se juntan sobre negro y aparece la llamada a la acción.
// Proporciones del logo recortado: 1292 x 1374, corte entre mitades en y=658.
const PROP_ARRIBA = 658 / 1292;
const PROP_ABAJO = (1374 - 658) / 1292;

export const CierreLogo: React.FC<{ llamada?: string }> = ({ llamada = "Registrate" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const junta = spring({ frame, fps, durationInFrames: 14, config: { damping: 15 } });
  const separacion = interpolate(junta, [0, 1], [260, 0]);
  const textoOpacidad = interpolate(frame, [14, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const salida = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = CIERRE.anchoLogo;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.negro, justifyContent: "center", alignItems: "center", opacity: salida }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("marca/logo-x-arriba.png")} style={{ width: w, height: w * PROP_ARRIBA, transform: `translateY(${-separacion}px)`, opacity: junta }} />
        <Img src={staticFile("marca/logo-x-abajo.png")} style={{ width: w, height: w * PROP_ABAJO, transform: `translateY(${separacion}px)`, opacity: junta }} />
        <div style={{ opacity: textoOpacidad, marginTop: 48, fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 34, letterSpacing: "0.4em", color: COLORES.blanco, textTransform: "uppercase", paddingLeft: "0.4em" }}>
          {llamada}
        </div>
        <div style={{ opacity: textoOpacidad, marginTop: 16, width: interpolate(textoOpacidad, [0, 1], [0, 90]), height: 5, background: COLORES.azul }} />
      </div>
    </AbsoluteFill>
  );
};

export const FRAMES_CIERRE = CIERRE.frames;
