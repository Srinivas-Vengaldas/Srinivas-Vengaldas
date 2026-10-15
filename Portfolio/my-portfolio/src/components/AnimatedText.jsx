import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
};

// Letter-by-letter reveal. Screen readers read the hidden plain copy instead of single letters.
export default function AnimatedText({ text, className }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        className={`animated-text ${className ?? ""}`}
        aria-hidden="true"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {text.split(" ").map((word, w) => (
          <span key={w} className="animated-word">
            {word.split("").map((char, c) => (
              <motion.span key={c} variants={letter}>
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </>
  );
}
