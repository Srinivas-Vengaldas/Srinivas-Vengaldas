import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks as NAV_LINKS, site } from "../data/site";
import { IconArrow, IconClose, IconMenu } from "./icons";

export default function Navbar({ activeSection }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="nav" aria-label="Main">
        <a className="nav-logo" href="#top" aria-label="Back to top">SV</a>

        <div className="nav-pill">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={activeSection === link.id ? "is-active" : undefined}
              aria-current={activeSection === link.id ? "true" : undefined}
            >
              {link.label}
            </a>
          ))}
          <a href={site.resume} target="_blank" rel="noopener noreferrer">Resume</a>
        </div>

        <a className="nav-cta" href="#contact">
          Get in touch <IconArrow />
        </a>

        <button
          type="button"
          className="nav-burger"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <IconMenu />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <button type="button" className="mobile-close" aria-label="Close menu" onClick={() => setOpen(false)} autoFocus>
              <IconClose />
            </button>
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                {link.label}
              </motion.a>
            ))}
            <a href={site.resume} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              Resume
            </a>
            <a className="mobile-cta" href="#contact" onClick={() => setOpen(false)}>
              Get in touch <IconArrow />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
