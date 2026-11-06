// Plano del gimnasio 3D de RXT (metros). x: izquierda→derecha, z: fondo→frente, y: altura.
export type Zona = {
  id: string;
  nombre: string;
  centro: [number, number]; // x, z
  tamaño: [number, number]; // ancho (x), profundidad (z)
  piso: string;
};

export const ZONAS: Zona[] = [
  { id: "funcional", nombre: "Funcional", centro: [-5.5, -4], tamaño: [9, 7], piso: "#1b2a1e" },
  { id: "fuerza", nombre: "Fuerza", centro: [5.5, -4], tamaño: [9, 7], piso: "#241a1a" },
  { id: "acondicionamiento", nombre: "Acondicionamiento", centro: [-5.5, 4.5], tamaño: [9, 7], piso: "#161c2c" },
  { id: "hibrido", nombre: "Híbrido", centro: [5.5, 4.5], tamaño: [9, 7], piso: "#1d1830" },
  { id: "barra", nombre: "Barra", centro: [0, 11], tamaño: [8, 3], piso: "#2a2014" },
];

export const zona = (id: string) => {
  const z = ZONAS.find((z) => z.id === id);
  if (!z) throw new Error(`Zona desconocida: ${id}`);
  return z;
};

export const TAMAÑO_PISO: [number, number] = [24, 26];
