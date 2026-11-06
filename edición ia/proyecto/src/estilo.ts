// Valores del estilo de edición. Si cambiás algo acá, actualizá estilo.md (y viceversa).
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/bodoni-moda/500.css";
import "@fontsource/bodoni-moda/600.css";
import "@fontsource/allura/400.css";

export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1920;

// Zona segura de Instagram Reels (px sobre 1080x1920): lo que queda fuera lo tapa la interfaz
// (arriba: título "Reels"; abajo: usuario, descripción y audio; derecha: botones) o lo recorta el feed (4:5).
export const ZONA_SEGURA = { arriba: 290, abajo: 440, derecha: 140, izquierda: 70 };

export const COLORES = {
  blanco: "#FFFFFF",
  negro: "#0A0A0A",
  rojo: "#CC1310", // acento principal: palabra clave, nombres, títulos
  azul: "#1F4FFF", // acento secundario: líneas, barras, llamada a la acción
  dorado: "#E2B65A", // palabras clave en manuscrita (serie RXT)
  rojoTexto: "#E0352B", // rojo de marca un poco más claro para texto manuscrito sobre fondo oscuro
};

export const FUENTES = {
  titulos: "Montserrat, sans-serif", // 900
  subtitulos: "Montserrat, sans-serif", // 700 normal, 900 palabra clave
  textoChico: "Inter, sans-serif", // 500/700, etiquetas y CTA
  // Serie RXT: combinación editorial
  editorial: "'Bodoni Moda', serif", // 500 texto, 600 títulos de tarjetas · blanco
  manuscrita: "Allura, cursive", // palabras clave · dorado o rojo, ~1,55× más grande
};

export const SUBTITULOS = {
  tamaño: 58, // px
  maxPalabras: 3,
  centroY: 0.55, // centro del bloque al 55 % de la altura
  centroYAlternativo: 0.3, // si al 55 % taparía algo importante (texto, cara, producto)
  margenLateral: 90, // px
  escalaClave: 1.15, // la palabra clave es 15 % más grande
  entradaFrames: 4, // cada palabra entra con un "pop" de 4 cuadros
  sombra: "0 4px 14px rgba(0,0,0,0.65)",
};

export const GANCHO = {
  tamaño1: 120, // px, línea blanca (máximo)
  tamaño2: 150, // px, línea roja (máximo)
  margenLateral: 80, // px mínimos a cada lado; si no entra, la línea se achica
};

export const TRANSICION_LATIGO = {
  frames: 6, // 0,2 s a 30 fps
  desenfoqueMax: 60, // px, desenfoque horizontal en el punto medio
};

export const CIERRE = {
  frames: 60, // 2 s
  anchoLogo: 300, // px
};
