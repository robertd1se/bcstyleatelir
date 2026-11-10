// Piezas gráficas con la marca de Coach Marín.
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ZONA_SEGURA } from "../../estilo";
import { BEAT, MARIN } from "./marca";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Fondo azul noche con luz azul ambiente que respira al ritmo. */
export const FondoMarin: React.FC = () => {
  const f = useCurrentFrame();
  const pulso = 0.5 + 0.5 * Math.max(0, 1 - (f % BEAT) / 8);
  return (
    <AbsoluteFill style={{ background: MARIN.fondo, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% ${40 + 6 * Math.sin(f / 50)}%, ${MARIN.azulProfundo} 0%, #0a0e17 60%, #05070c 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 15%, ${MARIN.azul}${Math.round(30 + 25 * pulso).toString(16)}, transparent 40%)` }} />
    </AbsoluteFill>
  );
};

/** Texto de gancho en Oswald mayúsculas: cada línea entra de golpe en un tiempo distinto. */
export const TextoGancho: React.FC<{ lineas: { t: string; azul?: boolean; tiempo: number }[]; y?: number; tamaño?: number }> = ({ lineas, y = 760, tamaño = 132 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: y, left: 90, right: 150, textAlign: "center", transform: "translateY(-50%)" }}>
      {lineas.map((l, i) => {
        const desde = l.tiempo * BEAT;
        const s = spring({ frame: f - desde, fps, durationInFrames: 8, config: { damping: 11 } });
        if (f < desde && desde > 0) return null;
        return (
          <div
            key={i}
            style={{
              fontFamily: MARIN.titulo,
              fontWeight: 700,
              fontSize: tamaño,
              lineHeight: 1.0,
              textTransform: "uppercase",
              color: l.azul ? MARIN.azulClaro : MARIN.blanco,
              textShadow: l.azul ? `0 0 40px ${MARIN.azul}aa` : "0 8px 30px rgba(0,0,0,0.6)",
              transform: `scale(${desde === 0 ? 1 : interpolate(s, [0, 1], [1.35, 1])})`,
              opacity: desde === 0 ? 1 : s,
            }}
          >
            {l.t}
          </div>
        );
      })}
    </div>
  );
};

/** Un tramo de uno de sus reels: golpe de zoom al entrar, zoom lento y pulso en cada tiempo. */
export const ClipReel: React.FC<{ src: string; desde: number; duracion: number }> = ({ src, desde, duracion }) => {
  const f = useCurrentFrame();
  const golpe = interpolate(f, [0, 8], [0.08, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lento = interpolate(f, [0, duracion], [0, 0.03]);
  const pulso = 0.008 * Math.max(0, 1 - (f % BEAT) / 5);
  const blur = interpolate(f, [0, 5], [4, 0], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#05070c" }}>
      <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(desde * 30)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + golpe + lento + pulso})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }} />
    </AbsoluteFill>
  );
};

/** Tarjeta de paso del método: número grande en Oswald, título en Cormorant itálica y una línea. */
export const TarjetaPaso: React.FC<{ n: string; titulo: string; detalle: string }> = ({ n, titulo, detalle }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, durationInFrames: 10, config: { damping: 13 } });
  const d = spring({ frame: f - 6, fps, durationInFrames: 10, config: { damping: 15 } });
  return (
    <AbsoluteFill>
      <FondoMarin />
      <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: MARIN.texto, fontWeight: 700, fontSize: 30, letterSpacing: "0.4em", color: MARIN.celeste, opacity: s }}>PASO</div>
        <div style={{ fontFamily: MARIN.titulo, fontWeight: 700, fontSize: 260, lineHeight: 1, color: "transparent", WebkitTextStroke: `4px ${MARIN.azulClaro}`, textShadow: `0 0 50px ${MARIN.azul}66`, transform: `scale(${interpolate(s, [0, 1], [1.4, 1])})`, opacity: s }}>{n}</div>
        <div style={{ fontFamily: MARIN.serif, fontStyle: "italic", fontWeight: 600, fontSize: 118, color: MARIN.blanco, marginTop: 10, opacity: d, transform: `translateY(${(1 - d) * 30}px)` }}>{titulo}</div>
        <div style={{ fontFamily: MARIN.texto, fontWeight: 500, fontSize: 38, color: MARIN.gris, margin: "26px 140px 0", lineHeight: 1.35, opacity: d }}>{detalle}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Lista de programas: una fila por tiempo; el Home Challenge resaltado. */
