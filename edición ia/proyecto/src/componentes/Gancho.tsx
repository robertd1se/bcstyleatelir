import { fitText } from "@remotion/layout-utils";
import { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHO, COLORES, FUENTES, GANCHO } from "../estilo";

// Título gancho de los primeros 3 s: aparece en el cuadro 0, sin fundido.
// Cada línea se achica sola si no entra con el margen lateral mínimo.
export const Gancho: React.FC<{ linea1: string; linea2: string }> = ({ linea1, linea2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [tamaños, setTamaños] = useState<[number, number] | null>(null);
  const [handle] = useState(() => delayRender("Midiendo el gancho"));

  useEffect(() => {
    const familia = FUENTES.titulos.split(",")[0];
    document.fonts.load(`900 100px ${familia}`).then(() => {
      const anchoUtil = ANCHO - 2 * GANCHO.margenLateral;
      const medir = (t: string, max: number) =>
        Math.min(max, fitText({ text: t, withinWidth: anchoUtil, fontFamily: familia, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }).fontSize);
      setTamaños([medir(linea1, GANCHO.tamaño1), medir(linea2, GANCHO.tamaño2)]);
      continueRender(handle);
    });
  }, [handle, linea1, linea2]);

  if (!tamaños) return null;
  const golpe = spring({ frame, fps, durationInFrames: 6, config: { damping: 12 } });
  const golpe2 = spring({ frame: frame - 4, fps, durationInFrames: 6, config: { damping: 12 } });
  const estilo: React.CSSProperties = {
    fontFamily: FUENTES.titulos,
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 0.95,
    textShadow: "0 8px 30px rgba(0,0,0,0.6)",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  };
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: -120 }}>
      <div style={{ ...estilo, fontSize: tamaños[0], color: COLORES.blanco, transform: `scale(${interpolate(golpe, [0, 1], [1.3, 1])})` }}>
        {linea1}
      </div>
      <div
        style={{
          ...estilo,
          fontSize: tamaños[1],
          color: COLORES.rojo,
          opacity: frame >= 4 ? 1 : 0,
          transform: `scale(${interpolate(golpe2, [0, 1], [1.3, 1])})`,
        }}
      >
        {linea2}
      </div>
    </AbsoluteFill>
  );
};
