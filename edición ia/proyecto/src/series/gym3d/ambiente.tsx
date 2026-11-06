import { useMemo } from "react";
import * as THREE from "three";
import { COLORES } from "../../estilo";
import { Neon } from "./objetos";

const texturaRadial = (() => {
  let cache: THREE.CanvasTexture | null = null;
  return () => {
    if (cache) return cache;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    cache = new THREE.CanvasTexture(c);
    return cache;
  };
})();

/** Charco de luz en el piso (suma luz, no tapa). */
export const CharcoLuz: React.FC<{ x: number; z: number; radio: number; color: string; intensidad?: number }> = ({ x, z, radio, color, intensidad = 0.5 }) => {
  const tex = useMemo(() => texturaRadial(), []);
  return (
    <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radio * 2, radio * 2]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={intensidad} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** Calle nocturna alrededor del edificio: asfalto, líneas, faroles y autos con luces. */
export const Exterior: React.FC<{ t: number }> = ({ t }) => {
  const faroles = [-16, -8, 0, 8, 16];
  return (
    <group>
      <mesh position={[0, -0.05, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#090a0f" />
      </mesh>
      {/* calle al frente */}
      <mesh position={[0, -0.03, 18.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 5]} />
        <meshStandardMaterial color="#121319" />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <Neon key={i} desde={[-26 + i * 4, 18.5]} hasta={[-24.5 + i * 4, 18.5]} color="#3a3c48" y={-0.01} grosor={0.12} />
      ))}
      {/* vereda */}
      <mesh position={[0, 0.02, 15.4]}>
        <boxGeometry args={[60, 0.08, 1.4]} />
        <meshStandardMaterial color="#1c1d24" />
      </mesh>
      {faroles.map((x) => (
        <group key={x} position={[x, 0, 15.6]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 3.2, 6]} />
            <meshStandardMaterial color="#2a2b33" />
          </mesh>
          <mesh position={[0, 3.25, 0]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
          </mesh>
          <CharcoLuz x={0} z={0.6} radio={3.2} color="#ffb76b" intensidad={0.32} />
        </group>
      ))}
      {/* autos que pasan (solo luces) */}
      {[0, 1].map((i) => {
        const x = ((t * (i ? -7 : 9) + i * 20) % 60) - 30 * (i ? -1 : 1);
        const z = i ? 17.6 : 19.4;
        return (
          <group key={i} position={[x, 0.35, z]}>
            <mesh>
              <boxGeometry args={[2.6, 0.6, 1.2]} />
              <meshStandardMaterial color="#1a1b22" />
            </mesh>
            <CharcoLuz x={i ? -2 : 2} z={0} radio={1.8} color={i ? "#fff3d6" : COLORES.rojo} intensidad={0.35} />
          </group>
        );
      })}
    </group>
  );
};

/** Estructura de dominadas (rig) contra la pared. */
export const Rig: React.FC<{ x: number; z: number; largo: number }> = ({ x, z, largo }) => {
  const postes = Math.round(largo / 1.5) + 1;
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: postes }, (_, i) => (
        <mesh key={i} position={[-largo / 2 + (i * largo) / (postes - 1), 1.4, 0]}>
          <boxGeometry args={[0.09, 2.8, 0.09]} />
          <meshStandardMaterial color="#15161b" />
        </mesh>
      ))}
      {[0, 0.9].map((dz) => (
        <mesh key={dz} position={[0, 2.8, dz - 0.45]}>
          <boxGeometry args={[largo, 0.08, 0.08]} />
          <meshStandardMaterial color={COLORES.rojo} />
        </mesh>
      ))}
    </group>
  );
};

/** Colchoneta. */
export const Colchoneta: React.FC<{ x: number; z: number; rotY?: number; color?: string }> = ({ x, z, rotY = 0, color = "#23262f" }) => (
  <mesh position={[x, 0.03, z]} rotation={[0, rotY, 0]}>
    <boxGeometry args={[0.7, 0.05, 1.8]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

/** Mancuernero. */
export const Mancuernero: React.FC<{ x: number; z: number; largo?: number }> = ({ x, z, largo = 3 }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[largo, 0.08, 0.6]} />
      <meshStandardMaterial color="#15161b" />
    </mesh>
    {Array.from({ length: Math.round(largo / 0.3) }, (_, i) => (
      <mesh key={i} position={[-largo / 2 + 0.15 + i * 0.3, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.4, 8]} />
        <meshStandardMaterial color={i % 3 === 0 ? COLORES.rojo : "#2c2e38"} />
      </mesh>
    ))}
  </group>
);
