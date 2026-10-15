import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { seeded } from "./seeded";

// Results from the Autix README (300-image held-out test set).
const MODELS = {
  vgg19: { label: "VGG19", blocks: ["Input", "Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Head"], accuracy: "87.0%", auc: "0.936", focus: [0.62, 0.38] },
  xception: {
    label: "Xception",
    blocks: ["Input", "Entry 1", "Entry 2", "Entry 3", "Middle ×8", "Exit 1", "Exit 2", "Head"],
    accuracy: "84.0%",
    auc: "0.906",
    focus: [0.4, 0.55],
  },
};
const SIZE = 128;

// Abstract sample input (soft shapes, not a face), optionally with a class activation heatmap on top.
function drawInput(ctx, focus) {
  ctx.fillStyle = "#1b1810";
  ctx.fillRect(0, 0, SIZE, SIZE);
  [["#3a5f8a", 0.25, 0.32, 0.27], ["#c79a4a", 0.64, 0.36, 0.2], ["#6f8f5a", 0.47, 0.72, 0.24]].forEach(([c, x, y, r]) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x * SIZE, y * SIZE, r * SIZE, 0, Math.PI * 2);
    ctx.fill();
  });
  if (focus) {
    const [fx, fy] = focus;
    const g = ctx.createRadialGradient(fx * SIZE, fy * SIZE, 4, fx * SIZE, fy * SIZE, SIZE * 0.38);
    g.addColorStop(0, "rgba(255,60,0,0.85)");
    g.addColorStop(0.5, "rgba(255,210,0,0.45)");
    g.addColorStop(1, "rgba(255,210,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
}

function paint(input, focus) {
  drawInput(input.ctx, focus);
  input.texture.needsUpdate = true;
}

function featureMap(rand, cells, hot) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const s = 64 / cells;
  for (let i = 0; i < cells; i++)
    for (let j = 0; j < cells; j++) {
      const v = Math.min(1, rand() * (hot ? 1.5 : 1));
      ctx.fillStyle = `rgba(255,${Math.floor(150 + v * 80)},${Math.floor(40 * v)},${0.08 + v * 0.85})`;
      ctx.fillRect(i * s, j * s, s - 1, s - 1);
    }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Layers({ model, runId, onDone, reducedMotion }) {
  const group = useRef();
  const pulse = useRef();
  const planes = useRef([]);
  const run = useRef(null);
  const blocks = MODELS[model].blocks;

  const input = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { ctx: canvas.getContext("2d"), texture };
  }, []);

  const maps = useMemo(() => {
    const rand = seeded(model === "vgg19" ? 19 : 71);
    return blocks.map((_, i) => ({
      idle: i === 0 ? null : featureMap(rand, Math.max(3, 16 - i * 2), false),
      hot: i === 0 ? null : featureMap(rand, Math.max(3, 16 - i * 2), true),
    }));
  }, [model, blocks]);

  const layout = useMemo(() => {
    const span = 6.2;
    return blocks.map((_, i) => {
      const k = i / (blocks.length - 1);
      return { x: -span / 2 + k * span, size: 1.9 - k * 1.3 };
    });
  }, [blocks]);

  useEffect(() => {
    paint(input, null);
    run.current = null;
    if (pulse.current) pulse.current.visible = false;
  }, [model, input]);

  useEffect(() => {
    if (!runId) return;
    paint(input, null);
    planes.current.forEach((p, i) => p && i > 0 && (p.material.map = maps[i].idle));
    run.current = { t: 0, hit: -1 };
  }, [runId, input, maps]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reducedMotion) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
    planes.current.forEach((p) => p && p.material.emissive.lerp(new THREE.Color("#000000"), 0.06));

    const r = run.current;
    if (!r) return;
    r.t += delta * (reducedMotion ? 40 : 1);
    const total = blocks.length * 0.42;
    const k = Math.min(1, r.t / total);
    const f = k * (blocks.length - 1);
    const i = Math.floor(f);
    const j = Math.min(blocks.length - 1, i + 1);
    pulse.current.visible = true;
    pulse.current.position.set(THREE.MathUtils.lerp(layout[i].x, layout[j].x, f - i), 0, 0);
    const hit = Math.round(f);
    if (hit !== r.hit) {
      r.hit = hit;
      const plane = planes.current[hit];
      if (plane) {
        if (hit > 0) plane.material.map = maps[hit].hot;
        plane.material.emissive.set("#ffb020");
      }
    }
    if (k >= 1) {
      pulse.current.visible = false;
      run.current = null;
      paint(input, MODELS[model].focus);
      onDone();
    }
  });

  return (
    <group ref={group}>
      {blocks.map((name, i) => (
        <mesh key={`${model}-${name}`} position={[layout[i].x, 0, 0]} rotation-y={-0.85} ref={(el) => (planes.current[i] = el)}>
          <planeGeometry args={[layout[i].size, layout[i].size]} />
          <meshStandardMaterial
            map={i === 0 ? input.texture : maps[i].idle}
            emissiveMap={i === 0 ? null : maps[i].idle}
            emissive="#000000"
            transparent
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      ))}
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

// Idea D: an illustration of an image passing through each model's blocks, ending in a heatmap.
export default function AutixLayers({ reducedMotion }) {
  const [model, setModel] = useState("vgg19");
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(false);
  const info = MODELS[model];

  const pick = (m) => {
    setModel(m);
    setDone(false);
  };

  return (
    <div className="demo">
      <SceneCanvas
        className="demo-stage"
        label={`Illustration of an image passing through the ${info.label} network`}
        canvasProps={{ camera: { position: [0.6, 1.5, 7.8], fov: 40 } }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 6]} intensity={1.2} />
        <Layers model={model} runId={runId} onDone={() => setDone(true)} reducedMotion={reducedMotion} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </SceneCanvas>
      <div className="demo-hud">
        <span>{info.label} · {info.blocks.length - 2} stages</span>
        <span>Illustration</span>
      </div>
      {done && (
        <div className="demo-result" aria-live="polite">
          <strong>Heatmap shows where {info.label} looked</strong>
          <span>
            Test set: {info.accuracy} accuracy · AUC {info.auc}
          </span>
        </div>
      )}
      <div className="demo-controls">
        <button
          type="button"
          className="chip"
          onClick={() => {
            setDone(false);
            setRunId((n) => n + 1);
          }}
        >
          Run sample image
        </button>
        {Object.entries(MODELS).map(([key, m]) => (
          <button key={key} type="button" className="chip" aria-pressed={model === key} onClick={() => pick(key)}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
