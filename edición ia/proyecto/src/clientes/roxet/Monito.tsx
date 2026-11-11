// Monito de línea blanca visto de costado (estilo ref. 9), haciendo sentadilla con barra.
// Cinemática simple: tobillo → rodilla → cadera → hombro → cabeza. `mala` (0–1) inclina y redondea la espalda.
import { COLORES } from "../../estilo";

const rad = (g: number) => (g * Math.PI) / 180;
export type PoseMonito = "sentadilla" | "pesoMuerto" | "press" | "swing" | "thruster" | "burpee" | "dolor" | "sentado" | "parado" | "senalar" | "tablet";

export const Monito: React.FC<{
  x: number; // tobillo
  y: number; // piso
  escala?: number;
  pose?: PoseMonito;
  bajada?: number; // 0 parado … 1 abajo (sentadilla)
  mala?: number; // 0 técnica buena … 1 espalda redonda
  kilos?: number; // tamaño del disco
  dolor?: number; // 0–1 brillo rojo en la zona lumbar
  gorra?: boolean; // coach
  opacidad?: number;
  color?: string;
}> = ({ x, y, escala = 1, pose = "sentadilla", bajada = 0, mala = 0, kilos = 0, dolor = 0, gorra = false, opacidad = 1, color = "#ffffff" }) => {
  const k = escala;
  const P = (px: number, py: number) => [x + px * k, y + py * k] as const;
  let tibia = 10 + 30 * bajada;
  let muslo = 12 + 72 * bajada;
  let tronco = 12 + 22 * bajada + mala * (30 + 25 * bajada);
  let barra = pose === "sentadilla";
  if (pose === "dolor") {
    tibia = 14; muslo = 20; tronco = 48; barra = false;
  }
  if (pose === "parado" || pose === "senalar" || pose === "tablet") {
    tibia = 2; muslo = 2; tronco = 4; barra = false;
  }
  if (pose === "pesoMuerto") {
    // bisagra de cadera: tibia casi vertical, el tronco se inclina; con mala técnica la espalda se redondea
    tibia = 6 + 12 * bajada; muslo = 8 + 28 * bajada; tronco = 12 + 62 * bajada; barra = false;
  }
  if (pose === "swing") {
    tibia = 6 + 10 * bajada; muslo = 8 + 26 * bajada; tronco = 10 + 58 * bajada; barra = false;
  }
  if (pose === "thruster") {
    tibia = 10 + 30 * bajada; muslo = 12 + 72 * bajada; tronco = 12 + 22 * bajada + mala * 30; barra = false;
  }
  if (pose === "press") {
    // de pie; con mala técnica arquea la espalda hacia atrás
    tibia = 2; muslo = 2 - 10 * mala; tronco = 3 - 16 * mala; barra = false;
  }
  const A = [0, 0];
  const K = [A[0] + 70 * Math.sin(rad(tibia)), A[1] - 70 * Math.cos(rad(tibia))];
  const H = [K[0] - 75 * Math.sin(rad(muslo)), K[1] - 75 * Math.cos(rad(muslo))];
  const S = [H[0] + 95 * Math.sin(rad(tronco)), H[1] - 95 * Math.cos(rad(tronco))];
  // espalda redonda: el punto medio se va hacia atrás
  const curva = (pose === "sentadilla" || pose === "pesoMuerto" || pose === "swing" || pose === "thruster" ? mala : pose === "dolor" ? 0.6 : pose === "press" ? -0.5 * mala : 0) * 26;
  const M = [(H[0] + S[0]) / 2 - curva * Math.cos(rad(tronco)), (H[1] + S[1]) / 2 - curva * Math.sin(rad(tronco))];
  const C = [S[0] + 24 * Math.sin(rad(tronco)), S[1] - 24 * Math.cos(rad(tronco))];
  const linea = { stroke: color, strokeWidth: 7 / Math.max(k, 0.6), strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const pt = (p: number[]) => P(p[0], p[1]).join(" ");
  const lumbar = [(H[0] + M[0]) / 2, (H[1] + M[1]) / 2];

  if (pose === "burpee") {
    const p = bajada; // 0–0.25 bajar · 0.25–0.5 plancha · 0.5–0.75 volver · 0.75–1 salto
    const lin = { stroke: color, strokeWidth: 7 / Math.max(k, 0.6), strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
    const ptb = (q: number[]) => P(q[0], q[1]).join(" ");
    const enPlancha = p >= 0.25 && p < 0.5;
    if (enPlancha) {
      const caida = mala * 22; // con mala técnica la cadera se cae
      const pies = [-150, 0], cad = [-40, -42 + caida], hom = [70, -60], cab = [96, -70], man = [70, 0];
      return (
        <g opacity={opacidad}>
          <path d={`M${ptb(pies)} Q${ptb([(pies[0] + cad[0]) / 2, -20])} ${ptb(cad)} L${ptb(hom)}`} {...lin} />
          <path d={`M${ptb(hom)} L${ptb(man)}`} {...lin} />
          <circle cx={P(cab[0], cab[1])[0]} cy={P(cab[0], cab[1])[1]} r={16 * k} {...lin} />
        </g>
      );
    }
    const agach = p < 0.25 ? p / 0.25 : p < 0.75 ? 1 - (p - 0.5) / 0.25 : 0;
    const salto = p >= 0.75 ? Math.sin(((p - 0.75) / 0.25) * Math.PI) * 45 : 0;
    const t1 = 10 + 35 * agach, m1 = 12 + 80 * agach, tr = 10 + 40 * agach;
    const K1 = [70 * Math.sin(rad(t1)), -70 * Math.cos(rad(t1)) - salto];
    const H1 = [K1[0] - 75 * Math.sin(rad(m1)), K1[1] - 75 * Math.cos(rad(m1))];
    const S1 = [H1[0] + 95 * Math.sin(rad(tr)), H1[1] - 95 * Math.cos(rad(tr))];
    const C1 = [S1[0] + 24 * Math.sin(rad(tr)), S1[1] - 24 * Math.cos(rad(tr))];
    const manoB = p >= 0.75 ? [S1[0] + 10, S1[1] - 80] : [S1[0] + 40 * agach + 10, S1[1] + 40 + 50 * agach];
    return (
      <g opacity={opacidad}>
        <path d={`M${ptb([0, -salto])} L${ptb(K1)} L${ptb(H1)} L${ptb(S1)}`} {...lin} />
        <path d={`M${ptb(S1)} L${ptb(manoB)}`} {...lin} />
        <circle cx={P(C1[0], C1[1])[0]} cy={P(C1[0], C1[1])[1]} r={16 * k} {...lin} />
      </g>
    );
  }
  if (pose === "sentado") {
    // sentado en el piso, agarrándose la espalda
    const H2 = [0, -8], K2 = [60, -40], A2 = [110, -4], S2 = [-18, -100], C2 = [-24, -126];
    return (
      <g opacity={opacidad}>
        <path d={`M${pt(A2)} L${pt(K2)} L${pt(H2)} Q${pt([-30, -50])} ${pt(S2)}`} {...linea} />
        <circle cx={P(C2[0], C2[1])[0]} cy={P(C2[0], C2[1])[1]} r={16 * k} {...linea} />
        <path d={`M${pt([S2[0] + 4, S2[1] + 16])} L${pt([-40, -40])}`} {...linea} />
        {dolor > 0 ? <circle cx={P(-26, -40)[0]} cy={P(-26, -40)[1]} r={30 * k} fill={COLORES.rojoTexto} opacity={0.35 * dolor} /> : null}
      </g>
    );
  }
  // swing: abajo la pesa pasa entre las piernas; arriba los brazos quedan al frente, a la altura del pecho
  const swingMano = () => {
    const abajo = [H[0] + 10, H[1] + 70];
    const arriba = [S[0] + 95, S[1] + 6];
    return [abajo[0] + (arriba[0] - abajo[0]) * (1 - bajada), abajo[1] + (arriba[1] - abajo[1]) * (1 - bajada)];
  };
  // dónde van las manos (y la barra) según el ejercicio
  const manoPeso = [S[0] + 6 * Math.sin(rad(tronco)), S[1] + 88]; // brazos colgando hasta las rodillas
  const manoPress = [S[0] + 4, S[1] - 20 - 80 * (1 - bajada)]; // de los hombros a arriba de la cabeza
  const mano =
    pose === "senalar" ? [S[0] + 70, S[1] + 10]
    : pose === "tablet" ? [S[0] + 40, S[1] + 30]
    : pose === "dolor" ? [lumbar[0] - 18, lumbar[1]]
    : pose === "pesoMuerto" ? manoPeso
    : pose === "press" ? manoPress
    : pose === "swing" ? swingMano()
    : pose === "thruster" ? [S[0] + 4, S[1] - 6 - 90 * Math.max(0, 1 - bajada * 1.6)] // empuja arriba al subir
    : [S[0] - 6, S[1] + 4];
  return (
    <g opacity={opacidad}>
      {dolor > 0 ? <circle cx={P(lumbar[0], lumbar[1])[0]} cy={P(lumbar[0], lumbar[1])[1]} r={34 * k} fill={COLORES.rojoTexto} opacity={0.45 * dolor} style={{ filter: "blur(6px)" }} /> : null}
      <path d={`M${pt(A)} L${pt(K)} L${pt(H)} Q${pt(M)} ${pt(S)}`} {...linea} />
      <path d={`M${pt([A[0] - 6, A[1]])} L${pt([A[0] + 22, A[1]])}`} {...linea} />
      <path d={`M${pt(S)} L${pt([(S[0] + mano[0]) / 2 + 10, (S[1] + mano[1]) / 2 + 20])} L${pt(mano)}`} {...linea} />
      <circle cx={P(C[0], C[1])[0]} cy={P(C[0], C[1])[1]} r={16 * k} {...linea} />
      {gorra ? <path d={`M${pt([C[0] - 16, C[1] - 6])} Q${pt([C[0], C[1] - 26])} ${pt([C[0] + 16, C[1] - 6])} L${pt([C[0] + 30, C[1] - 4])}`} stroke={COLORES.rojoTexto} strokeWidth={8} strokeLinecap="round" fill="none" /> : null}
      {pose === "tablet" ? <rect x={P(mano[0] - 4, mano[1] - 34)[0]} y={P(mano[0] - 4, mano[1] - 34)[1]} width={26 * k} height={40 * k} rx={5} fill="#0a0a0a" stroke={color} strokeWidth={4} /> : null}
      {pose === "swing" ? (
        <g>
          <circle cx={P(mano[0], mano[1] + 20)[0]} cy={P(mano[0], mano[1] + 20)[1]} r={16 * k} fill="#0a0a0a" stroke={color} strokeWidth={4} />
          <path d={`M${pt([mano[0] - 9, mano[1] + 8])} Q${pt([mano[0], mano[1] - 6])} ${pt([mano[0] + 9, mano[1] + 8])}`} stroke={color} strokeWidth={4} fill="none" />
        </g>
      ) : null}
      {pose === "pesoMuerto" || pose === "press" || pose === "thruster" ? (
        <g>
          <line x1={P(mano[0] - 60, mano[1])[0]} y1={P(mano[0] - 60, mano[1])[1]} x2={P(mano[0] + 60, mano[1])[0]} y2={P(mano[0] + 60, mano[1])[1]} stroke="#9aa0aa" strokeWidth={5} strokeLinecap="round" />
          <circle cx={P(mano[0], mano[1])[0]} cy={P(mano[0], mano[1])[1]} r={(16 + kilos * 3) * k} fill="#0a0a0a" stroke={color} strokeWidth={4} />
        </g>
      ) : null}
      {barra ? (
        <g>
          <line x1={P(S[0] - 70, S[1] - 2)[0]} y1={P(S[0] - 70, S[1] - 2)[1]} x2={P(S[0] + 50, S[1] - 2)[0]} y2={P(S[0] + 50, S[1] - 2)[1]} stroke="#9aa0aa" strokeWidth={5} strokeLinecap="round" />
          <circle cx={P(S[0] - 6, S[1] - 2)[0]} cy={P(S[0] - 6, S[1] - 2)[1]} r={(16 + kilos * 3) * k} fill="#0a0a0a" stroke={color} strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};
