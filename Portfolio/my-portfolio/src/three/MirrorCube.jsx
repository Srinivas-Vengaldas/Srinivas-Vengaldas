import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// A 3x3x3 mirror cube: every piece has a different size, so a scrambled cube changes shape.
const THICKNESS = { x: [0.6, 1.0, 1.4], y: [1.4, 1.0, 0.6], z: [0.6, 1.0, 1.4] };
const GAP = 0.15;
const BEVEL = 0.06;
const AXIS_INDEX = { x: 0, y: 1, z: 2 };
const AXIS_VECTOR = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };

const SCRAMBLE_MOVES = [
  ["x", 1, -1], ["y", 1, -1], ["z", 1, -1], ["x", -1, 1], ["y", -1, 1], ["z", -1, 1],
  ["x", 1, 1], ["y", 1, 1], ["z", 1, 1], ["x", 0, -1], ["y", 0, -1], ["z", 0, -1],
];

const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pieceConfig(ox, oy, oz) {
  const width = THICKNESS.x[ox + 1];
  const height = THICKNESS.y[oy + 1];
  const depth = THICKNESS.z[oz + 1];
  const offset = (o, size) => (o === 0 ? 0 : o * (0.5 + size / 2));
  return {
    size: [width, height, depth].map((s) => Math.max(0.1, s - GAP)),
    position: [offset(ox, width), offset(oy, height), offset(oz, depth)],
  };
}

const PIECES = [];
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++) PIECES.push({ id: `${x}:${y}:${z}`, grid: [x, y, z], ...pieceConfig(x, y, z) });

// Exposes turn(axis, layer, dir, seconds) through a ref. Turns queue up and resolve when done.
const MirrorCube = forwardRef(function MirrorCube({ autoScramble = false, reducedMotion = false }, ref) {
  const groupRef = useRef();
  const pivotRef = useRef();
  const meshes = useRef({});
  const logical = useRef(PIECES.map((p) => ({ id: p.id, pos: [...p.grid] })));
  const queue = useRef([]);
  const active = useRef(null);

  const api = useMemo(
    () => ({
      turn: (axis, layer, dir, seconds = 0.4) =>
        new Promise((resolve) => queue.current.push({ axis, layer, dir, seconds, resolve })),
      isBusy: () => Boolean(active.current) || queue.current.length > 0,
    }),
    []
  );
  useImperativeHandle(ref, () => api, [api]);

  const start = (move) => {
    const pivot = pivotRef.current;
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();
    const axisIndex = AXIS_INDEX[move.axis];
    const pieces = logical.current.filter((p) => p.pos[axisIndex] === move.layer);
    pieces.forEach((p) => pivot.attach(meshes.current[p.id]));
    active.current = { ...move, pieces, elapsed: 0 };
  };

  const finish = (move) => {
    const pivot = pivotRef.current;
    pivot.updateMatrixWorld();
    [...pivot.children].forEach((mesh) => groupRef.current.attach(mesh));
    pivot.rotation.set(0, 0, 0);
    move.pieces.forEach((p) => {
      const v = new THREE.Vector3(...p.pos).applyAxisAngle(AXIS_VECTOR[move.axis], (Math.PI / 2) * move.dir);
      p.pos = [Math.round(v.x), Math.round(v.y), Math.round(v.z)];
    });
    active.current = null;
    move.resolve();
  };

  useFrame((_, delta) => {
    if (!active.current && queue.current.length) start(queue.current.shift());
    const move = active.current;
    if (!move) return;
    move.elapsed += delta;
    const k = reducedMotion ? 1 : Math.min(1, move.elapsed / move.seconds);
    pivotRef.current.rotation[move.axis] = move.dir * (Math.PI / 2) * easeInOut(k);
    if (k >= 1) finish(move);
  });

  useEffect(() => {
    if (!autoScramble || reducedMotion) return;
    let running = true;
    (async () => {
      await wait(1000);
      while (running) {
        for (const m of SCRAMBLE_MOVES) {
          if (!running) return;
          await api.turn(m[0], m[1], m[2]);
          await wait(50);
        }
        await wait(2000);
        for (const m of [...SCRAMBLE_MOVES].reverse()) {
          if (!running) return;
          await api.turn(m[0], m[1], -m[2]);
          await wait(50);
        }
        await wait(2000);
      }
    })();
    return () => {
      running = false;
    };
  }, [autoScramble, reducedMotion, api]);

  return (
    <group ref={groupRef}>
      {PIECES.map((p) => (
        <group key={p.id} position={p.position} ref={(el) => (meshes.current[p.id] = el)}>
          <RoundedBox args={p.size} radius={BEVEL} smoothness={4}>
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.15} envMapIntensity={2.5} />
          </RoundedBox>
        </group>
      ))}
      <object3D ref={pivotRef} />
    </group>
  );
});

export default MirrorCube;
