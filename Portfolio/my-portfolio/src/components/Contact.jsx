import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { site } from "../data/site";
import { IconArrow, IconFile, IconGithub, IconLinkedin, IconMail } from "./icons";
import SafeBoundary from "./SafeBoundary";

const CubePlayground = lazy(() => import("../three/CubePlayground"));

export default function Contact({ reducedMotion }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="contact-layout">
        <motion.div
          className="contact-inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
        >
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">
            Let's build something <span className="glow">that works.</span>
          </h2>
          <p className="contact-lede">
            I'm looking for software and data engineering roles. The fastest way to reach me is email.
          </p>
          <div className="contact-email">
            <a className="btn btn-gold" href={`mailto:${site.email}`}>
              <IconMail /> {site.email}
            </a>
            <button type="button" className="btn btn-ghost" onClick={copy}>
              {copied ? "Copied" : "Copy email"}
            </button>
          </div>
          <div className="contact-links">
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              <IconLinkedin /> LinkedIn <IconArrow />
            </a>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              <IconGithub /> GitHub <IconArrow />
            </a>
            <a href={site.resume} target="_blank" rel="noopener noreferrer">
              <IconFile /> Resume (PDF) <IconArrow />
            </a>
          </div>
        </motion.div>

        <SafeBoundary>
          <Suspense fallback={null}>
            <CubePlayground reducedMotion={reducedMotion} />
          </Suspense>
        </SafeBoundary>
      </div>

      <footer className="footer">
        <span>© {new Date().getFullYear()} {site.name} · {site.location}</span>
        <span>Built with React, Three.js and Framer Motion</span>
      </footer>
    </section>
  );
}
