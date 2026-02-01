import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { motion, AnimatePresence } from "framer-motion";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isCompact: windowSize.width < 1024, 
    isMobile: windowSize.width < 768,
  };
};

/** =========================================================
 * PART 1: THE MIRROR CUBE PHYSICS
 * ========================================================= */

const THICKNESS = {
  x: [0.6, 1.0, 1.4], 
  y: [1.4, 1.0, 0.6], 
  z: [0.6, 1.0, 1.4]  
};

const GAP = 0.15; 
const BEVEL = 0.06;

const SCRAMBLE_MOVES = [
  { axis: 'x', layer: 1, dir: -1 }, { axis: 'y', layer: 1, dir: -1 }, { axis: 'z', layer: 1, dir: -1 },
  { axis: 'x', layer: -1, dir: 1 }, { axis: 'y', layer: -1, dir: 1 }, { axis: 'z', layer: -1, dir: 1 },
  { axis: 'x', layer: 1, dir: 1 }, { axis: 'y', layer: 1, dir: 1 }, { axis: 'z', layer: 1, dir: 1 },
  { axis: 'x', layer: 0, dir: -1 }, { axis: 'y', layer: 0, dir: -1 }, { axis: 'z', layer: 0, dir: -1 },
  { axis: 'x', layer: 1, dir: -1 }, { axis: 'y', layer: 1, dir: -1 }, { axis: 'z', layer: 1, dir: -1 },
];

const getPieceConfig = (ox, oy, oz) => {
  const width = THICKNESS.x[ox + 1];
  const height = THICKNESS.y[oy + 1];
  const depth = THICKNESS.z[oz + 1];
  let x = 0, y = 0, z = 0;
  if (ox === -1) x = -0.5 - width / 2;
  if (ox ===  1) x =  0.5 + width / 2;
  if (oy === -1) y = -0.5 - height / 2;
  if (oy ===  1) y =  0.5 + height / 2;
  if (oz === -1) z = -0.5 - depth / 2;
  if (oz ===  1) z =  0.5 + depth / 2;
  return { size: [width, height, depth], pos: [x, y, z] };
};

const MirrorPiece = ({ id, originalPos, setRef }) => {
  const { size, pos } = useMemo(() => {
    return getPieceConfig(originalPos[0], originalPos[1], originalPos[2]);
  }, []);

  return (
    <group ref={setRef} position={pos}>
      <RoundedBox 
        args={[Math.max(0.1, size[0] - GAP), Math.max(0.1, size[1] - GAP), Math.max(0.1, size[2] - GAP)]} 
        radius={BEVEL} 
        smoothness={5} 
        castShadow 
        receiveShadow
      >
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={1.0} 
          roughness={0.15} 
          envMapIntensity={2.5} 
        />
      </RoundedBox>
    </group>
  );
};

// --- TIMELINE CUBE ANIMATOR ---
const TimelineCubeAnimator = ({ children, scrollContainer }) => {
  const group = useRef();
  const { isCompact } = useWindowSize(); 
  
  useFrame(() => {
    if (!scrollContainer.current || !group.current) return;

    const scrollY = scrollContainer.current.scrollTop;
    const height = window.innerHeight;
    
    // Transition Zone: 0 to 150% of screen height
    const startScroll = height * 0.5; 
    const endScroll = height * 1.5;   
    
    const rawProgress = (scrollY - startScroll) / (endScroll - startScroll);
    const progress = Math.min(1, Math.max(0, rawProgress));
    const smoothProgress = progress * (2 - progress); 

    // TARGETS (RESPONSIVE)
    const startX = isCompact ? 0 : 3.5;  
    const endX = 0;      
    const startZ = isCompact ? -2 : 0; 
    const endZ = -2.0;   
    const startScale = isCompact ? 0.6 : 0.85; 
    const endScale = isCompact ? 0.5 : 0.65;

    const currentX = THREE.MathUtils.lerp(startX, endX, smoothProgress);
    const currentZ = THREE.MathUtils.lerp(startZ, endZ, smoothProgress);
    const currentScale = THREE.MathUtils.lerp(startScale, endScale, smoothProgress);

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, currentX, 0.1);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, currentZ, 0.1);
    
    const startY = isCompact ? -1.5 : 0;
    const endY = 0;
    const currentY = THREE.MathUtils.lerp(startY, endY, smoothProgress);
    
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, currentY, 0.1);
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, currentScale, 0.1));

    if (progress < 1) {
        group.current.rotation.y += 0.01;
        group.current.rotation.x += 0.005;
    } else {
        group.current.rotation.y += 0.005; 
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.05);
    }
  });

  return <group ref={group}>{children}</group>;
};