export const ListaProgramas: React.FC<{ programas: { nombre: string; precio: string; extra: string; destacado?: boolean }[] }> = ({ programas }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 560, left: 100, right: 150, display: "flex", flexDirection: "column", gap: 22 }}>
      {programas.map((p, i) => {
        const s = spring({ frame: f - i * BEAT, fps, durationInFrames: 9, config: { damping: 12 } });
        if (f < i * BEAT) return null;
        return (
          <div key={p.nombre} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 30px", borderRadius: 22, background: p.destacado ? `linear-gradient(135deg, ${MARIN.azul}, ${MARIN.azulProfundo})` : "rgba(255,255,255,0.06)", border: `2px solid ${p.destacado ? MARIN.celeste : "rgba(255,255,255,0.12)"}`, boxShadow: p.destacado ? `0 0 40px ${MARIN.azul}88` : "none", transform: `translateX(${(1 - s) * 120}px) scale(${0.96 + 0.04 * s})`, opacity: s }}>
            <div>
              <div style={{ fontFamily: MARIN.titulo, fontWeight: 700, fontSize: 46, color: MARIN.blanco, textTransform: "uppercase", letterSpacing: "0.02em" }}>{p.nombre}</div>
              <div style={{ fontFamily: MARIN.texto, fontWeight: 500, fontSize: 24, color: p.destacado ? "#dbe6ff" : MARIN.gris, marginTop: 4 }}>{p.extra}</div>
            </div>
            <div style={{ fontFamily: MARIN.titulo, fontWeight: 700, fontSize: 52, color: MARIN.blanco }}>{p.precio}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Datos de credibilidad que cuentan hacia arriba, uno por cada dos tiempos. */
export const Datos: React.FC<{ datos: { valor: number; prefijo?: string; sufijo?: string; texto: string }[] }> = ({ datos }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 520, left: 100, right: 150, display: "flex", flexDirection: "column", gap: 44, alignItems: "center" }}>
      {datos.map((d, i) => {
        const desde = i * 2 * BEAT;
        if (f < desde) return null;
        const s = spring({ frame: f - desde, fps, durationInFrames: 10, config: { damping: 13 } });
        const v = Math.round(interpolate(f - desde, [0, 14], [0, d.valor], { ...clamp, easing: Easing.out(Easing.cubic) }));
        return (
          <div key={d.texto} style={{ textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
            <div style={{ fontFamily: MARIN.titulo, fontWeight: 700, fontSize: 150, lineHeight: 1, color: MARIN.azulClaro, textShadow: `0 0 40px ${MARIN.azul}88` }}>{d.prefijo ?? ""}{v}{d.sufijo ?? ""}</div>
            <div style={{ fontFamily: MARIN.serif, fontStyle: "italic", fontWeight: 600, fontSize: 64, color: MARIN.blanco }}>{d.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Destello azul en los golpes fuertes. */
export const DestelloAzul: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #ffffff 0%, ${MARIN.celeste} 35%, ${MARIN.azul} 70%)`, opacity: interpolate(f, [0, 2, 9], [0.85, 0.6, 0], clamp), mixBlendMode: "screen" }} />;
};

/** Cierre: logo M que aparece + tarjeta de perfil con "Seguir" que se toca. */
export const CierreMarin: React.FC<{ usuario: string }> = ({ usuario }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, durationInFrames: 14, config: { damping: 14 } });
  const t = spring({ frame: f - 14, fps, durationInFrames: 12, config: { damping: 14 } });
  const toque = 40;
  const siguiendo = f >= toque;
  const dedo = interpolate(f, [26, toque, toque + 6], [110, 0, 14], clamp);
  return (
    <AbsoluteFill>
      <FondoMarin />
      <Img src={staticFile(MARIN.logo)} style={{ position: "absolute", left: 540 - 230, top: 470, width: 460, height: 446, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`, filter: `drop-shadow(0 0 40px ${MARIN.azul}66)` }} />
      <div style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", fontFamily: MARIN.texto, fontWeight: 700, fontSize: 26, letterSpacing: "0.35em", color: MARIN.celeste, opacity: t }}>FUERZA · CONDICIÓN · MOVIMIENTO</div>
      <div style={{ position: "absolute", left: 120, right: 160, top: ZONA_SEGURA.arriba + 900, opacity: t, transform: `translateY(${(1 - t) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 26px", borderRadius: 28, background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.14)" }}>
          <div style={{ width: 86, height: 86, borderRadius: "50%", background: "#0a0e17", border: `3px solid ${MARIN.azul}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Img src={staticFile("clientes/coach-marin/logo-chico.png")} style={{ width: 74, height: 72 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: MARIN.texto, fontWeight: 700, fontSize: 30, color: MARIN.blanco }}>{usuario}</div>
            <div style={{ fontFamily: MARIN.texto, fontWeight: 500, fontSize: 22, color: MARIN.gris, marginTop: 4 }}>Método Coach Marín</div>
          </div>
          <div style={{ position: "relative", padding: "14px 28px", borderRadius: 14, background: siguiendo ? "rgba(255,255,255,0.14)" : MARIN.azul, fontFamily: MARIN.texto, fontWeight: 700, fontSize: 26, color: MARIN.blanco }}>
            {siguiendo ? "Siguiendo" : "Seguir"}
            <svg width={64} height={64} viewBox="0 0 70 70" style={{ position: "absolute", left: 40, top: 26 + dedo, opacity: interpolate(f, [24, 28, toque + 12, toque + 18], [0, 1, 1, 0], clamp) }}>
              <path d="M18 14 C18 8 26 8 26 14 L26 34 L40 36 C48 38 50 44 48 52 L44 64 L20 64 L8 42 C6 38 12 34 16 38 L18 40 Z" fill="#fff" stroke="#0b0d14" strokeWidth={3} strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** CTA de comentario: burbuja de comentario que escribe la palabra clave. */
export const CtaComenta: React.FC<{ palabra: string }> = ({ palabra }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - BEAT, fps, durationInFrames: 10, config: { damping: 12 } });
  const letras = Math.min(palabra.length, Math.max(0, Math.floor((f - BEAT - 6) / 3)));
  return (
    <div style={{ position: "absolute", top: 1010, left: 130, right: 170, opacity: s, transform: `scale(${0.9 + 0.1 * s})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 28px", borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.16)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${MARIN.azul}, ${MARIN.celeste})` }} />
        <div style={{ fontFamily: MARIN.texto, fontWeight: 700, fontSize: 44, color: MARIN.blanco }}>
          {palabra.slice(0, letras)}
          <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: MARIN.celeste }}>|</span>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: MARIN.texto, fontWeight: 700, fontSize: 28, color: MARIN.azulClaro }}>Publicar</div>
      </div>
    </div>
  );
};
