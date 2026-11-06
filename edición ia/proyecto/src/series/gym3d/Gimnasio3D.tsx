import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { COLORES } from "../../estilo";
import { Cajon, Maquina, Mostrador, Neon, Pared, PisoZona, Persona, Pesa, Rack, Barra } from "./objetos";
import { TAMAÑO_PISO, ZONAS, zona } from "./plano";
import { CharcoLuz, Colchoneta, Exterior, Mancuernero, Rig } from "./ambiente";

export type Camara = { x: number; z: number; zoom: number; giro?: number };
export type Marcador = { zona: string; numero: string; opacidad: number; escala: number; color?: string };

// Dirección desde la que mira la cámara (isométrica, desde adelante a la derecha)
const DIR = new THREE.Vector3(0.8, 1.05, 1).normalize();

const ControlCamara: React.FC<{ cam: Camara }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const dir = DIR.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), cam.giro ?? 0);
    const objetivo = new THREE.Vector3(cam.x, 0, cam.z);
    camera.position.copy(objetivo.clone().add(dir.multiplyScalar(60)));
    camera.lookAt(objetivo);
    (camera as THREE.OrthographicCamera).zoom = cam.zoom;
    camera.updateProjectionMatrix();
  }, [camera, cam.x, cam.z, cam.zoom, cam.giro]);
  return null;
};

const texturaNumero = (texto: string, color: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 140px Montserrat, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, 128, 138);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const MarcadorZona: React.FC<{ m: Marcador; t: number }> = ({ m, t }) => {
  const z = zona(m.zona);
  const tex = useMemo(() => texturaNumero(m.numero, m.color ?? COLORES.rojo), [m.numero, m.color]);
  const flota = 0.15 * Math.sin(t * 3);
  return (
    <sprite position={[z.centro[0], 3.6 + flota, z.centro[1]]} scale={[1.6 * m.escala, 1.6 * m.escala, 1]}>
      <spriteMaterial map={tex} transparent opacity={m.opacidad} depthTest={false} toneMapped={false} />
    </sprite>
  );
};

