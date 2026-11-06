// Valores del estilo de edición. Si cambiás algo acá, actualizá estilo.md (y viceversa).
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1920;

export const COLORES = {
  blanco: "#FFFFFF",
  negro: "#0A0A0A",
  rojo: "#CC1310", // acento principal: palabra clave, nombres, títulos
  azul: "#1F4FFF", // acento secundario: líneas, barras, llamada a la acción
};

export const FUENTES = {
  titulos: "Montserrat, sans-serif", // 900
  subtitulos: "Montserrat, sans-serif", // 700 normal, 900 palabra clave
  textoChico: "Inter, sans-serif", // 500/700, etiquetas y CTA
};

export const SUBTITULOS = {
  tamaño: 58, // px
  maxPalabras: 3,
  centroY: 0.55, // centro del bloque al 55 % de la altura
  margenLateral: 90, // px
  escalaClave: 1.15, // la palabra clave es 15 % más grande
  entradaFrames: 4, // cada palabra entra con un "pop" de 4 cuadros
  sombra: "0 4px 14px rgba(0,0,0,0.65)",
};

export const TRANSICION_LATIGO = {
  frames: 6, // 0,2 s a 30 fps
  desenfoqueMax: 60, // px, desenfoque horizontal en el punto medio
};

export const CIERRE = {
  frames: 60, // 2 s
  anchoLogo: 300, // px
};
