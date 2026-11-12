// Aproximación del símbolo de Supernova (cruz con un anillo en órbita), dibujada a partir del reel S1.
// PENDIENTE: reemplazar por el archivo real del logo cuando el usuario lo pase (proyecto/public/clientes/supernova/).
export const LogoSupernova: React.FC<{ tamaño: number; color?: string; giro?: number }> = ({ tamaño, color = "white", giro = 0 }) => (
  <svg width={tamaño} height={tamaño} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="sn-eje" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.15" />
        <stop offset="0.3" stopColor={color} />
        <stop offset="1" stopColor={color} stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <g transform={`rotate(${-10 + giro} 50 38)`}>
      {/* mitad de atrás del anillo (pasa por detrás del eje) */}
      <path d="M12 38 A38 9 0 0 1 88 38" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="2.5" />
    </g>
    {/* eje vertical, fino y con puntas */}
    <path d="M50 2 L51.8 38 L50 98 L48.2 38 Z" fill="url(#sn-eje)" />
    {/* brazo horizontal corto */}
    <path d="M36 24 L50 22.6 L64 24 L50 25.4 Z" fill={color} />
    <g transform={`rotate(${-10 + giro} 50 38)`}>
      {/* mitad de adelante del anillo, más gruesa */}
      <path d="M12 38 A38 9 0 0 0 88 38" fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
    </g>
  </svg>
);
