import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { COLORES } from "../../estilo";
import { Zona } from "./plano";

const NEGRO = "#16171c";
const ACERO = "#9aa0aa";

/** Línea de neón: caja finita que brilla (no depende de luces). */
export const Neon: React.FC<{ desde: [number, number]; hasta: [number, number]; color: string; y?: number; grosor?: number }> = ({
  desde,
  hasta,
  color,
  y = 0.03,
  grosor = 0.08,
}) => {
  const dx = hasta[0] - desde[0];
  const dz = hasta[1] - desde[1];
  const largo = Math.hypot(dx, dz);
  return (
    <group position={[(desde[0] + hasta[0]) / 2, y, (desde[1] + hasta[1]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
      <mesh userData={{ sinSombra: true }}>
        <boxGeometry args={[largo, grosor, grosor]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* halo: brillo suave alrededor del neón */}
      <mesh userData={{ sinSombra: true }}>
        <boxGeometry args={[largo + grosor * 4, grosor * 5, grosor * 5]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const texturaBaldosas = (() => {
  let cache: THREE.CanvasTexture | null = null;
  return () => {
    if (cache) return cache;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 256, 256);
    // grano de goma
    for (let i = 0; i < 4000; i++) {
      const v = 225 + Math.floor(random(`b${i}`) * 30);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(random(`x${i}`) * 256, random(`y${i}`) * 256, 2, 2);
    }
    // juntas de baldosas
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 256, 256);
    cache = new THREE.CanvasTexture(c);
    cache.wrapS = cache.wrapT = THREE.RepeatWrapping;
    cache.colorSpace = THREE.SRGBColorSpace;
    return cache;
  };
})();

/** Piso de una zona con borde de neón. `activa` (0–1) la ilumina en rojo. */
export const PisoZona: React.FC<{ z: Zona; activa: number; pulso: number }> = ({ z, activa, pulso }) => {
  const [cx, cz] = z.centro;
  const [w, d] = z.tamaño;
  const colorBorde = useMemo(() => new THREE.Color("#5b6cff").lerp(new THREE.Color(COLORES.rojo), activa), [activa]);
  const hex = `#${colorBorde.getHexString()}`;
  const tex = useMemo(() => {
    const t = texturaBaldosas().clone();
    t.needsUpdate = true;
    t.repeat.set(w / 1.2, d / 1.2);
    return t;
  }, [w, d]);
  const esquinas: [number, number][] = [
    [cx - w / 2, cz - d / 2],
    [cx + w / 2, cz - d / 2],
    [cx + w / 2, cz + d / 2],
    [cx - w / 2, cz + d / 2],
  ];
  return (
    <group>
      <mesh position={[cx, 0.01, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex} color={z.piso} roughness={0.85} emissive={COLORES.rojo} emissiveIntensity={activa * (0.12 + 0.08 * pulso)} />
      </mesh>
      {esquinas.map((e, i) => (
        <Neon key={i} desde={e} hasta={esquinas[(i + 1) % 4]} color={hex} grosor={0.08 + activa * 0.06} />
      ))}
    </group>
  );
};

/** Pared baja con remate de neón. */
export const Pared: React.FC<{ desde: [number, number]; hasta: [number, number]; alto?: number }> = ({ desde, hasta, alto = 2.4 }) => {
  const dx = hasta[0] - desde[0];
  const dz = hasta[1] - desde[1];
  const largo = Math.hypot(dx, dz);
  const rot = -Math.atan2(dz, dx);
  const medio: [number, number, number] = [(desde[0] + hasta[0]) / 2, alto / 2, (desde[1] + hasta[1]) / 2];
  return (
    <group>
      <mesh position={medio} rotation={[0, rot, 0]}>
        <boxGeometry args={[largo, alto, 0.25]} />
        <meshStandardMaterial color="#202230" />
      </mesh>
      <Neon desde={desde} hasta={hasta} y={alto + 0.03} color="#e8ecff" grosor={0.1} />
    </group>
  );
};

/** Rack de sentadillas con barra. */
export const Rack: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    {[-0.7, 0.7].map((dx) =>
      [-0.5, 0.5].map((dz) => (
        <mesh key={`${dx}${dz}`} position={[dx, 1.2, dz]}>
          <boxGeometry args={[0.08, 2.4, 0.08]} />
          <meshStandardMaterial color={NEGRO} />
        </mesh>
      )),
    )}
    <mesh position={[0, 2.4, 0]}>
      <boxGeometry args={[1.5, 0.08, 1.08]} />
      <meshStandardMaterial color={NEGRO} />
    </mesh>
    <Barra x={0} y={1.4} z={-0.5} largo={2.1} />
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[2, 0.06, 1.6]} />
      <meshStandardMaterial color="#2b2b30" />
    </mesh>
  </group>
);

/** Barra olímpica con discos rojos. */
export const Barra: React.FC<{ x: number; y: number; z: number; largo?: number; rotY?: number }> = ({ x, y, z, largo = 2.1, rotY = 0 }) => (
  <group position={[x, y, z]} rotation={[0, rotY, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.025, 0.025, largo, 8]} />
      <meshStandardMaterial color={ACERO} metalness={0.6} roughness={0.3} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (largo / 2 - 0.2), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 20]} />
        <meshStandardMaterial color={COLORES.rojo} />
      </mesh>
    ))}
  </group>
);

/** Cajón pliométrico. */
export const Cajon: React.FC<{ x: number; z: number; rotY?: number }> = ({ x, z, rotY = 0 }) => (
  <mesh position={[x, 0.3, z]} rotation={[0, rotY, 0]}>
    <boxGeometry args={[0.75, 0.6, 0.6]} />
    <meshStandardMaterial color="#8a5a32" />
  </mesh>
);

