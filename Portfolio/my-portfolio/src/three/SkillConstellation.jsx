import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";

const SKILL_RADIUS = 3.1;
const PROJECT_RADIUS = 1.7;

// Pull the camera back on narrow screens so the outer labels stay in frame.
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.position.setLength(aspect < 1.2 ? 9 + (1.2 - aspect) * 9 : 9);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Constellation({ projects, skills, edges, selected, onSelect, reducedMotion }) {
  const group = useRef();
  const skillLabels = useRef([]);
  const lines = useRef([]);

  const projectPos = useMemo(
    () =>
      projects.map((_, i) => {
        const a = (i / projects.length) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * PROJECT_RADIUS, (i % 2 ? 0.35 : -0.35), Math.sin(a) * PROJECT_RADIUS);
      }),
    [projects]
  );

  const skillPos = useMemo(
    () =>
      skills.map((_, i) => {
        const y = 1 - ((i + 0.5) / skills.length) * 2;
        const r = Math.sqrt(1 - y * y);
        const t = i * 2.399963;
        return new THREE.Vector3(Math.cos(t) * r * SKILL_RADIUS, y * SKILL_RADIUS * 0.8, Math.sin(t) * r * SKILL_RADIUS);
      }),
    [skills]
  );

  const edgeGeometry = useMemo(
    () =>
      edges.map((e) =>
        new THREE.BufferGeometry().setFromPoints([
          projectPos[projects.findIndex((p) => p.id === e.project)],
          skillPos[skills.indexOf(e.skill)],
        ])
      ),
    [edges, projects, skills, projectPos, skillPos]
  );

  const lit = useMemo(() => {
    if (!selected) return { projects: new Set(), skills: new Set(), edges: new Set() };
    const hit = edges.filter((e) => (selected.type === "project" ? e.project === selected.id : e.skill === selected.id));
    return {
      projects: new Set(hit.map((e) => e.project)),
      skills: new Set(hit.map((e) => e.skill)),
      edges: new Set(hit.map((e) => edges.indexOf(e))),
    };
  }, [selected, edges]);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (!reducedMotion) group.current.rotation.y += delta * 0.12;
    const k = reducedMotion ? 1 : 1 - Math.pow(0.01, delta);
    lines.current.forEach((mat, i) => {
      if (!mat) return;
      const want = !selected ? 0.22 : lit.edges.has(i) ? 0.95 : 0.04;
      mat.opacity += (want - mat.opacity) * k;
    });
    const world = new THREE.Vector3();
    skillPos.forEach((p, i) => {
      const el = skillLabels.current[i];
      if (!el) return;
      world.copy(p);
      group.current.localToWorld(world);
      const show = world.z > -1.4 || lit.skills.has(skills[i]);
      el.style.opacity = show ? 1 : 0;
    });
  });

  const pick = (type, id) => (event) => {
    event.stopPropagation();
    onSelect(selected?.type === type && selected?.id === id ? null : { type, id });
  };

  return (
    <group ref={group}>
      {edgeGeometry.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial ref={(m) => (lines.current[i] = m)} color="#FFD700" transparent opacity={0.22} />
        </line>
      ))}

      {projects.map((p, i) => {
        // Project names only show when picked: the buttons beside the graph name them all.
        const on = lit.projects.has(p.id);
        return (
          <group key={p.id} position={projectPos[i]}>
            <mesh onClick={pick("project", p.id)} scale={lit.projects.has(p.id) ? 1.5 : 1}>
              <icosahedronGeometry args={[0.2, 1]} />
              <meshStandardMaterial color="#FFD700" emissive="#5a3f00" metalness={0.4} roughness={0.35} />
            </mesh>
            <Html center position={[0, -0.38, 0]} zIndexRange={[5, 0]}>
              {on && <span className="node-label is-project">{p.title}</span>}
            </Html>
          </group>
        );
      })}

      {skills.map((s, i) => {
        const on = lit.skills.has(s);
        return (
          <group key={s} position={skillPos[i]}>
            <mesh onClick={pick("skill", s)} scale={on ? 1.8 : 1}>
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshStandardMaterial color={on ? "#FFD700" : "#f2f2f2"} emissive={on ? "#6b4c00" : "#2a2a2a"} />
            </mesh>
            <Html center position={[0, 0.24, 0]} zIndexRange={[5, 0]}>
              <span ref={(el) => (skillLabels.current[i] = el)} className={`node-label${on ? " is-on" : ""}`}>
                {s}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function SkillConstellation(props) {
  return (
    <SceneCanvas
      className="skill-constellation"
      label="Graph linking each project to the skills it uses"
      canvasProps={{ camera: { position: [0, 0.6, 9], fov: 40 }, onPointerMissed: () => props.onSelect(null) }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} />
      <pointLight position={[-6, -2, -4]} intensity={20} color="#4455ff" />
      <FitCamera />
      <Constellation {...props} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </SceneCanvas>
  );
}
