// Personaje plano 2D con contorno oscuro (estilo ilustración de explainer).
// Se dibuja en un SVG de 200x400; los pies quedan en y=390. Las poses se animan con `t` (segundos).
import { COLORES } from "../estilo";

export type Pose = "parado" | "festejo" | "sentadilla" | "levantar" | "pulgar" | "pensando" | "salto" | "caminar" | "senalar";
const TINTA = "#0b0d14";
const PIEL = "#e3a77f";
const rad = (g: number) => (g * Math.PI) / 180;

type Brazo = [number, number]; // ángulo hombro (desde abajo, + hacia afuera) y codo (relativo)
type PoseCalc = { izq: Brazo; der: Brazo; agache: number; salto: number; paso: number; barra?: "arriba" | "pecho" };

const calcular = (pose: Pose, t: number, fase: number): PoseCalc => {
  const s = Math.sin((t + fase) * Math.PI * 1.6);
  switch (pose) {
    case "festejo":
      return { izq: [150 + 10 * s, 20], der: [150 - 10 * s, 20], agache: 0, salto: Math.max(0, s) * 18, paso: 0 };
    case "sentadilla": {
      const a = 0.5 - 0.5 * Math.cos((t + fase) * Math.PI * 1.3);
      // brazos al frente, manos juntas a la altura del pecho
      return { izq: [40 + 25 * a, -115], der: [40 + 25 * a, -115], agache: a, salto: 0, paso: 0 };
    }
    case "levantar": {
      const a = 0.5 - 0.5 * Math.cos((t + fase) * Math.PI * 1.2);
      return { izq: [100 + 70 * a, 60 - 50 * a], der: [100 + 70 * a, 60 - 50 * a], agache: 0.25 * (1 - a), salto: 0, paso: 0, barra: "arriba" };
    }
    case "pulgar":
      return { izq: [12, 8], der: [60, 110], agache: 0, salto: 0, paso: 0 };
    case "pensando":
      return { izq: [12, 8], der: [35, 145], agache: 0, salto: 0, paso: 0 };
    case "salto": {
      const a = Math.max(0, Math.sin((t + fase) * Math.PI * 1.4));
      return { izq: [40 + 120 * a, 20], der: [40 + 120 * a, 20], agache: 0.35 * (1 - a), salto: a * 70, paso: 0 };
    }
    case "caminar":
      return { izq: [12 + 22 * s, 15], der: [12 - 22 * s, 15], agache: 0, salto: Math.abs(s) * 4, paso: s };
    case "senalar":
      return { izq: [12, 8], der: [95, 5], agache: 0, salto: 0, paso: 0 };
    default:
      return { izq: [14 + 3 * s, 10], der: [14 - 3 * s, 10], agache: 0, salto: 0, paso: 0 };
  }
};

