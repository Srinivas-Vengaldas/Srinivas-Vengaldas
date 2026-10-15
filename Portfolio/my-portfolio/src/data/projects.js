// Every public repository on github.com/Srinivas-Vengaldas, strongest first.
// `featured` projects appear in the cube navigator; the rest appear in the grid below it.
// `demo` swaps the image for an interactive 3D scene (see three/AutixLayers and three/DmvFlow).
// `cubeView` is the cube's orientation (Euler angles, radians) when that project is selected.
// `stack` names that match a node in data/skills.js are linked in the skill constellation.

const GH = "https://github.com/Srinivas-Vengaldas";

export const projects = [
  {
    id: "dc-transit-pulse",
    title: "DC Transit Pulse",
    category: "Data Engineering",
    image: "/projects/dc-transit-pulse.webp",
    imageAlt: "DC Transit Pulse site showing the headline on-time rate and KPI tiles",
    summary:
      "A scheduled Databricks lakehouse pipeline that polls WMATA's live bus feeds, cleans them through bronze, silver and gold Delta tables, grades each departure against that day's timetable, and publishes route-level reliability and bunching to a public site.",
    highlights: [
      "3.77M events ingested and 45,592 departures graded; 75.4% left on time",
      "Computed delays match WMATA's own figures (r = 0.977, median difference 31 s)",
      "1,044 of 1,044 data-quality checks passed, at a running cost of $0",
    ],
    stack: ["Python", "PySpark", "Databricks", "Delta Lake", "SQL", "React", "Streamlit", "GitHub Actions"],
    live: "https://dc-transit-pulse-eta.vercel.app",
    repo: `${GH}/dc-transit-pulse`,
    featured: true,
    cubeView: [0.45, -0.6, 0],
  },
  {
    id: "fraudgraph",
    title: "FraudGraph",
    category: "ML Systems · Backend",
    image: "/projects/fraudgraph.webp",
    imageAlt: "FraudGraph analyst review queue with a selected case and its reasons",
    imageFit: "contain",
    summary:
      "A real-time payment fraud engine built on 590,540 anonymized e-commerce transactions (IEEE-CIS). Every transaction gets approve, review or decline with readable reasons, from four checks run cheapest first: a Bloom-filter blocklist, sliding-window velocity rules, union-find identity rings and a LightGBM model served through ONNX in Node.",
    highlights: [
      "At the same analyst workload, the model catches 51.0% of fraud vs 21.4% for rules alone, doubling net savings",
      "PR-AUC 0.591 and 53.0% of fraud caught at a 1% false-positive rate on a time-based holdout",
      "1.78 ms p95 scoring and 952 requests/s on a laptop; ONNX in Node matches Python within 1e-5",
    ],
    stack: ["TypeScript", "Node.js", "Fastify", "Redis", "PostgreSQL", "Python", "LightGBM", "ONNX Runtime", "React", "Docker", "GitHub Actions"],
    repo: `${GH}/Fraud-Graph`,
    liveNote: "Runs locally with one command; the repo has a demo video.",
    featured: true,
    cubeView: [0.2, 3.6, 0.5],
  },
  {
    id: "safegate",
    title: "SafeGate",
    category: "AI Safety · Backend",
    image: "/projects/safegate-architecture.svg",
    imageAlt: "SafeGate architecture: input rails, LLM call, output rails and the stores behind them",
    imageFit: "contain",
    summary:
      "An OpenAI-compatible gateway that sits between any app and any LLM. It screens traffic in layers, cheap rules first and classifiers last, redacts PII, logs every decision for audit, and ships with an evaluation harness.",
    highlights: [
      "Red-team attack success cut from 31.9% to 5.0% (garak)",
      "93.5% F1 on prompt injection vs 82.3% for ProtectAI's public DeBERTa model",
      "Catches 96.5% of attacks hidden in retrieved documents, up from 43.5%",
      "45 ms p50 added latency for the full rail stack, about 1 ms when cached",
    ],
    stack: ["Python", "FastAPI", "ONNX Runtime", "Presidio", "Redis", "PostgreSQL", "Prometheus", "Docker"],
    live: "https://safegate-latest.onrender.com",
    liveNote: "Free tier: the first load can take about a minute.",
    repo: `${GH}/SafeGate`,
    featured: true,
    cubeView: [-0.4, 0.75, 0.1],
  },
  {
    id: "smart-dmv",
    title: "Smart-DMV",
    category: "Full Stack · Document AI",
    image: "/projects/smart-dmv.webp",
    imageAlt: "Smart-DMV portal",
    summary:
      "Moves DC DMV proof-of-residency checks from the service counter to a pre-visit online check. Residents upload a lease, OCR reads it, and a scoring engine approves it, flags it for review, or sends it back before the appointment.",
    highlights: [
      "Quality gate rejects blurry or low-resolution scans before OCR runs",
      "Field-match scoring (name 40%, address 40%, ZIP 20%) blended with OCR confidence",
      "GWU capstone: project manager of a six-person team; I owned the OCR and verification backend",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma", "Supabase", "FastAPI", "Python"],
    live: "https://v0-smart-dmv.vercel.app",
    repo: `${GH}/Smart-DMV`,
    featured: true,
    demo: "dmv",
    cubeView: [0.9, 2.4, -0.2],
  },
  {
    id: "autix",
    title: "Autix",
    category: "Machine Learning",
    image: "/projects/autix-roc.webp",
    imageAlt: "ROC curves for VGG19 and Xception on the held-out test set",
    imageFit: "contain",
    summary:
      "Compares two transfer-learning CNNs, VGG19 and Xception, on a face photo and draws class activation maps that show what each model looked at. Both models run in the browser with TensorFlow.js, so photos never leave the device. An educational project, not a diagnostic tool.",
    highlights: [
      "VGG19: 87.0% accuracy and AUC 0.936 on a 300-image held-out test set",
      "Clean, seeded retrain that replaced the buggy 2022 evaluation",
      "Documents dataset bias and the model's limits up front",
    ],
    stack: ["Python", "TensorFlow", "Keras", "TensorFlow.js", "React", "MediaPipe"],
    live: "https://srinivas-vengaldas.github.io/Autix/",
    repo: `${GH}/Autix`,
    featured: true,
    demo: "autix",
    cubeView: [-0.8, -2.2, 0.3],
  },
  {
    id: "nextplay",
    title: "NextPlay Boards",
    category: "Full Stack · Mobile",
    summary:
      "A Kanban task board inspired by Asana and Linear, with a React web app, an Expo React Native mobile app and a shared TypeScript API on Vercel Functions, backed by Supabase Postgres with row-level security.",
    highlights: [
      "One pnpm monorepo for the web app, the mobile app and the API",
      "Prisma schema on Supabase Postgres, with Supabase Auth and row-level security",
    ],
    stack: ["TypeScript", "React", "React Native", "Prisma", "Supabase", "PostgreSQL"],
    repo: `${GH}/NextPlayBoards`,
  },
  {
    id: "gw-connect",
    title: "GW Student Connect",
    category: "Web App · Agile",
    image: "/projects/gw-connect.webp",
    imageAlt: "GW Student Connect home page",
    summary:
      "A platform for GWU students to find study partners, share resources, chat in real time and follow campus events. I led the team through five Agile sprints.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    repo: `${GH}/GWU-Student-Connect`,
  },
  {
    id: "mu-app",
    title: "Mahindra University App",
    category: "Mobile",
    image: "/projects/mu-app.webp",
    imageAlt: "Mahindra University app screens",
    summary:
      "A Flutter app for students, teachers and parents: attendance, assignments and grades, plus a parent dashboard with live location on Google Maps.",
    stack: ["Flutter", "Dart", "Firebase", "Google Maps"],
    repo: `${GH}/Mahindra-University-App`,
  },
  {
    id: "dc-book-store",
    title: "DC Book Store",
    category: "Front End",
    summary: "A multi-page bookstore storefront with a catalog, cart, author pages and an events page.",
    stack: ["JavaScript", "HTML/CSS", "Bootstrap"],
    repo: `${GH}/DC-Book-Store`,
  },
  {
    id: "espn",
    title: "ESPN Digital Analysis",
    category: "Data Analysis",
    image: "/projects/espn.webp",
    imageAlt: "ESPN logo",
    summary:
      "An audit of ESPN's digital funnel over three months: 590M+ monthly visits, a 62% mobile share, and YouTube as the top social referrer.",
    stack: ["R", "SQL"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
