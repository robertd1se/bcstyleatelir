import { Img, staticFile } from "remotion";
import { COLORES, FUENTES } from "../../estilo";

// Marca fija arriba: logo X chico + "RXT · PARTE n/9".
export const EtiquetaSerie: React.FC<{ parte: number; total: number }> = ({ parte, total }) => (
  <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
    <Img src={staticFile("marca/logo-x-blanco.png")} style={{ width: 34, height: 36 }} />
    <div style={{ fontFamily: FUENTES.textoChico, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", color: "#ffffffcc" }}>
      RXT <span style={{ color: COLORES.rojo }}>·</span> PARTE {parte}/{total}
    </div>
  </div>
);
