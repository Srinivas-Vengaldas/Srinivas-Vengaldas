import { motion } from "framer-motion";
import { site } from "../data/site";
import { IconArrow, IconFile, IconGithub, IconLinkedin } from "./icons";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="eyebrow">
          {site.role} · {site.location}
        </p>
        <h1 className="hero-title">
          Srinivas <span className="gold-gradient">Vengaldas</span>
        </h1>
        <p className="hero-lede">
          I build data pipelines, AI guardrails and full-stack apps, and I measure whether they work.
          Finishing my {site.degree} at {site.school} in {site.graduation}. Open to software and data
          engineering roles.
        </p>
        <div className="hero-actions">
          <a className="btn btn-solid" href={site.github} target="_blank" rel="noopener noreferrer">
            <IconGithub /> GitHub <IconArrow />
          </a>
          <a className="btn btn-ghost" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            <IconLinkedin /> LinkedIn <IconArrow />
          </a>
          <a className="btn btn-ghost" href={site.resume} target="_blank" rel="noopener noreferrer">
            <IconFile /> Resume <IconArrow />
          </a>
        </div>
      </motion.div>
    </header>
  );
}
