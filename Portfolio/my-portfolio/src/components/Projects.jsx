import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { featuredProjects, otherProjects } from "../data/projects";
import { site } from "../data/site";
import { IconArrow, IconGithub } from "./icons";
import SafeBoundary from "./SafeBoundary";

const ProjectCube = lazy(() => import("../three/ProjectCube"));
const DEMOS = {
  autix: lazy(() => import("../three/AutixLayers")),
  dmv: lazy(() => import("../three/DmvFlow")),
};
const VIEWS = featuredProjects.map((p) => p.cubeView);

function ProjectImage({ project }) {
  if (!project.image) {
    return (
      <div className="project-image is-placeholder" aria-hidden="true">
        <span>{project.title}</span>
      </div>
    );
  }
  return (
    <div className={`project-image${project.imageFit === "contain" ? " is-contain" : ""}`}>
      <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" />
    </div>
  );
}

// Interactive scene for projects that have one; falls back to the image if 3D can't run.
function ProjectMedia({ project, reducedMotion }) {
  const Demo = project.demo && DEMOS[project.demo];
  if (!Demo) return <ProjectImage project={project} />;
  const fallback = <ProjectImage project={project} />;
  return (
    <SafeBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Demo reducedMotion={reducedMotion} />
      </Suspense>
    </SafeBoundary>
  );
}

function ProjectLinks({ project }) {
  return (
    <div className="project-links">
      {project.live && (
        <a className="btn btn-solid btn-sm" href={project.live} target="_blank" rel="noopener noreferrer">
          Live demo <IconArrow />
        </a>
      )}
      {project.repo && (
        <a className="btn btn-ghost btn-sm" href={project.repo} target="_blank" rel="noopener noreferrer">
          <IconGithub size={16} /> Code
        </a>
      )}
    </div>
  );
}

function Stack({ items }) {
  return (
    <ul className="stack" aria-label="Tech stack">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

export default function Projects({ reducedMotion }) {
  const [active, setActive] = useState(0);
  const project = featuredProjects[active];

  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="section-head">
        <h2 id="projects-title">Projects</h2>
        <p>Pick a project and the cube turns to it.</p>
      </div>

      <div className="featured">
        <div className="project-list" role="tablist" aria-label="Featured projects">
          {featuredProjects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={i === active}
              aria-controls="project-panel"
              className={`project-tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="project-num">0{i + 1}</span>
              <span className="project-name">{p.title}</span>
              <span className="project-cat">{p.category}</span>
            </button>
          ))}
        </div>

        <div className="project-cube-wrap">
          <SafeBoundary>
            <Suspense fallback={null}>
              <ProjectCube activeIndex={active} views={VIEWS} reducedMotion={reducedMotion} />
            </Suspense>
          </SafeBoundary>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={project.id}
            id="project-panel"
            role="tabpanel"
            aria-labelledby={`tab-${project.id}`}
            className="project-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectMedia project={project} reducedMotion={reducedMotion} />
            <div className="project-body">
              <p className="project-cat">{project.category}</p>
              <h3>{project.title}</h3>
              <p className="project-summary">{project.summary}</p>
              {project.highlights && (
                <ul className="highlights">
                  {project.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              <Stack items={project.stack} />
              <ProjectLinks project={project} />
              {project.liveNote && <p className="fine-print">{project.liveNote}</p>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <h3 className="more-title">More projects</h3>
      <div className="more-grid">
        {otherProjects.map((p, i) => (
          <motion.article
            key={p.id}
            className="mini-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06 }}
          >
            <ProjectImage project={p} />
            <div className="project-body">
              <p className="project-cat">{p.category}</p>
              <h4>{p.title}</h4>
              <p className="project-summary">{p.summary}</p>
              <Stack items={p.stack} />
              <ProjectLinks project={p} />
            </div>
          </motion.article>
        ))}
      </div>

      <p className="all-repos">
        <a className="text-link" href={`${site.github}?tab=repositories`} target="_blank" rel="noopener noreferrer">
          All repositories on GitHub <IconArrow />
        </a>
      </p>
    </section>
  );
}
