import { projects } from "./projects";

// Skills shown in the constellation. Each one is linked to every project whose stack names it.
export const skillGroups = [
  { name: "Languages", skills: ["Python", "TypeScript", "JavaScript", "SQL", "R", "Dart"] },
  { name: "Data & ML", skills: ["PySpark", "Databricks", "Delta Lake", "TensorFlow", "Keras", "LightGBM", "ONNX Runtime"] },
  { name: "Web & Mobile", skills: ["React", "Next.js", "FastAPI", "React Native", "Flutter", "Tailwind CSS"] },
  { name: "Data stores & Ops", skills: ["PostgreSQL", "Prisma", "Supabase", "Redis", "Firebase", "Docker", "GitHub Actions"] },
];

// Skills from the resume that no public repo shows yet. Listed as text, not in the graph.
export const alsoFamiliar = ["Java", "Spring", "Angular", "C/C++", "AWS", "Jenkins", "MySQL", "MongoDB", "Figma"];

export const skills = skillGroups.flatMap((g) => g.skills);

export const edges = projects.flatMap((p) =>
  p.stack.filter((s) => skills.includes(s)).map((s) => ({ project: p.id, skill: s }))
);

export const linkedProjects = projects.filter((p) => edges.some((e) => e.project === p.id));
