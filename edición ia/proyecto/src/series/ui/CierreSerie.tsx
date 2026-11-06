import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES } from "../../estilo";

// Cierre de la serie: oscurece el 3D, se arma el logo X, pastilla "Guárdalo y síguenos" y progreso de la serie.
export const CierreSerie: React.FC<{ parte: number; total: number }> = ({ parte, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fondo = interpolate(frame, [0, 10], [0, 0.78], { extrapolateRight: "clamp" });
  const junta = spring({ frame: frame - 4, fps, durationInFrames: 14, config: { damping: 15 } });
  const sep = interpolate(junta, [0, 1], [140, 0]);
  const resto = spring({ frame: frame - 14, fps, durationInFrames: 12, config: { damping: 16 } });
  const w = 260;
  return (
    <AbsoluteFill style={{ backgroundColor: `rgba(5,6,10,${fondo})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -40 }}>
        <div
          style={{
            padding: "10px 26px",
            borderRadius: 40,
            border: "2px solid #ffffff40",
            fontFamily: FUENTES.textoChico,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.12em",
            color: COLORES.blanco,
            marginBottom: 46,
            opacity: resto,
            transform: `translateY(${(1 - resto) * -20}px)`,
          }}
        >
          <span style={{ color: COLORES.rojo }}>■</span> GUÁRDALO Y SÍGUENOS
        </div>
        <Img src={staticFile("marca/logo-x-arriba.png")} style={{ width: w, height: w * (658 / 1292), transform: `translateY(${-sep}px)`, opacity: junta }} />
        <Img src={staticFile("marca/logo-x-abajo.png")} style={{ width: w, height: w * ((1374 - 658) / 1292), transform: `translateY(${sep}px)`, opacity: junta }} />
        <div style={{ marginTop: 34, fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 46, letterSpacing: "0.3em", color: COLORES.blanco, paddingLeft: "0.3em", opacity: resto }}>
          RXT
        </div>
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 24, letterSpacing: "0.45em", color: "#ffffffaa", paddingLeft: "0.45em", marginTop: 6, opacity: resto }}>
          TRAINING CLUB
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 60, width: 520, opacity: resto }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < parte ? COLORES.rojo : "#ffffff26" }} />
          ))}
        </div>
        <div style={{ marginTop: 18, fontFamily: FUENTES.titulos, fontWeight: 800, fontSize: 34, color: COLORES.blanco, opacity: resto }}>
          Parte {parte} de {total}
        </div>
      </div>
    </AbsoluteFill>
  );
};
