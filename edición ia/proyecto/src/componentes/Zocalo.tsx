import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ALTO, COLORES, FUENTES } from "../estilo";

// Zócalo para presentar a alguien: nombre en rojo, rol en blanco y una frase con humor.
export const Zocalo: React.FC<{ nombre: string; rol: string; frase?: string }> = ({ nombre, rol, frase }) => {
  const frame = useCurrentFrame();
  const entra = (desde: number) => ({
    opacity: interpolate(frame, [desde, desde + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [desde, desde + 6], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const ancho = interpolate(frame, [0, 8], [0, 120], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: ALTO * 0.68, alignItems: "center", textAlign: "center", textShadow: "0 4px 14px rgba(0,0,0,0.6)" }}>
      <div style={{ width: ancho, height: 6, background: COLORES.azul, marginBottom: 18 }} />
      <div style={{ ...entra(2), fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 64, color: COLORES.rojo, textTransform: "uppercase" }}>
        {nombre}
      </div>
      <div style={{ ...entra(5), fontFamily: FUENTES.titulos, fontWeight: 700, fontSize: 44, color: COLORES.blanco, textTransform: "uppercase" }}>
        {rol}
      </div>
      {frase ? (
        <div style={{ ...entra(9), fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 32, color: COLORES.blanco, marginTop: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          “{frase}”
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
