import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";

const R = 1.6;
const ARC_POINTS = 96;

function latLon(lat, lon, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Rotation (x, y) that brings a point on the globe to face the camera on +z.
function aimAt(v) {
  const y = Math.atan2(-v.x, v.z);
  const zAfter = -v.x * Math.sin(y) + v.z * Math.cos(y);
  return { x: Math.atan2(v.y, zAfter), y };
}

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function Globe({ stops, activeIndex, reducedMotion }) {
  const group = useRef();
  const labels = useRef([]);
  const rings = useRef([]);
  const target = useRef({ x: 0.3, y: 0 });
  const progress = useRef([]);

  const dots = useMemo(() => {
    const n = 1800;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * 2.399963;
      positions.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const markers = useMemo(() => stops.map((s) => latLon(s.lat, s.lon, R * 1.01)), [stops]);

  const arcs = useMemo(
    () =>
      markers.slice(0, -1).map((a, i) => {
        const b = markers[i + 1];
        const mid = a.clone().add(b).multiplyScalar(0.5);
        mid.setLength(R * (1.2 + a.distanceTo(b) * 0.12));
        const geometry = new THREE.BufferGeometry().setFromPoints(
          new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(ARC_POINTS)
        );
        geometry.setDrawRange(0, 0);
        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#FFD700" }));
      }),
    [markers]
  );

  useEffect(() => {
    const aim = aimAt(markers[activeIndex]);
    const current = group.current ? group.current.rotation.y : 0;
    target.current = { x: aim.x, y: current + wrap(aim.y - current) };
  }, [activeIndex, markers]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const k = reducedMotion ? 1 : 1 - Math.pow(0.03, delta);
    g.rotation.x += (target.current.x - g.rotation.x) * k;
    g.rotation.y += (target.current.y - g.rotation.y) * k;

    arcs.forEach((line, i) => {
      const want = i < activeIndex ? 1 : 0;
      const p = (progress.current[i] ?? 0) + (want - (progress.current[i] ?? 0)) * (reducedMotion ? 1 : 1 - Math.pow(0.05, delta));
      progress.current[i] = p;
      line.geometry.setDrawRange(0, Math.round(p * (ARC_POINTS + 1)));
    });

    const world = new THREE.Vector3();
    markers.forEach((m, i) => {
      world.copy(m);
      g.localToWorld(world);
      if (labels.current[i]) labels.current[i].style.opacity = world.z > 0.3 ? 1 : 0;
      const ring = rings.current[i];
      if (ring) {
        const pulse = reducedMotion ? 0.5 : (state.clock.elapsedTime * 0.8 + i * 0.3) % 1;
        ring.scale.setScalar(1 + pulse * 1.2);
        ring.material.opacity = 0.8 * (1 - pulse);
      }
    });
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[R * 0.985, 48, 48]} />
        <meshBasicMaterial color="#0d0b06" />
      </mesh>
      <points geometry={dots}>
        <pointsMaterial color="#8a7a45" size={0.028} sizeAttenuation />
      </points>
      {arcs.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      {markers.map((m, i) => (
        <group key={stops[i].id} position={m}>
          <mesh>
            <sphereGeometry args={[i === activeIndex ? 0.07 : 0.05, 16, 16]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh ref={(el) => (rings.current[i] = el)} onUpdate={(self) => self.lookAt(m.clone().multiplyScalar(2))}>
            <ringGeometry args={[0.08, 0.11, 32]} />
            <meshBasicMaterial color="#FFD700" transparent side={THREE.DoubleSide} />
          </mesh>
          <Html center position={[0, 0.22, 0]} zIndexRange={[5, 0]}>
            <span
              ref={(el) => (labels.current[i] = el)}
              className={`globe-label${i === activeIndex ? " is-active" : ""}`}
            >
              {stops[i].place}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function JourneyGlobe({ stops, activeIndex, reducedMotion }) {
  return (
    <SceneCanvas
      className="journey-globe"
      label="Globe with arcs from Hyderabad to Singapore to Washington, DC"
      canvasProps={{ camera: { position: [0, 0, 5.6], fov: 40 } }}
    >
      <Globe stops={stops} activeIndex={activeIndex} reducedMotion={reducedMotion} />
    </SceneCanvas>
  );
}
