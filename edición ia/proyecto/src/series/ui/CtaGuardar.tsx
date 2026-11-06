import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../../estilo";

// Llamada a la acción a mitad de video (técnica de la ref. 8): "Guárdalo" con el ícono de guardar
// y un dedo que lo toca; el ícono se rellena al tocarlo. Dura ~1,6 s. Va antes del último punto.
export const FRAMES_CTA_GUARDAR = 48;
export const CtaGuardar: React.FC<{ texto?: string; y?: number }> = ({ texto = "Guárdalo para tu próximo entreno", y = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, durationInFrames: 10, config: { damping: 14 } });
  const sale = interpolate(frame, [FRAMES_CTA_GUARDAR - 6, FRAMES_CTA_GUARDAR], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const toque = 22;
  const dedo = interpolate(frame, [8, toque, toque + 6], [90, 0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lleno = frame >= toque;
  const pulso = lleno ? spring({ frame: frame - toque, fps, durationInFrames: 10, config: { damping: 8 } }) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          transform: `translate(-50%, -50%) scale(${interpolate(entra, [0, 1], [0.7, 1])})`,
          opacity: Math.min(entra, sale),
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 34px",
          borderRadius: 26,
          background: "linear-gradient(135deg, rgba(34,36,48,0.86), rgba(12,13,19,0.92))",
          backdropFilter: "blur(14px)",
          border: "2px solid #ffffff2a",
          boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 ${30 * pulso}px ${COLORES.dorado}66`,
        }}
      >
        <svg width={54} height={66} viewBox="0 0 54 66" style={{ transform: `scale(${1 + 0.25 * pulso})` }}>
          <path d="M6 4 H48 V62 L27 46 L6 62 Z" fill={lleno ? COLORES.dorado : "none"} stroke={lleno ? COLORES.dorado : "#fff"} strokeWidth={6} strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily: FUENTES.editorial, fontWeight: 500, fontSize: 42, color: COLORES.blanco, whiteSpace: "nowrap" }}>{texto}</div>
        {/* dedo que toca */}
        <svg width={70} height={70} viewBox="0 0 70 70" style={{ position: "absolute", left: 40, top: 40 + dedo, opacity: interpolate(frame, [6, 10, toque + 12, toque + 18], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <circle cx={22} cy={14} r={lleno && frame < toque + 8 ? 14 : 0} fill="#ffffff55" />
          <path d="M18 14 C18 8 26 8 26 14 L26 34 L40 36 C48 38 50 44 48 52 L44 64 L20 64 L8 42 C6 38 12 34 16 38 L18 40 Z" fill="#fff" stroke="#0b0d14" strokeWidth={3} strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
