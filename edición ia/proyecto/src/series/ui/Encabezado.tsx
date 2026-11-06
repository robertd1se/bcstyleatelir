import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORES, FUENTES, ZONA_SEGURA } from "../../estilo";

// Barra superior: logo + "RXT" a la izquierda, "PARTE n/9" a la derecha y una línea fina
// que se llena en rojo a medida que avanza el video.
export const Encabezado: React.FC<{ parte: number; total: number }> = ({ parte, total }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const avance = interpolate(frame, [0, durationInFrames - 1], [0, 100]);
  return (
    <div style={{ position: "absolute", top: ZONA_SEGURA.arriba + 6, left: 110, right: 110 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile("marca/logo-x-blanco.png")} style={{ width: 36, height: 38 }} />
          <div style={{ fontFamily: FUENTES.titulos, fontWeight: 900, fontSize: 28, letterSpacing: "0.12em", color: COLORES.blanco }}>RXT</div>
        </div>
        <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 22, letterSpacing: "0.25em", color: "#ffffffb0" }}>
          PARTE <span style={{ color: COLORES.blanco }}>{parte}</span>/{total}
        </div>
      </div>
      <div style={{ marginTop: 18, height: 4, borderRadius: 2, background: "#ffffff1f", overflow: "hidden" }}>
        <div style={{ width: `${avance}%`, height: "100%", background: COLORES.rojo, boxShadow: `0 0 10px ${COLORES.rojo}` }} />
      </div>
    </div>
  );
};
