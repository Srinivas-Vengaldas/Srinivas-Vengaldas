import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls } from "@react-three/drei";
import SceneCanvas from "./SceneCanvas";
import StudioLights from "./StudioLights";
import MirrorCube from "./MirrorCube";

// Generated once per page load, outside render.
const PARTICLES = Array.from({ length: 40 }, () => ({
  position: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8],
  scale: Math.random() * 0.4 + 0.1,
  speed: Math.random() * 0.5 + 0.2,
}));

function FloatingParticles({ reducedMotion }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y -= delta * 0.05;
    group.current.rotation.x += delta * 0.02;
  });

  return (
    <group ref={group}>
      {PARTICLES.map((p, i) => (
        <Float key={i} speed={reducedMotion ? 0 : p.speed} rotationIntensity={1} floatIntensity={2}>
          <mesh position={p.position} scale={p.scale}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} metalness={1} roughness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function SpinningCube({ compact, reducedMotion }) {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    if (!reducedMotion) {
      group.current.rotation.y += 0.006;
      group.current.rotation.x += 0.003;
    }
    group.current.rotation.z = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });
  return (
    <group position={compact ? [0, 3.9, -3] : [3.5, 0, 0]} scale={compact ? 0.42 : 0.85}>
      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={group} rotation={[0.5, -0.6, 0]}>
          <MirrorCube autoScramble reducedMotion={reducedMotion} />
        </group>
      </Float>
    </group>
  );
}

// Fixed full-screen backdrop behind the hero. `active` pauses rendering once the hero is scrolled away.
export default function HeroScene({ active, compact, reducedMotion }) {
  return (
    <SceneCanvas
      className="hero-scene"
      active={active}
      canvasProps={{ camera: { position: [0, 0, 12], fov: compact ? 50 : 35, far: 100 } }}
    >
      <color attach="background" args={["#050505"]} />
      <StudioLights />
      <FloatingParticles reducedMotion={reducedMotion} />
      <SpinningCube compact={compact} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={30} blur={3} far={5} color="black" />
      <OrbitControls enableZoom={false} enablePan={false} enabled={active && !compact} />
    </SceneCanvas>
  );
}
