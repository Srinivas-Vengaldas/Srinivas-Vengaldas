import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { seeded } from "./seeded";

// Stations along the belt. "Score" applies the Smart-DMV rules:
// auto-approve (all fields match, confidence ≥ 85%), exception (expired, 2+ mismatches or < 45%), else staff review.
const STATIONS = [
  { name: "Upload", x: -4.2 },
  { name: "Quality gate", x: -2.1 },
  { name: "OCR", x: 0 },
  { name: "Score", x: 2.1 },
];
const END_X = 4.4;
const POOL = 14;
const SPEED = 1.5;
const COLORS = { pending: "#f2efe6", approve: "#62d394", review: "#ffc94a", reject: "#ff7a66" };

// Illustrative mix of outcomes, repeated in a fixed order.
const rand = seeded(42);
const OUTCOMES = Array.from({ length: 40 }, () => {
  const r = rand();
  return r < 0.6 ? "approve" : r < 0.8 ? "review" : r < 0.9 ? "blurry" : "reject";
});

function Flow({ check, onCount, reducedMotion }) {
  const docs = useRef([]);
  const state = useRef({ next: 0, spawn: 0, seq: 0 });
  const items = useMemo(() => Array.from({ length: POOL }, (_, i) => i), []);
  const stationMat = useRef([]);

  const color = new THREE.Color();

  useFrame((_, delta) => {
    const s = state.current;
    const speed = reducedMotion ? 0.5 : 1;
    s.spawn -= delta;
    if (s.spawn <= 0) {
      s.spawn = (reducedMotion ? 2.6 : 0.8);
      const mesh = docs.current.find((m) => m && !m.userData.active);
      if (mesh) {
        mesh.userData = { active: true, outcome: OUTCOMES[s.seq++ % OUTCOMES.length], phase: "belt", fade: 1 };
        mesh.position.set(STATIONS[0].x - 0.6, 0.05, 0);
        mesh.material.color.set(COLORS.pending);
        mesh.material.opacity = 1;
        mesh.visible = true;
      }
    }

    docs.current.forEach((m) => {
      if (!m || !m.userData.active) return;
      const d = m.userData;
      if (d.phase === "belt") {
        m.position.x += SPEED * speed * delta;
        m.position.y = 0.05 + Math.abs(Math.sin(m.position.x * 1.6)) * 0.06;
        if (check && d.outcome === "blurry" && m.position.x >= STATIONS[1].x) {
          d.phase = "back";
          m.material.color.set(COLORS.reject);
          onCount("fixed");
        } else if (check && m.position.x >= STATIONS[3].x) {
          const result = d.outcome === "blurry" ? "reject" : d.outcome;
          m.material.color.set(COLORS[result]);
          d.phase = result === "approve" ? "out" : result === "review" ? "review" : "back";
          onCount(result === "approve" ? "approved" : result === "review" ? "review" : "fixed");
        } else if (!check && m.position.x >= END_X - 0.4) {
          const fails = d.outcome === "reject" || d.outcome === "blurry";
          m.material.color.set(fails ? COLORS.reject : COLORS.approve);
          d.phase = fails ? "counter" : "out";
          onCount(fails ? "counter" : "approved");
        }
      } else if (d.phase === "out") {
        m.position.x += SPEED * speed * delta;
        m.position.y += delta * 0.5;
        d.fade -= delta * 0.9;
      } else if (d.phase === "review") {
        m.position.z += delta * 1.4 * speed;
        d.fade -= delta * 0.7;
      } else if (d.phase === "back") {
        m.position.z -= delta * 1.2 * speed;
        m.position.x -= delta * 1.6 * speed;
        m.position.y += delta * 0.3;
        d.fade -= delta * 0.6;
      } else if (d.phase === "counter") {
        m.position.y -= delta * 0.6;
        m.rotation.z += delta * 2;
        d.fade -= delta * 0.8;
      }
      m.material.opacity = Math.max(0, d.fade);
      if (d.fade <= 0) {
        d.active = false;
        m.visible = false;
        m.rotation.z = 0;
      }
    });

    stationMat.current.forEach((mat, i) => {
      if (!mat) return;
      const on = check || i === 0;
      mat.emissive.lerp(color.set(on && (i === 1 || i === 3) ? "#3a2800" : "#000000"), 0.1);
      mat.opacity = on ? 1 : 0.35;
    });
  });

  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[10, 0.05, 0.6]} />
        <meshStandardMaterial color="#14120b" />
      </mesh>
      {STATIONS.map((st, i) => (
        <group key={st.name} position={[st.x, -0.25, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.22, 1.3]} />
            <meshStandardMaterial ref={(m) => (stationMat.current[i] = m)} color="#2b2719" transparent />
          </mesh>
          <Html center position={[0, -0.45, 0.8]} zIndexRange={[5, 0]}>
            <span className={`flow-label${check || i === 0 ? "" : " is-off"}`}>{st.name}</span>
          </Html>
        </group>
      ))}
      <mesh position={[END_X, 0.2, -1.4]}>
        <boxGeometry args={[1.3, 0.8, 0.4]} />
        <meshStandardMaterial color="#1d1a12" />
      </mesh>
      <Html center position={[END_X, 0.85, -1.4]} zIndexRange={[5, 0]}>
        <span className="flow-label">DMV counter</span>
      </Html>
      {items.map((i) => (
        <mesh key={i} ref={(el) => (docs.current[i] = el)} visible={false} rotation-x={-1.1} userData={{ active: false }}>
          <planeGeometry args={[0.42, 0.56]} />
          <meshStandardMaterial color={COLORS.pending} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Back the camera off on narrow screens so the whole belt stays in frame.
function FitView() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const k = aspect < 1.6 ? 1.6 / aspect : 1;
    camera.position.set(0, 4.2 * k, 8.4 * k);
    camera.lookAt(0, -0.4, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

const EMPTY = { approved: 0, review: 0, fixed: 0, counter: 0 };

// Idea E: leases moving through the pre-visit check, with a switch to compare against the old counter-only process.
export default function DmvFlow({ reducedMotion }) {
  const [check, setCheck] = useState(true);
  const [counts, setCounts] = useState(EMPTY);
  const onCount = (key) => setCounts((c) => ({ ...c, [key]: c[key] + 1 }));

  return (
    <div className="demo">
      <SceneCanvas
        className="demo-stage"
        label="Lease documents moving through the Smart-DMV pre-visit check"
        canvasProps={{ camera: { position: [0, 4.2, 8.4], fov: 40 } }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 5]} intensity={1.2} />
        <FitView />
        <Flow check={check} onCount={onCount} reducedMotion={reducedMotion} />
      </SceneCanvas>
      <div className="demo-hud">
        <span>{check ? "Pre-visit check" : "Old process: checked at the counter"}</span>
        <span>Illustrative mix</span>
      </div>
      <dl className="flow-stats" aria-live="polite">
        <div><dt>Approved</dt><dd>{counts.approved}</dd></div>
        <div><dt>Staff review</dt><dd>{counts.review}</dd></div>
        <div><dt>Fixed before visit</dt><dd>{counts.fixed}</dd></div>
        <div><dt>Failed at counter</dt><dd>{counts.counter}</dd></div>
      </dl>
      <div className="demo-controls">
        <button
          type="button"
          className="chip"
          aria-pressed={check}
          onClick={() => {
            setCheck((c) => !c);
            setCounts(EMPTY);
          }}
        >
          Pre-visit check {check ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}
