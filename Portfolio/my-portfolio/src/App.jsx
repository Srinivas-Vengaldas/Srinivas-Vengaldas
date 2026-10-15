import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Journey from "./components/Journey";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import SafeBoundary from "./components/SafeBoundary";
import { useCompact, useReducedMotion } from "./hooks/media";
import { navLinks } from "./data/site";

// Three.js loads in its own chunk, after the text is on screen.
const HeroScene = lazy(() => import("./three/HeroScene"));
const SECTION_IDS = [...navLinks.map((l) => l.id), "contact"];

export default function App() {
  const reducedMotion = useReducedMotion();
  const compact = useCompact();
  const [heroInView, setHeroInView] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        setHeroInView(window.scrollY < vh * 0.9);
        let current = null;
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < vh * 0.5) current = id;
        }
        setActiveSection(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar activeSection={activeSection} />

      <div className={`hero-backdrop${heroInView ? "" : " is-hidden"}`} aria-hidden="true">
        <SafeBoundary>
          <Suspense fallback={null}>
            <HeroScene active={heroInView} compact={compact} reducedMotion={reducedMotion} />
          </Suspense>
        </SafeBoundary>
      </div>

      <Hero />
      <main id="main">
        <About />
        <Journey reducedMotion={reducedMotion} />
        <Skills reducedMotion={reducedMotion} />
        <Projects reducedMotion={reducedMotion} />
        <Contact reducedMotion={reducedMotion} />
      </main>
    </MotionConfig>
  );
}
