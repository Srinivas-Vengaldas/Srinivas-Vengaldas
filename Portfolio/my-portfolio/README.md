# vengaldas.vercel.app

Personal portfolio of Srinivas Vengaldas: React, Three.js (React Three Fiber) and Framer Motion, built with Vite.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Where things live

| Path | What it holds |
|---|---|
| `src/data/site.js` | Name, email, LinkedIn, resume link, nav sections |
| `src/data/projects.js` | Every project card: summary, results, stack, live and code links |
| `src/data/skills.js` | Skill groups; links between skills and projects are derived from project stacks |
| `src/data/journey.js` | Timeline stops and their map coordinates |
| `src/components/` | Page sections (Hero, About, Journey, Skills, Projects, Contact) |
| `src/three/` | 3D scenes: hero cube, project cube navigator, skill constellation, journey globe |
| `public/projects/` | Project images (WebP/SVG) |

To add a project, add an entry to `src/data/projects.js` and drop its image in `public/projects/`.

## 3D notes

- Three.js loads in a separate chunk after the page text renders.
- Each scene renders only while it is on screen, and pauses its animation for visitors who prefer reduced motion.
- Reflections come from light panels in the scene, so nothing is fetched from a CDN at runtime.
- If WebGL is unavailable, the scenes are skipped and the rest of the page still works.
