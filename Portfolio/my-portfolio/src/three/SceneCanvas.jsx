import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import SafeBoundary from "../components/SafeBoundary";
import { useInView } from "../hooks/media";

// A Canvas that mounts when it first nears the viewport and only renders frames while visible.
// Pass `active` to override visibility (the fixed hero background uses this).
export default function SceneCanvas({ className, label, active, canvasProps, children }) {
  const ref = useRef(null);
  const near = useInView(ref, { rootMargin: "300px", once: true });
  const visible = useInView(ref);
  const running = active ?? visible;

  return (
    <div ref={ref} className={className} role={label ? "img" : undefined} aria-label={label}>
      {near && (
        <SafeBoundary>
          <Canvas frameloop={running ? "always" : "never"} dpr={[1, 2]} {...canvasProps}>
            <Suspense fallback={null}>{children}</Suspense>
          </Canvas>
        </SafeBoundary>
      )}
    </div>
  );
}
