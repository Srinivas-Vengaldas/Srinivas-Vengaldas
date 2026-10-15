import { Environment, Lightformer } from "@react-three/drei";

// Reflections for the gold metal, built from light panels in the scene.
// Nothing is downloaded, so a blocked CDN can no longer black out the page.
export default function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} intensity={80} angle={0.5} penumbra={1} />
      <pointLight position={[-10, 0, -10]} intensity={20} color="#4444ff" />
      <pointLight position={[0, -10, 0]} intensity={10} color="#ffaa00" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 0.6, 1]} />
        <Lightformer form="rect" intensity={2} position={[6, 1, -1]} rotation-y={-Math.PI / 2} scale={[20, 0.6, 1]} />
        <Lightformer form="ring" color="#ffd27a" intensity={3} position={[0, 1, 7]} scale={3} />
        <Lightformer form="rect" color="#3d55ff" intensity={1.5} position={[0, -6, -2]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
    </>
  );
}
