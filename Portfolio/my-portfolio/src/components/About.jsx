import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";

export default function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <h2 id="about-title" className="about-title">
        <AnimatedText text="BEYOND" />
        <AnimatedText text="SYNTAX." className="glow" />
      </h2>
      <motion.div
        className="about-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <p>
          I'm a software and data engineer with a foundation in <strong>Computer Science</strong> and a
          master's in <strong>Information Systems</strong>. I like problems where the software has to prove
          it works: a bus-reliability pipeline checked against WMATA's own numbers, an LLM gateway measured
          with red-team attacks, a DMV workflow designed around real wait times.
        </p>
        <p>
          My philosophy is simple: <strong className="glow">complexity should be invisible.</strong> Whether
          it's a data platform or a 3D web experience, the person using it should only feel that it works.
        </p>
      </motion.div>
    </section>
  );
}
