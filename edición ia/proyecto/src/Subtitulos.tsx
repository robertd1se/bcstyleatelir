import { Caption, createTikTokStyleCaptions, TikTokPage } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Estilo por defecto. Ajustalo según estilo.md.
const ESTILO = {
  fuente: "Arial Black, Helvetica, sans-serif",
  tamaño: 84,
  color: "white",
  colorActivo: "#FFD400",
  borde: 10,
  posicionDesdeAbajo: 420,
  // cuántos ms de palabras juntar por "página" de subtítulo
  agruparMs: 1200,
};

const Pagina: React.FC<{ pagina: TikTokPage }> = ({ pagina }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiempoMs = pagina.startMs + (frame / fps) * 1000;
  const entrada = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 6 });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: ESTILO.posicionDesdeAbajo }}>
      <div
        style={{
          fontFamily: ESTILO.fuente,
          fontSize: ESTILO.tamaño,
          fontWeight: 900,
          textAlign: "center",
          textTransform: "uppercase",
          lineHeight: 1.1,
          padding: "0 60px",
          WebkitTextStroke: `${ESTILO.borde}px black`,
          paintOrder: "stroke",
          transform: `scale(${0.8 + 0.2 * entrada})`,
          whiteSpace: "pre-wrap",
        }}
      >
        {pagina.tokens.map((t) => {
          const activo = t.fromMs <= tiempoMs && tiempoMs < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: activo ? ESTILO.colorActivo : ESTILO.color }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Subtitulos: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: ESTILO.agruparMs }),
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((pagina, i) => {
        const siguiente = pages[i + 1]?.startMs ?? pagina.startMs + pagina.durationMs;
        const desde = Math.round((pagina.startMs / 1000) * fps);
        const hasta = Math.round((Math.min(siguiente, pagina.startMs + pagina.durationMs) / 1000) * fps);
        if (hasta <= desde) return null;
        return (
          <Sequence key={i} from={desde} durationInFrames={hasta - desde} layout="none">
            <Pagina pagina={pagina} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
