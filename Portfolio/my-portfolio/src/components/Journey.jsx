import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { journey } from "../data/journey";
import { IconArrow } from "./icons";
import SafeBoundary from "./SafeBoundary";

const JourneyGlobe = lazy(() => import("../three/JourneyGlobe"));

export default function Journey({ reducedMotion }) {
  const [active, setActive] = useState(0);
  const cards = useRef([]);

  // The card crossing the middle of the screen decides where the globe points.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.index)));
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    cards.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <h2 id="journey-title" className="section-kicker">The Journey</h2>
      <div className="journey-layout">
        <ol className="timeline">
          {journey.map((stop, i) => (
            <motion.li
              key={stop.id}
              ref={(el) => (cards.current[i] = el)}
              data-index={i}
              className={`timeline-card${i === active ? " is-active" : ""}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <button type="button" className="timeline-hit" onClick={() => setActive(i)} aria-label={`Show ${stop.place} on the globe`} />
              <span className="timeline-dot" aria-hidden="true" />
              <p className="timeline-years">{stop.years}</p>
              <h3>{stop.title}</h3>
              <p className="timeline-place">{stop.place}</p>
              <p className="timeline-detail">{stop.detail}</p>
              {stop.link && (
                <a className="text-link" href={stop.link} target="_blank" rel="noopener noreferrer">
                  {stop.linkLabel} <IconArrow />
                </a>
              )}
            </motion.li>
          ))}
        </ol>
        <div className="journey-globe-wrap">
          <SafeBoundary>
            <Suspense fallback={null}>
              <JourneyGlobe stops={journey} activeIndex={active} reducedMotion={reducedMotion} />
            </Suspense>
          </SafeBoundary>
        </div>
      </div>
    </section>
  );
}
