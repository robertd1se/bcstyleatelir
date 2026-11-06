import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { linearTiming } from "@remotion/transitions";
import { AbsoluteFill, Easing } from "remotion";
import { TRANSICION_LATIGO } from "../estilo";

type Props = { direccion: "izquierda" | "derecha" };

// Paneo látigo: el plano que sale se va de costado con desenfoque horizontal
// y el que entra llega desde el otro lado, también desenfocado.
const LatigoComponente: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const signo = passedProps.direccion === "izquierda" ? -1 : 1;
  const p = presentationProgress;
  const saliendo = presentationDirection === "exiting";
  const x = saliendo ? signo * p * 100 : -signo * (1 - p) * 100;
  // el desenfoque es máximo en el medio de la transición
  const blur = TRANSICION_LATIGO.desenfoqueMax * Math.sin(Math.PI * p);
  const id = `latigo-${presentationDirection}`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-50%" y="0" width="200%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${x}%)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const latigo = (direccion: Props["direccion"] = "izquierda"): TransitionPresentation<Props> => ({
  component: LatigoComponente,
  props: { direccion },
});

export const tiempoLatigo = linearTiming({
  durationInFrames: TRANSICION_LATIGO.frames,
  easing: Easing.inOut(Easing.cubic),
});