const CubeManager = () => {
  const groupRef = useRef();
  const pivotRef = useRef();
  const piecesRef = useRef({});
  const wholeGroupRef = useRef();
  const logicalPieces = useRef([]);

  const [initialRenderData] = useState(() => {
    const data = [];
    const logic = [];
    for(let x=-1; x<=1; x++) {
      for(let y=-1; y<=1; y++) {
        for(let z=-1; z<=1; z++) {
          const id = `${x}:${y}:${z}`;
          data.push({ id, originalPos: [x, y, z] });
          logic.push({ id, pos: [x, y, z] });
        }
      }
    }
    logicalPieces.current = logic;
    return data;
  });

  useFrame((state, delta) => {
    TWEEN.update();
    if (wholeGroupRef.current) {
        wholeGroupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  useEffect(() => {
    let isRunning = true;
    const animateTurn = (move, multiplier) => {
      return new Promise((resolve) => {
        const { axis, layer, dir } = move;
        const turnDir = dir * multiplier;
        const axisIdx = ['x', 'y', 'z'].indexOf(axis);
        const activePieces = logicalPieces.current.filter(p => Math.round(p.pos[axisIdx]) === layer);
        const activeIds = activePieces.map(p => p.id);

        const pivot = pivotRef.current;
        const group = groupRef.current;
        pivot.rotation.set(0, 0, 0);
        pivot.position.set(0, 0, 0);
        pivot.updateMatrixWorld();

        activeIds.forEach(id => {
          const mesh = piecesRef.current[id];
          if (mesh) pivot.attach(mesh);
        });

        new TWEEN.Tween({ rot: 0 })
          .to({ rot: (Math.PI / 2) * turnDir }, 400)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(({ rot }) => { pivot.rotation[axis] = rot; })
          .onComplete(() => {
            if (!pivot || !group) return;
            const vecAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
            [...pivot.children].forEach(mesh => {
              group.attach(mesh);
              mesh.position.set(
                Math.round(mesh.position.x * 1000) / 1000,
                Math.round(mesh.position.y * 1000) / 1000,
                Math.round(mesh.position.z * 1000) / 1000
              );
              mesh.rotation.set(
                Math.round(mesh.rotation.x / (Math.PI/2)) * (Math.PI/2),
                Math.round(mesh.rotation.y / (Math.PI/2)) * (Math.PI/2),
                Math.round(mesh.rotation.z / (Math.PI/2)) * (Math.PI/2)
              );
              mesh.updateMatrix();
            });
            activePieces.forEach(p => {
              const vec = new THREE.Vector3(...p.pos);
              vec.applyAxisAngle(vecAxis, (Math.PI / 2) * turnDir);
              p.pos = [Math.round(vec.x), Math.round(vec.y), Math.round(vec.z)];
            });
            pivot.rotation.set(0, 0, 0);
            resolve();
          })
          .start();
      });
    };

    const runSequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      while (isRunning) {
        for (let i = 0; i < SCRAMBLE_MOVES.length; i++) {
          if (!isRunning) return;
          await animateTurn(SCRAMBLE_MOVES[i], 1);
          await new Promise(r => setTimeout(r, 50));
        }
        await new Promise(r => setTimeout(r, 2000));
        for (let i = SCRAMBLE_MOVES.length - 1; i >= 0; i--) {
          if (!isRunning) return;
          await animateTurn(SCRAMBLE_MOVES[i], -1);
          await new Promise(r => setTimeout(r, 50));
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    };
    runSequence();
    return () => { isRunning = false; TWEEN.removeAll(); };
  }, []);

  return (
    <group ref={wholeGroupRef} rotation={[0.5, -0.6, 0]}>
        <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
            {initialRenderData.map((data) => (
            <MirrorPiece 
                key={data.id} 
                id={data.id}
                originalPos={data.originalPos}
                setRef={(el) => { piecesRef.current[data.id] = el; }}
            />
            ))}
            <object3D ref={pivotRef} />
        </group>
    </group>
  );
};

const FloatingParticles = () => {
  const count = 50;
  const mesh = useRef();
  const particles = useMemo(() => new Array(count).fill().map(() => ({
      position: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8],
      scale: Math.random() * 0.4 + 0.1, 
      speed: Math.random() * 0.5 + 0.2
  })), []);

  useFrame((state, delta) => {
    if (mesh.current) {
        mesh.current.rotation.y -= delta * 0.05;
        mesh.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={mesh}>
      {particles.map((data, i) => (
        <Float key={i} speed={data.speed} rotationIntensity={1} floatIntensity={2}>
          <mesh position={data.position} scale={data.scale}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} metalness={1} roughness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

/** =========================================================
 * PART 2: UI COMPONENTS & ANIMATIONS
 * ========================================================= */

// GLOW STYLE
const glowStyle = {
    color: '#FFD700',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)'
};

// ICONS
const IconArrow = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>);
const IconGithub = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>);
const IconLinkedin = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>);

// NEW ICONS FOR MOBILE MENU
const IconMenu = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const IconClose = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

// STAGGERED TEXT COMPONENT
const AnimatedText = ({ text, style, className }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", ...style }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }} 
      className={className}
    >
      {words.map((word, index) => (
        <span key={index} style={{ marginRight: "0.2em", display: "flex" }}>
            {word.split("").map((letter, idx) => (
                <motion.span key={idx} variants={child}>
                    {letter}
                </motion.span>
            ))}
        </span>
      ))}
    </motion.div>
  );
};

// NAVBAR COMPONENT
const Navbar = ({ activeSection, scrollToTop }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCompact, isMobile } = useWindowSize(); 

  const resumeLink = "https://raw.githubusercontent.com/Srinivas-Vengaldas/Portfolio/main/my-portfolio/public/Srinivas_Resume.pdf";
  const resumelink = "https://raw.githubusercontent.com/Srinivas-Vengaldas/Portfolio/my-portfolio/public/Srinivas_Resume.pdf"

  return (
    <>
      <nav style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', 
          padding: isMobile ? '15px 20px' : '25px 40px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100,
          boxSizing: 'border-box', pointerEvents: 'none' 
      }}>
          <div style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={scrollToTop}>
              <div style={{ 
                  fontFamily: '"WindSong", cursive', 
                  fontSize: isMobile ? '1.5rem' : '2rem', 
                  fontWeight: 'bold', 
                  color: 'white', borderRadius: '50%', width: isMobile ? '60px' : '100px', height: '60px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
              }}>SV</div>
          </div>
          
          {/* DESKTOP MENU */}
          {!isCompact && (
            <>
              <div style={{ 
                  display: 'flex', gap: '30px', background: 'rgba(255,255,255,0.08)', 
                  padding: '12px 30px', borderRadius: '50px', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'auto'
              }}>
                  {[
                    { label: 'About', id: 'about' },
                    { label: 'Skills', id: 'skills' },
                    { label: 'Projects', id: 'projects' }
                  ].map((link) => (
                      <a key={link.id} href={`#${link.id}`} style={{ 
                          color: activeSection === link.id ? '#FFD700' : '#888', 
                          textDecoration: 'none', 
                          fontSize: '0.9rem', fontWeight: '500', 
                          transition: 'color 0.3s',
                          borderBottom: activeSection === link.id ? '2px solid #FFD700' : 'none',
                          paddingBottom: '2px'
                      }}>{link.label}</a>
                  ))}

                  <a 
                    href={resumeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#888', 
                      textDecoration: 'none', 
                      fontSize: '0.9rem', fontWeight: '500', 
                      transition: 'color 0.3s',
                      paddingBottom: '2px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FFF'} 
                    onMouseLeave={(e) => e.target.style.color = '#888'}
                  >
                    Resume
                  </a>
              </div>

              <div style={{ pointerEvents: 'auto' }}>
                  <a 
                    href={gmailLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      background: 'white', color: 'black', textDecoration: 'none', 
                      padding: '12px 24px', 
                      borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', 
                      fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                      Get in Touch <IconArrow />
                  </a>
              </div>
            </>
          )}

          {/* MOBILE HAMBURGER BUTTON */}
          {isCompact && (
             <div style={{ pointerEvents: 'auto' }}>
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <IconMenu />
                </button>
             </div>
          )}
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && isCompact && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, width: '100%', height: '100vh',
              background: 'rgba(5, 5, 5, 0.95)', 
              backdropFilter: 'blur(20px)',
              zIndex: 200, 
              display: 'flex', flexDirection: 'column', 
              justifyContent: 'center', alignItems: 'center',
              pointerEvents: 'auto'
            }}
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'absolute', top: '25px', right: '25px',
                background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
                padding: '10px'
              }}
            >
              <IconClose />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
                {[
                  { label: 'About', id: 'about' },
                  { label: 'Skills', id: 'skills' },
                  { label: 'Projects', id: 'projects' }
                ].map((link, i) => (
                  <motion.a 
                    key={link.id} 
                    href={`#${link.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (i * 0.1) }}
                    style={{ 
                      color: 'white', fontSize: '2rem', textDecoration: 'none', fontWeight: '800',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}

                <motion.a 
                    href={resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ 
                      color: 'white', fontSize: '2rem', textDecoration: 'none', fontWeight: '800',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Resume
                </motion.a>

                <motion.a 
                  href={gmailLink} 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ 
                    background: '#FFD700', color: 'black', textDecoration: 'none', 
                    padding: '16px 32px', borderRadius: '50px', fontWeight: 'bold', 
                    fontSize: '1.2rem', marginTop: '20px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                  }}
                >
                    Get in Touch <IconArrow />
                </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HeroSection = () => {
    const { isMobile, isCompact } = useWindowSize();

    return (
    <section style={{ 
        height: '100vh', width: '100%', position: 'relative', display: 'flex', alignItems: 'center',
        paddingLeft: isCompact ? '0%' : '8%', pointerEvents: 'none',
        paddingRight: isCompact ? '5%' : '0'
    }}>
        <div style={{ zIndex: 5, maxWidth: '650px', pointerEvents: 'auto', textAlign: isCompact ? 'center' : 'left', width: isCompact ? '100%' : 'auto' }}>
            <h1 style={{ 
                fontSize: isMobile ? '3rem' : (isCompact ? '4.5rem' : '6rem'), 
                lineHeight: 1.05, color: 'white', fontWeight: '800', 
                marginBottom: '30px', letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif'
            }}>
                Crafting Digital<br/>
                <span style={{ 
                    background: 'linear-gradient(to right, #FFD700 0%, #FFFFFF 50%, #FFD700 100%)', 
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0px 0px 15px rgba(255, 215, 0, 0.6))'
                }}>Masterpieces</span>
            </h1>
            <p style={{ 
                color: '#888', fontSize: isMobile ? '1rem' : '1.1rem', 
                lineHeight: 1.6, marginBottom: '50px', 
                maxWidth: isCompact ? '100%' : '480px', fontWeight: '400',
                margin: isCompact ? '0 auto 40px auto' : '0 0 50px 0'
            }}>
                Transforming innovative ideas into robust, scalable software solutions through clean code and precise technical engineering.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: isCompact ? 'center' : 'flex-start' }}>
                <a href="https://github.com/Srinivas-Vengaldas" target="_blank" rel="noopener noreferrer" style={{ 
                    background: 'white', color: 'black', textDecoration: 'none', 
                    padding: isMobile ? '12px 24px' : '16px 32px', 
                    borderRadius: '50px', fontSize: isMobile ? '0.9rem' : '1rem', 
                    fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <IconGithub /> GitHub <IconArrow />
                </a>
                <a href="https://www.linkedin.com/in/vengaldassrinivas/" target="_blank" rel="noopener noreferrer" style={{ 
                    background: 'transparent', color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', 
                    padding: isMobile ? '12px 24px' : '16px 32px', 
                    borderRadius: '50px', fontSize: isMobile ? '0.9rem' : '1rem', 
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <IconLinkedin /> LinkedIn <IconArrow />
                </a>
            </div>
        </div>
    </section>
)};

const BioSection = () => {
  const { isMobile, isCompact } = useWindowSize();
  return (
    <section id="about" style={{ 
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', zIndex: 5, padding: isCompact ? '80px 5%' : '0 10%', pointerEvents: 'auto'
    }}>
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: isCompact ? 'column' : 'row', justifyContent: 'space-between', alignItems: isCompact ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '40px' }}>
        
        {/* Animated Title */}
        <div style={{ flex: '1 1 100px' }}>
            <div style={{ 
                fontSize: isMobile ? '3rem' : '4rem', 
                fontWeight: '800', color: 'white', lineHeight: 1.1, 
                letterSpacing: '-0.02em', margin: 0 
            }}>
                <AnimatedText text="BEYOND" />
                <AnimatedText text="SYNTAX." style={glowStyle} />
            </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ 
              flex: '1 1 400px', 
              paddingLeft: isCompact ? '20px' : '40px', 
              borderLeft: '1px solid rgba(255,215,0,0.3)',
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', 
              borderRadius: '0 10px 10px 0', padding: '30px',
              width: '100%' // Ensure full width on mobile/tablet
          }}
        >
          <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '20px' }}>
            I don't just write code, I engineer digital ecosystems. With a foundation in <span style={{ color: 'white', fontWeight: 'bold' }}>Computer Science</span> and a specialization in <span style={{ color: 'white', fontWeight: 'bold' }}>Information Systems</span>, I bridge the gap between complex backend logic and immersive frontend experiences.
          </p>
          <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: 1.8 }}>
            My philosophy is simple <strong style={glowStyle}>'Complexity should be invisible'.</strong> Whether it's a scalable cloud architecture or a 3D interactive web experience, the end user should feel nothing but seamless precision.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const TimelineItem = ({ year, title, subtitle, align, link }) => {
    const { isCompact } = useWindowSize();
    
    // FIX: On mobile (isCompact), we set effectiveAlign to 'right' to keep cards on the left side
    const effectiveAlign = isCompact ? 'right' : align; 
    
    return (
    <motion.div 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8 }}
        style={{
            display: 'flex', 
            justifyContent: effectiveAlign === 'left' ? 'flex-end' : 'flex-start',
            alignItems: 'center', marginBottom: '100px', position: 'relative', 
            width: isCompact ? '100%' : '50%', 
            maxWidth: '100%',
            boxSizing: 'border-box', 
            pointerEvents: 'auto',
            paddingLeft: isCompact ? '30px' : 0 
        }}
        className={isCompact ? '' : (effectiveAlign === 'left' ? 'mr-auto pr-10' : 'ml-auto pl-10')}
    >
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '20px',             
            width: isCompact ? '100%' : '350px',
            position: 'relative', transition: 'border 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
            <div style={{ color: '#FFD700', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>{year}</div>
            <h3 style={{ color: 'white', fontSize: isCompact ? '1.2rem' : '1.5rem', marginBottom: '5px' }}>{title}</h3>
            <p style={{ color: '#888', fontSize: '1rem', marginBottom: link ? '15px' : '0' }}>{subtitle}</p>
            
            {link && (
                <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        color: '#FFD700', fontSize: '0.9rem', fontWeight: 'bold', textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                    View Certificate <IconArrow />
                </a>
            )}
        </div>
        
        {/* Dot positioning logic */}
        <div style={{
            position: 'absolute', 
            [effectiveAlign === 'left' && !isCompact ? 'right' : 'left']: isCompact ? '0px' : '-6px', 
            width: '12px', height: '12px',
            background: '#FFD700', borderRadius: '50%', boxShadow: '0 0 10px #FFD700',
            top: isCompact ? '50%' : 'auto', 
            transform: isCompact ? 'translateY(-50%)' : 'none'
        }}></div>
    </motion.div>
)};
const TimelineSection = () => {
    const { isCompact } = useWindowSize();

    return (
    <section style={{ 
        minHeight: '150vh', padding: '100px 0', position: 'relative', zIndex: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none'
    }}>
        <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            style={{ 
                color: 'white', fontSize: '1.2rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                marginBottom: '100px', borderBottom: '2px solid #FFD700', paddingBottom: '10px'
            }}
        >
            The Journey
        </motion.h2>

        <div style={{
            position: 'absolute', top: '200px', bottom: '100px', 
            left: isCompact ? '6px' : '50%', 
            width: '2px', 
            background: 'linear-gradient(to bottom, rgba(255,215,0,0), #FFD700, rgba(255,215,0,0))',
            transform: isCompact ? 'none' : 'translateX(-50%)', 
            zIndex: 0
        }}></div>

        <div style={{ width: '100%', maxWidth: '3000px', position: 'relative', zIndex: 1, padding: isCompact ? '0 20px' : '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ width: isCompact ? '100%' : '50%', display: 'flex', justifyContent: isCompact ? 'flex-start' : 'flex-end', paddingRight: isCompact ? 0 : '40px', position: 'relative' }}>
                        <TimelineItem year="2020 - 2024" title="Mahindra University, India" subtitle="B.Tech in Computer Science and Engineering" align="left" 
                          link="/MU.pdf" />
                    </div>
                </div>
                
                <div style={{ width: '100%', display: 'flex', justifyContent: isCompact ? 'flex-start' : 'flex-end', marginTop: isCompact ? 0 : '-50px' }}>
                  <div style={{ width: isCompact ? '100%' : '50%', paddingLeft: isCompact ? 0 : '40px', position: 'relative' }}>
                      <TimelineItem 
                          year="June - July 2022" 
                          title="National University of Singapore, Singapore" 
                          subtitle="Data Analyst using Deep Learning Intern" 
                          align="right"
                          link="/NUS.pdf" 
                      />
                  </div>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: isCompact ? 0 : '-50px' }}>
                    <div style={{ width: isCompact ? '100%' : '50%', display: 'flex', justifyContent: isCompact ? 'flex-start' : 'flex-end', paddingRight: isCompact ? 0 : '40px', position: 'relative' }}>
                        <TimelineItem year="2025 - Present" title="George Washington University, USA" subtitle="M.S. in Information Systems and Tecnology" align="left" />
                    </div>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: isCompact ? 'flex-start' : 'flex-end', marginTop: isCompact ? 0 : '-50px' }}>
                    <div style={{ width: isCompact ? '100%' : '50%', paddingLeft: isCompact ? '0px' : '20px', position: 'relative' }}>
                        <TimelineItem year="2026+" title="Building the Future" subtitle="Crafting Digital Masterpieces" align="right" />
                    </div>
                </div>
            </div>
        </div>
    </section>
)};

const CustomCursor = ({ visible }) => {
    const cursorRef = useRef(null);
    useEffect(() => {
        const moveCursor = (e) => {
            if (cursorRef.current) cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

    return (
        <div ref={cursorRef} style={{
            position: 'fixed', top: -40, left: -40, width: '60px', height: '50px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.8rem', letterSpacing: '0.1em', pointerEvents: 'none', 
            zIndex: 200, transition: 'opacity 0.2s ease-out', willChange: 'transform',
            opacity: visible ? 1 : 0 
        }}>Drag</div>
    );
};
/** =========================================================
 * PART 3: SKILLS SECTION
 * ========================================================= */

const skillsData = [
  {
    category: "Web & Frontend",
    skills: ["React", "Three.js", "Node.js", "JavaScript", "HTML5", "CSS3", "Bootstrap", "Flask", "Figma"]
  },
  {
    category: "System & Architecture",
    skills: ["System Design", "UML", "OOD", "Microservices", "Database Design", "Normalization", "Security"]
  },
  {
    category: "Languages & Data",
    skills: ["Python", "C & C++", "R", "TensorFlow", "Keras", "Deep Learning", "Big Data", "Analytics", "SQL"]
  },
  {
    category: "Methodologies",
    skills: ["Agile", "Scrum", "SDLC", "Git"]
  }
];

const SkillCategoryCard = ({ category, skills, index }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ 
        borderColor: "rgba(255, 215, 0, 0.5)", 
        backgroundColor: "rgba(255, 215, 0, 0.02)",
        y: -5
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(5px)",
        padding: "30px",
        borderRadius: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Category Title */}
      <h3 style={{ 
        color: "#FFD700", 
        fontSize: "1.5rem", 
        fontWeight: "bold",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <span style={{ fontSize: "0.8rem", opacity: 0.6, marginRight: "5px" }}>0{index + 1}.</span>
        {category}
      </h3>

      {/* Skills Grid/Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {skills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (i * 0.05) }}
            whileHover={{ scale: 1.05, color: "#fff", background: "rgba(255, 215, 0, 0.2)" }}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#ccc",
              fontSize: "0.9rem",
              cursor: "default",
              transition: "all 0.2s ease"
            }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
      
      {/* Decorative Corner */}
      <div style={{
        position: "absolute", top: 0, right: 0, 
        width: "60px", height: "60px", 
        background: "linear-gradient(135deg, transparent 50%, rgba(255, 215, 0, 0.05) 50%)",
        pointerEvents: "none"
      }} />
    </motion.div>
  );
};

const SkillsSection = () => {
  const { isCompact } = useWindowSize();
  return (
    <section id="skills" style={{ 
      minHeight: "80vh", 
      padding: isCompact ? "80px 5%" : "100px 10%", 
      position: "relative", 
      zIndex: 5,
      pointerEvents: "auto", 
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        style={{ marginBottom: "60px", borderLeft: "2px solid #FFD700", paddingLeft: "20px" }}
      >
        <h2 style={{ color: "white", fontSize: "2.5rem", margin: 0, fontWeight: "800" }}>Technical Arsenal</h2>
        <p style={{ color: "#888", fontSize: "1rem", marginTop: "10px", letterSpacing: "0.05em" }}>
          Core Competencies & Technologies
        </p>
      </motion.div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        style={{ 
          display: "grid", 
          // Grid Logic: 1 column on mobile, 2 columns on tablet/desktop
          gridTemplateColumns: isCompact ? "1fr" : "repeat(2, 1fr)", 
          gap: "30px" 
        }}
      >
        {skillsData.map((data, index) => (
          <SkillCategoryCard 
            key={data.category} 
            category={data.category} 
            skills={data.skills} 
            index={index} 
          />
        ))}
      </motion.div>
    </section>
  );
};
/** =========================================================
 * PART 4: PROJECTS SECTION
 * ========================================================= */
const IconGithubSmall = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.8em', height: '0.8em' }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const projectsData = [
  {
    id: 1,
    title: "AUTIX",
    category: "AI & Healthcare",
    image: "/child-playing-with-colorful-blocks.png", 
    description: "Deep learning application designed to assist in the early detection of Autism Spectrum Disorder (ASD) through facial image analysis. Leveraging Transfer Learning (VGG-19 & Xception), the model achieved 86% accuracy. Features a Flask web interface for instant predictions and HIPPA-compliant data handling.",
    repo: "https://github.com/Srinivas-Vengaldas/Autix"
  },
  {
    id: 2,
    title: "GW-Connect",
    category: "Web Development & Agile",
    image: "/GW.png",
    description: "Centralized academic collaboration platform solving fragmented communication at GWU. Led end-to-end development using Agile Scrum over 5 sprints. Delivered features like real-time chat and a study marketplace, achieving a projected 65.73% ROI and a 30% reduction in development cycle times.",
    repo: "https://github.com/Srinivas-Vengaldas/GWU-Student-Connect" 
  },
  {
    id: 3,
    title: "Smart-DMV",
    category: "System Optimization",
    image: "/DMV.png",
    description: "Digital transformation of the DC DMV document verification process. Designed an AI-enhanced portal where staff pre-verify documents before appointments. The system targets a reduction in the 47-minute average wait time and mitigates the $1.3M annual productivity loss for DC businesses.",
    repo: "https://github.com/Srinivas-Vengaldas/Smart-DMV" 
  },
  {
    id: 4,
    title: "ESPN Analysis",
    category: "Data Analytics",
    image: "/ESPN.png",
    description: "Comprehensive data analysis of ESPN's digital performance over a critical 3-month period. Processed 590M+ monthly visits to assess engagement and monetization. Validated the 'mobile-first' shift (62% mobile traffic) and identified YouTube as the primary social driver (>50% referrals).",
    repo: "https://github.com/Srinivas-Vengaldas/ESPN-Analysis" 
  },
  {
    id: 5,
    title: "Mahindra University App",
    category: "Mobile Dev (Flutter)",
    image: "/MU.png",
    description: "Unified mobile platform bridging communication gaps for the Mahindra University ecosystem. Built with Flutter and Firebase, it features real-time attendance tracking, assignment management, and a parent dashboard with Google Maps integration for student safety monitoring.",
    repo: "https://github.com/Srinivas-Vengaldas/Mahindra-University-App" 
  }
];

const ProjectsSection = () => {
  const [activeProject, setActiveProject] = useState(projectsData[0]);
  const { isCompact, isMobile } = useWindowSize();

  return (
    <section id="projects" style={{ 
      minHeight: "70vh", 
      padding: isMobile ? "60px 20px" : (isCompact ? "80px 5%" : "100px 10%"), 
      position: "relative", 
      display: "flex", 
      alignItems: "center",
      zIndex: 5
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "1400px", 
        margin: "0 auto", 
        display: "flex", 
        flexDirection: isCompact ? "column" : "row", 
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: isCompact ? "25px" : "50px",
        flexWrap: "wrap" 
      }}>
        
        {/* LEFT COLUMN: Project List */}
        <div style={{ flex: isCompact ? "1 1 100%" : "1 1 400px", width: "100%" }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                style={{ marginBottom: isMobile ? "30px" : "50px", borderLeft: "2px solid #FFD700", paddingLeft: "20px" }}
            >
                <h2 style={{ 
                    color: "white", 
                    fontSize: isMobile ? "0.9rem" : "1rem", 
                    letterSpacing: "0.2em", 
                    textTransform: "uppercase", 
                    margin: 0 
                }}>
                    Projects
                </h2>
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "15px" : "20px" }}>
                {projectsData.map((project) => (
                    <motion.div
                        key={project.id}
                        onHoverStart={() => !isCompact && setActiveProject(project)}
                        onClick={() => setActiveProject(project)} 
                        style={{ cursor: "pointer", position: "relative" }}
                    >
                        <h3 style={{ 
                            fontSize: isMobile ? "1.5rem" : (isCompact ? "2rem" : "2.5rem"), 
                            fontWeight: "900", 
                            margin: 0, 
                            color: activeProject.id === project.id ? "#FFD700" : "rgba(255,255,255,0.2)", // More visible inactive state
                            WebkitTextStroke: activeProject.id === project.id ? "none" : (isMobile ? "none" : "1px rgba(255,255,255,0.4)"), // Remove stroke on mobile for readability
                            transition: "all 0.3s ease",
                            lineHeight: 1.2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            {project.title}
                            
                            <a 
                                href={project.repo} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="View on GitHub"
                                onClick={(e) => e.stopPropagation()} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: activeProject.id === project.id ? "#FFD700" : "rgba(255,255,255,0.4)",
                                    opacity: activeProject.id === project.id ? 1 : 0.5,
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                <IconGithubSmall />
                            </a>
                        </h3>
                        
                        {activeProject.id === project.id && (
                             <motion.div 
                                layoutId="highlightLine"
                                style={{ 
                                    height: "2px", 
                                    background: "#FFD700", 
                                    width: "100%", 
                                    marginTop: "5px",
                                    boxShadow: "0 0 10px #FFD700"
                                }} 
                             />
                        )}
                        
                        {/* Category Label */}
                        <p style={{ 
                            color: "#888", 
                            margin: "5px 0 0 0", 
                            fontSize: "0.85rem",
                            opacity: activeProject.id === project.id ? 1 : 0,
                            height: activeProject.id === project.id ? "auto" : 0, 
                            overflow: 'hidden',
                            transform: activeProject.id === project.id ? "translateX(0)" : "translateX(-20px)",
                            transition: "all 0.3s ease"
                        }}>
                            {project.category}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: The "Portal" Preview */}
        <div style={{ 
            flex: isCompact ? "1 1 100%" : "1 1 500px", 
            width: "100%",
            minHeight: isCompact ? "auto" : "500px", 
            position: "relative", 
            display: "flex", 
            flexDirection: "column",
        }}>
            <div style={{ 
                width: "100%", 
                position: "relative",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            }}>
                <div style={{ position: "absolute", top: 20, left: 20, width: "10px", height: "10px", borderTop: "2px solid #FFD700", borderLeft: "2px solid #FFD700", zIndex: 10 }} />
                <div style={{ position: "absolute", bottom: 20, right: 20, width: "10px", height: "10px", borderBottom: "2px solid #FFD700", borderRight: "2px solid #FFD700", zIndex: 10 }} />

                <div style={{ position: "absolute", top: "25px", right: "30px", zIndex: 10, textAlign: "right" }}>
                     <span style={{ color: "#FFD700", fontWeight: "bold", fontSize: "1.2rem" }}>0{activeProject.id}</span>
                </div>

                {/* IMAGE CONTAINER */}
                <div style={{ 
                    width: "100%", 
                    height: isMobile ? "220px" : "300px", 
                    position: "relative", 
                    overflow: "hidden" 
                }}>
                    <motion.img 
                        key={activeProject.id}
                        src={activeProject.image}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover"
                        }}
                    />
                </div>
                
                {/* TEXT CONTAINER */}
                <motion.div 
                    key={`desc-${activeProject.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ 
                        padding: isMobile ? "25px 20px" : "30px 40px", 
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        background: "rgba(0,0,0,0.2)"
                    }}
                >
                    <h4 style={{ 
                        color: "white", 
                        margin: "0 0 15px 0", 
                        fontSize: isMobile ? "1.2rem" : "1.5rem" 
                    }}>
                        {activeProject.title}
                    </h4>
                    <p style={{ 
                        color: "#ccc", 
                        margin: 0, 
                        lineHeight: 1.6, 
                        fontSize: isMobile ? "0.9rem" : "0.95rem" 
                    }}>
                        {activeProject.description}
                    </p>
                </motion.div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default function App() {
  const [cursorVisible, setCursorVisible] = useState(false);
  const [enableInteraction, setEnableInteraction] = useState(true);
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const [activeSection, setActiveSection] = useState('about');
  
  const scrollRef = useRef();
  const projectsRef = useRef();
  const { isCompact } = useWindowSize();

  const scrollToTop = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const viewportHeight = window.innerHeight;

      // 1. Interaction Logic
      const isTop = scrollTop < viewportHeight * 0.2;
      setEnableInteraction(isTop);

      // 2. Navbar Highlighting Logic
      const skillsEl = document.getElementById('skills');
      const projectsEl = document.getElementById('projects');
      const aboutEl = document.getElementById('about');

      // I have determined active section based on which one is currently 
      // occupying the middle-to-top part of the screen.
      // getBoundingClientRect().top is the distance from the top of the viewport.
      
      let currentSection = 'about'; // Default

      if (projectsEl) {
        const rect = projectsEl.getBoundingClientRect();
        // If the top of projects is within the viewport (or we scrolled past it)
        if (rect.top < viewportHeight * 0.5) {
            currentSection = 'projects';
        }
      }
      
      // Only check skills if projects isn't already active
      if (currentSection !== 'projects' && skillsEl) {
        const rect = skillsEl.getBoundingClientRect();
        if (rect.top < viewportHeight * 0.5) {
            currentSection = 'skills';
        }
      }

      setActiveSection(currentSection);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
        ref={scrollRef}
        style={{ 
            position: 'relative', width: '100vw', height: '100vh', background: '#050505', 
            fontFamily: "'Inter', sans-serif", overflowX: 'hidden', overflowY: 'auto',
            scrollBehavior: 'smooth' 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=WindSong:wght@500&display=swap');
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #FFD700; }
      `}</style>
      
      <Navbar activeSection={activeSection} scrollToTop={scrollToTop} />
      
      <CustomCursor visible={cursorVisible && enableInteraction} />

      {/* --- LAYER 0: 3D BACKGROUND --- */}
      <div 
        onMouseEnter={() => enableInteraction && setCursorVisible(true)}
        onMouseLeave={() => setCursorVisible(false)}
        style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0,
          pointerEvents: enableInteraction ? 'auto' : 'none',
          opacity: canvasOpacity, 
          transition: 'opacity 0.8s ease-in-out'
      }}>
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas shadows camera={{ position: [0, 0, 12], fov: isCompact ? 50 : 35, far: 100 }}>
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} intensity={80} angle={0.5} penumbra={1} castShadow />
                <pointLight position={[-10, 0, -10]} intensity={20} color="#4444ff" /> 
                <pointLight position={[0, -10, 0]} intensity={10} color="#ffaa00" />

                <FloatingParticles />
                <TimelineCubeAnimator scrollContainer={scrollRef}>
                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                        <CubeManager />
                    </Float>
                </TimelineCubeAnimator>
                
                <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={30} blur={3} far={5} color="black" />
                <Environment preset="city" />
                <OrbitControls enableZoom={false} enablePan={false} enabled={enableInteraction} />
            </Canvas>
        </div>
      </div>

      {/* --- LAYER 1: SCROLLABLE CONTENT --- */}
      <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ pointerEvents: 'none' }}>
              <HeroSection />
          </div>

          <div style={{ pointerEvents: 'auto' }}>
              <BioSection />
              <TimelineSection />
              <SkillsSection />

              <div 
                  ref={projectsRef}
                  style={{
                      position: 'relative',
                      backgroundImage: `
                        radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 60%),
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                      `,
                      backgroundSize: '100% 100%, 50px 50px, 50px 50px',
                      backgroundColor: '#050505'
                  }}
              >
                  <ProjectsSection />
              </div>
          </div>
      </div>
    </div>
  );
}
