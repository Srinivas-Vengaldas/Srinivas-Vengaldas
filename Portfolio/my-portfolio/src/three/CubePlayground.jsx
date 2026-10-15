import { useEffect, useRef, useState } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import SceneCanvas from "./SceneCanvas";
import StudioLights from "./StudioLights";
import MirrorCube from "./MirrorCube";
import { useInView } from "../hooks/media";

// Face turns in standard cube notation, mapped to (axis, layer, direction).
const MOVES = { U: ["y", 1, -1], D: ["y", -1, 1], R: ["x", 1, -1], L: ["x", -1, 1], F: ["z", 1, -1], B: ["z", -1, 1] };
const KEYS = Object.keys(MOVES);

// Idea F: the mirror cube, playable. Solve replays the move history backwards.
export default function CubePlayground({ reducedMotion }) {
  const cube = useRef(null);
  const wrap = useRef(null);
  const onScreen = useInView(wrap);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [solvedIn, setSolvedIn] = useState(null);

  const turn = (key, seconds = 0.3) => {
    if (!cube.current) return Promise.resolve();
    const [axis, layer, dir] = MOVES[key];
    return cube.current.turn(axis, layer, dir, seconds);
  };

  const move = (key) => {
    if (busy) return;
    setSolvedIn(null);
    setHistory((h) => [...h, key]);
    turn(key);
  };

  const scramble = async () => {
    if (busy || !cube.current) return;
    setBusy(true);
    setSolvedIn(null);
    const seq = Array.from({ length: 12 }, (_, i) => KEYS[(i * 7 + history.length * 3 + 1) % KEYS.length]);
    setHistory((h) => [...h, ...seq]);
    await Promise.all(seq.map((k) => turn(k, 0.16)));
    setBusy(false);
  };

  const solve = async () => {
    const moves = history;
    if (busy || !moves.length || !cube.current) return;
    setBusy(true);
    const steps = [...moves].reverse().map((k) => {
      const [axis, layer, dir] = MOVES[k];
      return cube.current.turn(axis, layer, -dir, 0.14);
    });
    await Promise.all(steps);
    setSolvedIn(moves.length);
    setHistory([]);
    setBusy(false);
  };

  // Keyboard turns while the cube is on screen.
  useEffect(() => {
    if (!onScreen) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      const key = e.key.toUpperCase();
      if (MOVES[key]) move(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="playground" ref={wrap}>
      <div className="demo">
        <SceneCanvas
          className="playground-stage"
          label="Playable gold mirror cube"
          canvasProps={{ camera: { position: [0, 0, 11], fov: 35 } }}
        >
          <StudioLights />
          <group rotation={[0.5, -0.6, 0]} scale={0.8}>
            <MirrorCube ref={cube} reducedMotion={reducedMotion} />
          </group>
          <ContactShadows position={[0, -3.4, 0]} opacity={0.35} scale={14} blur={2.5} far={5} color="black" />
          <OrbitControls enableZoom={false} enablePan={false} />
        </SceneCanvas>
        <div className="demo-hud">
          <span>Solve the cube</span>
          <span aria-live="polite">
            {solvedIn ? `Solved in ${solvedIn} moves` : `${history.length} move${history.length === 1 ? "" : "s"}`}
          </span>
        </div>
        {solvedIn !== null && (
          <div className="demo-result">
            <strong>Solved. Now say hi.</strong>
            <span>Email, LinkedIn and resume are right here.</span>
          </div>
        )}
      </div>
      <div className="demo-controls" role="group" aria-label="Cube moves">
        {KEYS.map((k) => (
          <button key={k} type="button" className="chip chip-key" onClick={() => move(k)} disabled={busy} aria-label={`Turn ${k} face`}>
            {k}
          </button>
        ))}
        <button type="button" className="chip" onClick={scramble} disabled={busy}>Scramble</button>
        <button type="button" className="chip" onClick={solve} disabled={busy || !history.length}>Solve</button>
      </div>
      <p className="fine-print">Drag to look around. Keys U, D, L, R, F and B turn faces.</p>
    </div>
  );
}