export const Persona2D: React.FC<{
  x: number; // centro, en px del cuadro
  y: number; // pies, en px del cuadro
  alto?: number; // alto total en px
  pose?: Pose;
  t: number;
  fase?: number;
  remera?: string;
  short?: string;
  pelo?: string;
  gorra?: boolean;
  espejo?: boolean;
  opacidad?: number;
}> = ({ x, y, alto = 420, pose = "parado", t, fase = 0, remera = COLORES.azul, short = "#1b1e2b", pelo = "#2a1a12", gorra = false, espejo = false, opacidad = 1 }) => {
  const p = calcular(pose, t, fase);
  const k = alto / 400;
  const cadera = 255 + p.agache * 70;
  const tronco = 140 + p.agache * 70;
  const hombroY = tronco + 12;
  const brazo = (lado: -1 | 1, [a1, a2]: Brazo) => {
    const hx = 100 + lado * 36;
    const ex = hx + lado * Math.sin(rad(a1)) * 50;
    const ey = hombroY + Math.cos(rad(a1)) * 50;
    const a = a1 + a2;
    const mx = ex + lado * Math.sin(rad(a)) * 46;
    const my = ey + Math.cos(rad(a)) * 46;
    return { d: `M${hx} ${hombroY} L${ex} ${ey} L${mx} ${my}`, mano: [mx, my] as [number, number] };
  };
  const pierna = (lado: -1 | 1) => {
    const px = 100 + lado * 18;
    const rodillaX = px + lado * (p.agache * 38) + (lado === 1 ? p.paso : -p.paso) * 12;
    const rodillaY = cadera + (390 - cadera) * 0.5 - p.agache * 6;
    const pieX = px + lado * 6 + (lado === 1 ? p.paso : -p.paso) * 16;
    return { d: `M${px} ${cadera} L${rodillaX} ${rodillaY} L${pieX} 382`, pie: pieX };
  };
  const bi = brazo(-1, p.izq);
  const bd = brazo(1, p.der);
  const pi = pierna(-1);
  const pd = pierna(1);
  const linea = { stroke: TINTA, strokeWidth: 30, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const relleno = (c: string, ancho: number) => ({ stroke: c, strokeWidth: ancho, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" });
  const cabezaY = tronco - 38;
  return (
    <svg
      viewBox="0 0 200 400"
      width={200 * k}
      height={400 * k}
      style={{ position: "absolute", left: x - 100 * k, top: y - 390 * k - p.salto * k, overflow: "visible", opacity: opacidad, transform: espejo ? "scaleX(-1)" : undefined }}
    >
      <ellipse cx={100} cy={390 + p.salto} rx={58 - p.salto * 0.3} ry={10} fill="#000" opacity={0.35} />
      {/* piernas */}
      {[pi, pd].map((l, i) => (
        <g key={i}>
          <path d={l.d} {...linea} strokeWidth={34} />
          <path d={l.d} {...relleno(PIEL, 22)} />
          <rect x={l.pie - 22} y={374} width={44} height={20} rx={9} fill="#f2f2f2" stroke={TINTA} strokeWidth={5} />
        </g>
      ))}
      {/* short */}
      <path d={`M${66} ${cadera - 40} L134 ${cadera - 40} L140 ${cadera + 18} L104 ${cadera + 18} L100 ${cadera} L96 ${cadera + 18} L60 ${cadera + 18} Z`} fill={short} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
      {/* brazo de atrás */}
      <path d={bi.d} {...linea} strokeWidth={32} />
      <path d={bi.d} {...relleno(PIEL, 20)} />
      {/* torso */}
      <rect x={62} y={tronco} width={76} height={cadera - tronco - 30} rx={22} fill={remera} stroke={TINTA} strokeWidth={6} />
      <path d={`M62 ${tronco + 22} Q100 ${tronco + 30} 138 ${tronco + 22}`} stroke="#ffffff30" strokeWidth={4} fill="none" />
      {/* brazo de adelante */}
      <path d={bd.d} {...linea} strokeWidth={32} />
      <path d={bd.d} {...relleno(PIEL, 20)} />
      {pose === "pulgar" ? <rect x={bd.mano[0] - 6} y={bd.mano[1] - 26} width={12} height={22} rx={6} fill={PIEL} stroke={TINTA} strokeWidth={4} /> : null}
      {/* barra olímpica */}
      {p.barra ? (
        <g>
          <line x1={bi.mano[0] - 70} y1={(bi.mano[1] + bd.mano[1]) / 2} x2={bd.mano[0] + 70} y2={(bi.mano[1] + bd.mano[1]) / 2} stroke="#cfd3dc" strokeWidth={8} strokeLinecap="round" />
          {[-1, 1].map((l) => (
            <rect key={l} x={(l < 0 ? bi.mano[0] - 70 : bd.mano[0] + 46)} y={(bi.mano[1] + bd.mano[1]) / 2 - 34} width={24} height={68} rx={6} fill={COLORES.rojo} stroke={TINTA} strokeWidth={5} />
          ))}
        </g>
      ) : null}
      {/* cuello y cabeza */}
      <rect x={90} y={cabezaY + 22} width={20} height={22} fill={PIEL} stroke={TINTA} strokeWidth={5} />
      <circle cx={100} cy={cabezaY} r={34} fill={PIEL} stroke={TINTA} strokeWidth={6} />
      <path d={`M66 ${cabezaY - 4} Q70 ${cabezaY - 44} 104 ${cabezaY - 40} Q132 ${cabezaY - 38} 134 ${cabezaY - 6} Q118 ${cabezaY - 22} 92 ${cabezaY - 18} Q76 ${cabezaY - 16} 66 ${cabezaY - 4} Z`} fill={pelo} stroke={TINTA} strokeWidth={5} />
      {gorra ? (
        <g>
          <path d={`M64 ${cabezaY - 10} Q100 ${cabezaY - 58} 136 ${cabezaY - 10} Z`} fill={COLORES.rojo} stroke={TINTA} strokeWidth={5} />
          <rect x={112} y={cabezaY - 16} width={42} height={10} rx={5} fill={COLORES.rojo} stroke={TINTA} strokeWidth={5} />
        </g>
      ) : null}
      <circle cx={112} cy={cabezaY + 2} r={4} fill={TINTA} />
      <circle cx={90} cy={cabezaY + 2} r={4} fill={TINTA} />
      <path d={`M92 ${cabezaY + 16} Q101 ${cabezaY + 23} 111 ${cabezaY + 16}`} stroke={TINTA} strokeWidth={4} fill="none" strokeLinecap="round" />
    </svg>
  );
};
