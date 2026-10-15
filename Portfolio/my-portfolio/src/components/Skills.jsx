import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { alsoFamiliar, edges, linkedProjects, skillGroups, skills } from "../data/skills";
import SafeBoundary from "./SafeBoundary";

const SkillConstellation = lazy(() => import("../three/SkillConstellation"));

export default function Skills({ reducedMotion }) {
  const [selected, setSelected] = useState(null);

  const toggle = (type, id) =>
    setSelected((s) => (s?.type === type && s?.id === id ? null : { type, id }));

  const litSkills = new Set(
    selected ? edges.filter((e) => (selected.type === "project" ? e.project === selected.id : e.skill === selected.id)).map((e) => e.skill) : []
  );
  const litProjects = new Set(
    selected ? edges.filter((e) => (selected.type === "skill" ? e.skill === selected.id : e.project === selected.id)).map((e) => e.project) : []
  );

  const caption = !selected
    ? "Pick a project to see its stack, or a skill to see where I used it."
    : selected.type === "project"
      ? `${linkedProjects.find((p) => p.id === selected.id)?.title} uses ${litSkills.size} of these skills.`
      : `${selected.id} shows up in ${litProjects.size} project${litProjects.size === 1 ? "" : "s"}.`;

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <motion.div
        className="section-head"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <h2 id="skills-title">Technical Arsenal</h2>
        <p>Every skill here is linked to a project that uses it.</p>
      </motion.div>

      <div className="skills-layout">
        <div className="skills-graph">
          <SafeBoundary>
            <Suspense fallback={null}>
              <SkillConstellation
                projects={linkedProjects}
                skills={skills}
                edges={edges}
                selected={selected}
                onSelect={setSelected}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </SafeBoundary>
          <p className="skills-caption" aria-live="polite">{caption}</p>
        </div>

        <div className="skills-panel">
          <div className="skill-group">
            <h3>Projects</h3>
            <div className="chip-row">
              {linkedProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`chip${litProjects.has(p.id) ? " is-on" : ""}`}
                  aria-pressed={selected?.type === "project" && selected.id === p.id}
                  onClick={() => toggle("project", p.id)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.name}>
              <h3>{group.name}</h3>
              <div className="chip-row">
                {group.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip${litSkills.has(s) ? " is-on" : ""}`}
                    aria-pressed={selected?.type === "skill" && selected.id === s}
                    onClick={() => toggle("skill", s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="also">
            <span>Also worked with:</span> {alsoFamiliar.join(", ")}
          </p>
        </div>
      </div>
    </section>
  );
}