/** Kettlebell. */
export const Pesa: React.FC<{ x: number; z: number; color?: string }> = ({ x, z, color = COLORES.azul }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.16, 0]}>
      <sphereGeometry args={[0.16, 12, 10]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.34, 0]}>
      <torusGeometry args={[0.08, 0.025, 6, 12]} />
      <meshStandardMaterial color={NEGRO} />
    </mesh>
  </group>
);

/** Remo / bici de aire (forma simple). */
export const Maquina: React.FC<{ x: number; z: number; rotY?: number }> = ({ x, z, rotY = 0 }) => (
  <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[0.25, 0.12, 2]} />
      <meshStandardMaterial color={NEGRO} />
    </mesh>
    <mesh position={[0, 0.45, -0.85]} rotation={[0, Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 0.18, 18]} />
      <meshStandardMaterial color="#26272e" emissive={COLORES.azul} emissiveIntensity={0.25} />
    </mesh>
  </group>
);

/** Mostrador de la barra con neón. */
export const Mostrador: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[6, 1.1, 0.9]} />
      <meshStandardMaterial color="#e9e6df" />
    </mesh>
    <Neon desde={[-3, 0.47]} hasta={[3, 0.47]} y={0.2} color={COLORES.rojo} grosor={0.07} />
    <Neon desde={[-3, 0.47]} hasta={[3, 0.47]} y={1.12} color="#ffffff" grosor={0.05} />
    {[-2, -1, 0, 1, 2].map((dx, i) => (
      <mesh key={dx} position={[dx, 1.25, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.3, 10]} />
        <meshStandardMaterial color={["#f2a531", "#62d26f", "#ffffff", "#f2a531", "#62d26f"][i]} />
      </mesh>
    ))}
  </group>
);

export type Animacion = "sentadilla" | "remo" | "salto" | "quieto" | "caminar";

/** Persona de bloques animada. `t` en segundos. `coach` lleva remera roja y aro azul. */
const ROPA = ["#2b2e3a", "#e9e9ee", "#3a3f52", "#111216", "#d8d8de", "#1f3a8a"];

export const Persona: React.FC<{ x: number; z: number; t: number; anim?: Animacion; rotY?: number; coach?: boolean; desfase?: number; resaltar?: number }> = ({
  x,
  z,
  t,
  anim = "quieto",
  rotY = 0,
  coach = false,
  desfase = 0,
  resaltar = 0,
}) => {
  const fase = (t + desfase) * Math.PI * 1.4;
  let bajada = 0;
  let avance = 0;
  let salto = 0;
  if (anim === "sentadilla") bajada = 0.35 * (0.5 - 0.5 * Math.cos(fase));
  if (anim === "remo") avance = 0.35 * Math.sin(fase);
  if (anim === "salto") salto = Math.max(0, Math.sin(fase * 1.3)) * 0.45;
  if (anim === "caminar") avance = 0.08 * Math.sin(fase * 2);
  // la ropa varía según la posición para que no se vean todos iguales
  // la ropa varía según la posición para que no se vean todos iguales
  const remera = coach ? COLORES.rojo : ROPA[Math.abs(Math.round(x * 7 + z * 13)) % ROPA.length];
  const brazo = anim === "remo" ? 0.9 + 0.5 * Math.sin(fase) : anim === "caminar" ? 0.35 * Math.sin(fase * 2) : anim === "sentadilla" ? 1.2 : anim === "salto" ? -0.6 + salto * 3 : 0.1;
  return (
    <group position={[x, salto, z]} rotation={[0, rotY, 0]}>
      <group position={[0, 0, avance]}>
        {/* piernas y zapatillas */}
        {[-0.12, 0.12].map((dx) => (
          <group key={dx}>
            <mesh position={[dx, 0.44 - bajada / 2, 0]}>
              <boxGeometry args={[0.14, 0.8 - bajada, 0.16]} />
              <meshStandardMaterial color="#111216" roughness={0.8} />
            </mesh>
            <mesh position={[dx, 0.04, 0.04]}>
              <boxGeometry args={[0.15, 0.08, 0.26]} />
              <meshStandardMaterial color={coach ? "#ffffff" : "#e8e8ea"} />
            </mesh>
          </group>
        ))}
        {/* torso */}
        <mesh position={[0, 1.15 - bajada, 0]}>
          <capsuleGeometry args={[0.2, 0.45, 4, 12]} />
          <meshStandardMaterial color={remera} roughness={0.7} />
        </mesh>
        {/* brazos */}
        {[-1, 1].map((lado) => (
          <group key={lado} position={[lado * 0.27, 1.38 - bajada, 0]} rotation={[-brazo * (lado === 1 || anim !== "caminar" ? 1 : -1), 0, lado * 0.12]}>
            <mesh position={[0, -0.27, 0]}>
              <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
              <meshStandardMaterial color="#c99b77" roughness={0.6} />
            </mesh>
          </group>
        ))}
        {/* cabeza y pelo */}
        <mesh position={[0, 1.62 - bajada, 0]}>
          <sphereGeometry args={[0.15, 16, 14]} />
          <meshStandardMaterial color="#c99b77" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.69 - bajada, -0.02]}>
          <sphereGeometry args={[0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1412" roughness={0.9} />
        </mesh>
      </group>
      {coach || resaltar > 0 ? (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.6, 32]} />
          <meshBasicMaterial color={coach ? COLORES.azul : COLORES.rojo} transparent opacity={Math.max(coach ? 0.9 : 0, resaltar)} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
