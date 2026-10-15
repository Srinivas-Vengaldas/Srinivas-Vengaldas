import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import StudioLights from "./StudioLights";
import MirrorCube from "./MirrorCube";

const MOVES = [["x", 1, -1], ["y", -1, 1], ["z", 1, 1], ["y", 1, -1], ["x", -1, 1], ["z", -1, -1]];

function NavigatorCube({ activeIndex, views, reducedMotion }) {
  const cube = useRef();
  const group = useRef();
  const target = useMemo(() => new THREE.Quaternion(), []);
  const first = useRef(true);

  useEffect(() => {
    const aim = () => target.setFromEuler(new THREE.Euler(...views[activeIndex]));
    if (first.current || reducedMotion || !cube.current) {
      aim();
      if (first.current && group.current) group.current.quaternion.copy(target);
      first.current = false;
      return;
    }
    // Two layer turns, then settle on this project's face.
    cube.current.turn(...MOVES[(activeIndex * 2) % MOVES.length], 0.3);
    cube.current.turn(...MOVES[(activeIndex * 2 + 1) % MOVES.length], 0.3).then(aim);
  }, [activeIndex, views, reducedMotion, target]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.quaternion.slerp(target, reducedMotion ? 1 : 1 - Math.pow(0.002, delta));
    group.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.1) * 0.08;
  });

  return (
    <group ref={group} scale={0.78}>
      <MirrorCube ref={cube} reducedMotion={reducedMotion} />
    </group>
  );
}

export default function ProjectCube({ activeIndex, views, reducedMotion }) {
  return (
    <SceneCanvas
      className="project-cube"
      label="Gold mirror cube that turns to a new face for each project"
      canvasProps={{ camera: { position: [0, 0, 11], fov: 35 } }}
    >
      <StudioLights />
      <NavigatorCube activeIndex={activeIndex} views={views} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -3.4, 0]} opacity={0.35} scale={14} blur={2.5} far={5} color="black" />
      <OrbitControls enableZoom={false} enablePan={false} />
    </SceneCanvas>
  );
}