export const Gimnasio3D: React.FC<{
  ancho: number;
  alto: number;
  t: number; // segundos, para animar personas
  cam: Camara;
  activas?: Record<string, number>; // zona → 0..1
  marcadores?: Marcador[];
  coachResaltado?: number; // 0..1, aro rojo extra en los coaches
}> = ({ ancho, alto, t, cam, activas = {}, marcadores = [], coachResaltado = 0 }) => {
  const pulso = 0.5 + 0.5 * Math.sin(t * 6);
  const f = zona("funcional").centro;
  const fu = zona("fuerza").centro;
  const ac = zona("acondicionamiento").centro;
  const hi = zona("hibrido").centro;
  const ba = zona("barra").centro;
  const [W, D] = TAMAÑO_PISO;
  return (
    <ThreeCanvas width={ancho} height={alto} orthographic camera={{ zoom: cam.zoom, near: 0.1, far: 200 }} style={{ background: "#07080d" }}>
      <ControlCamara cam={cam} />
      <color attach="background" args={["#07080d"]} />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#c9d4ff", "#120c10", 0.6]} />
      <directionalLight position={[8, 16, 10]} intensity={1.2} />
      <pointLight position={[-6, 4, -4]} color={COLORES.rojo} intensity={25} distance={14} />
      <pointLight position={[6, 4, 5]} color={COLORES.azul} intensity={30} distance={14} />

      <Exterior t={t} />
      {/* piso general */}
      <mesh position={[0, -0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#0e0f15" />
      </mesh>
      {ZONAS.map((z) => (
        <PisoZona key={z.id} z={z} activa={activas[z.id] ?? 0} pulso={pulso} />
      ))}

      {/* paredes del fondo con franjas de neón */}
      <Pared desde={[-12, -8]} hasta={[12, -8]} />
      <Pared desde={[-12, -8]} hasta={[-12, 13]} />
      <Neon desde={[-11.8, -7.85]} hasta={[11.8, -7.85]} y={1.2} color={COLORES.rojo} grosor={0.06} />
      <Neon desde={[-11.85, -7.8]} hasta={[-11.85, 12.8]} y={1.2} color="#7a5cff" grosor={0.06} />

      {/* charcos de luz de los focos */}
      {ZONAS.slice(0, 4).map((z, i) => (
        <CharcoLuz key={z.id} x={z.centro[0]} z={z.centro[1]} radio={4.2} color={i % 2 ? "#9fb0ff" : "#ffffff"} intensidad={0.14 + (activas[z.id] ?? 0) * 0.18} />
      ))}
      <CharcoLuz x={ba[0]} z={ba[1]} radio={4} color="#ffb35c" intensidad={0.3} />

      {/* más equipamiento */}
      <Rig x={f[0]} z={-7.3} largo={7.5} />
      {[-3, -2, -1].map((dx) => (
        <Colchoneta key={dx} x={ac[0] + dx} z={ac[1] + 2.4} rotY={Math.PI / 2} />
      ))}
      <Mancuernero x={fu[0]} z={-7.3} largo={6} />

      {/* Funcional: cajones, pesas rusas, saltos y sentadillas */}
      {[-2.5, -1.2, 0.1].map((dx, i) => (
        <Cajon key={dx} x={f[0] + dx} z={f[1] - 2} rotY={i * 0.2} />
      ))}
      {[-3, -2.5, -2, -1.5].map((dx, i) => (
        <Pesa key={dx} x={f[0] + dx} z={f[1] + 2.6} color={i % 2 ? COLORES.rojo : COLORES.azul} />
      ))}
      <Persona x={f[0] - 2.5} z={f[1] - 1} t={t} anim="salto" />
      <Persona x={f[0] - 1.2} z={f[1] - 1} t={t} anim="salto" desfase={0.3} />
      <Persona x={f[0] + 1.5} z={f[1] + 1} t={t} anim="sentadilla" />
      <Persona x={f[0] + 2.8} z={f[1] + 0.5} t={t} anim="sentadilla" desfase={0.5} />
      <Persona x={f[0] + 0.2} z={f[1] + 2} t={t} anim="caminar" coach resaltar={coachResaltado} rotY={-0.6} />

      {/* Fuerza: racks y barras */}
      {[-2.8, 0, 2.8].map((dx, i) => (
        <group key={dx}>
          <Rack x={fu[0] + dx} z={fu[1] - 1.5} />
          <Persona x={fu[0] + dx} z={fu[1] - 1.5} t={t} anim="sentadilla" desfase={i * 0.4} />
        </group>
      ))}
      <Barra x={fu[0] - 1} y={0.22} z={fu[1] + 1.8} />
      <Barra x={fu[0] + 2} y={0.22} z={fu[1] + 1.8} />
      <Persona x={fu[0]} z={fu[1] + 1} t={t} anim="caminar" coach resaltar={coachResaltado} rotY={Math.PI} />

      {/* Acondicionamiento: remos */}
      {[-3, -1.5, 0, 1.5].map((dx, i) => (
        <group key={dx}>
          <Maquina x={ac[0] + dx} z={ac[1] - 0.5} />
          <Persona x={ac[0] + dx} z={ac[1] - 0.2} t={t} anim="remo" desfase={i * 0.25} />
        </group>
      ))}
      <Persona x={ac[0] + 3.2} z={ac[1] + 2} t={t} anim="caminar" coach resaltar={coachResaltado} rotY={-2.4} />

      {/* Híbrido: pista con carriles, barras y cajón */}
      {[-1.2, 0, 1.2].map((dz) => (
        <Neon key={dz} desde={[hi[0] - 4, hi[1] + dz]} hasta={[hi[0] + 4, hi[1] + dz]} color="#3b3f55" grosor={0.05} />
      ))}
      <Persona x={hi[0] - 2 + ((t * 1.2) % 4)} z={hi[1] - 0.6} t={t} anim="caminar" rotY={Math.PI / 2} />
      <Barra x={hi[0] - 2} y={0.22} z={hi[1] - 2.6} />
      <Persona x={hi[0] - 2} z={hi[1] - 2.2} t={t} anim="sentadilla" desfase={0.7} />
      <Cajon x={hi[0] + 2.5} z={hi[1] + 2.3} />
      <Persona x={hi[0] + 1.3} z={hi[1] + 2.3} t={t} anim="salto" desfase={0.2} />
      <Persona x={hi[0] + 3.4} z={hi[1] - 2.4} t={t} anim="caminar" coach resaltar={coachResaltado} rotY={-2.2} />

      {/* Barra */}
      <Mostrador x={ba[0]} z={ba[1]} />
      <Persona x={ba[0] - 1} z={ba[1] - 0.9} t={t} anim="quieto" />

      {marcadores.map((m) => (
        <MarcadorZona key={m.zona} m={m} t={t} />
      ))}
    </ThreeCanvas>
  );
};
