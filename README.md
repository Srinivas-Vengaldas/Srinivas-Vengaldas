<!-- Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,55:3a2f00,100:FFD700&height=200&section=header&text=Srinivas%20Vengaldas&fontSize=52&fontColor=FFD700&fontAlignY=36&desc=Software%20Engineer%20%C2%B7%20Data%20%26%20ML%20Systems&descSize=18&descAlignY=56&descColor=e5e5e5&animation=fadeIn" alt="Srinivas Vengaldas" width="100%" />
</p>

<p align="center">
  <a href="https://vengaldas.vercel.app">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=20&duration=2800&pause=900&color=FFD700&center=true&vCenter=true&width=620&lines=I+build+systems+that+prove+they+work.;Real-time+fraud+scoring+in+1.78+ms+p95.;An+LLM+gateway+that+cut+attacks+from+31.9%25+to+5%25.;A+lakehouse+grading+45%2C592+DC+bus+departures." alt="I build systems that prove they work" />
  </a>
</p>

<p align="center">
  <a href="https://vengaldas.vercel.app"><img src="https://img.shields.io/badge/Portfolio-vengaldas.vercel.app-FFD700?style=for-the-badge&logo=vercel&logoColor=black&labelColor=050505" alt="Portfolio" /></a>
  <a href="https://www.linkedin.com/in/vengaldassrinivas/"><img src="https://img.shields.io/badge/LinkedIn-Connect-FFD700?style=for-the-badge&logo=linkedin&logoColor=FFD700&labelColor=050505" alt="LinkedIn" /></a>
  <a href="mailto:vengaldas02@gmail.com"><img src="https://img.shields.io/badge/Email-vengaldas02%40gmail.com-FFD700?style=for-the-badge&logo=gmail&logoColor=FFD700&labelColor=050505" alt="Email" /></a>
  <a href="https://vengaldas.vercel.app/Srinivas_Resume.pdf"><img src="https://img.shields.io/badge/Resume-PDF-FFD700?style=for-the-badge&logo=readthedocs&logoColor=FFD700&labelColor=050505" alt="Resume" /></a>
</p>

---

### `$ whoami`

```yaml
name:       Srinivas Vengaldas
role:       Software Engineer (backend, data and ML systems)
education:  M.S. Information Systems & Technology, George Washington University (Dec 2026)
            B.Tech Computer Science & Engineering, Mahindra University (2024)
based_in:   Washington, DC
looking_for: Software and data engineering roles
approach:   Measure it. Every project below ships with its numbers and how they were checked.
```

---

### ⚡ Featured work

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>🛡️ <a href="https://github.com/Srinivas-Vengaldas/Fraud-Graph">FraudGraph</a></h4>
      <sub>Real-time payment fraud engine</sub>
      <p>Approves, reviews or declines each transaction with readable reasons. Hand-written Bloom filter, sliding-window velocity, union-find identity rings and a LightGBM model served through ONNX in Node, replayed over 590,540 real transactions.</p>
      <p>
        <code>51.0% vs 21.4%</code> fraud caught, model vs rules<br/>
        <code>1.78 ms</code> p95 scoring · <code>952 req/s</code> on a laptop
      </p>
      <img src="https://img.shields.io/badge/-TypeScript-050505?style=flat-square&logo=typescript" /> <img src="https://img.shields.io/badge/-Fastify-050505?style=flat-square&logo=fastify" /> <img src="https://img.shields.io/badge/-Redis-050505?style=flat-square&logo=redis" /> <img src="https://img.shields.io/badge/-PostgreSQL-050505?style=flat-square&logo=postgresql" /> <img src="https://img.shields.io/badge/-LightGBM-050505?style=flat-square" /> <img src="https://img.shields.io/badge/-ONNX-050505?style=flat-square&logo=onnx" />
    </td>
    <td width="50%" valign="top">
      <h4>🧱 <a href="https://github.com/Srinivas-Vengaldas/SafeGate">SafeGate</a></h4>
      <sub>LLM guardrails gateway · <a href="https://safegate-latest.onrender.com">live demo</a></sub>
      <p>An OpenAI-compatible proxy that screens prompts, replies, files and retrieved documents in layered rails, cheap rules first. Its own int8 DeBERTa injection classifier runs on CPU, plus PII redaction and a full audit log.</p>
      <p>
        <code>31.9% → 5.0%</code> red-team attack success<br/>
        <code>43.5% → 96.5%</code> hidden-document attacks caught
      </p>
      <img src="https://img.shields.io/badge/-Python-050505?style=flat-square&logo=python" /> <img src="https://img.shields.io/badge/-FastAPI-050505?style=flat-square&logo=fastapi" /> <img src="https://img.shields.io/badge/-ONNX_Runtime-050505?style=flat-square&logo=onnx" /> <img src="https://img.shields.io/badge/-Redis-050505?style=flat-square&logo=redis" /> <img src="https://img.shields.io/badge/-Grafana-050505?style=flat-square&logo=grafana" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>🚌 <a href="https://github.com/Srinivas-Vengaldas/dc-transit-pulse">DC Transit Pulse</a></h4>
      <sub>Bus reliability lakehouse · <a href="https://dc-transit-pulse-eta.vercel.app">live site</a></sub>
      <p>A scheduled Databricks pipeline that turns WMATA's live bus feeds into on-time and bunching analytics through bronze, silver and gold Delta tables. Every layer is idempotent, so reruns add zero rows.</p>
      <p>
        <code>45,592</code> departures graded · <code>75.4%</code> on time<br/>
        <code>r = 0.977</code> against WMATA's own delays · <code>$0</code> to run
      </p>
      <img src="https://img.shields.io/badge/-PySpark-050505?style=flat-square&logo=apachespark" /> <img src="https://img.shields.io/badge/-Databricks-050505?style=flat-square&logo=databricks" /> <img src="https://img.shields.io/badge/-Delta_Lake-050505?style=flat-square" /> <img src="https://img.shields.io/badge/-SQL-050505?style=flat-square&logo=postgresql" /> <img src="https://img.shields.io/badge/-React-050505?style=flat-square&logo=react" />
    </td>
    <td width="50%" valign="top">
      <h4>🪪 <a href="https://github.com/Srinivas-Vengaldas/Smart-DMV">Smart DMV</a></h4>
      <sub>AI document verification portal · graduate capstone · <a href="https://v0-smart-dmv.vercel.app">live demo</a></sub>
      <p>Moves DC DMV proof-of-residency checks from the counter to before the visit. I managed the six-person team and owned the OCR and verification backend: a quality gate, PaddleOCR service and weighted decision rules.</p>
      <p>
        <code>≥ 0.85</code> auto-approve · <code>&lt; 0.45</code> exception · staff review in between<br/>
        <code>bcrypt</code> · <code>JWT</code> · role-based access · full audit log
      </p>
      <img src="https://img.shields.io/badge/-Next.js-050505?style=flat-square&logo=nextdotjs" /> <img src="https://img.shields.io/badge/-TypeScript-050505?style=flat-square&logo=typescript" /> <img src="https://img.shields.io/badge/-Prisma-050505?style=flat-square&logo=prisma" /> <img src="https://img.shields.io/badge/-FastAPI-050505?style=flat-square&logo=fastapi" /> <img src="https://img.shields.io/badge/-Gemini-050505?style=flat-square&logo=googlegemini" />
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <h4>🧠 <a href="https://github.com/Srinivas-Vengaldas/Autix">Autix</a> <sub>· <a href="https://srinivas-vengaldas.github.io/Autix/">runs in your browser</a></sub></h4>
      <p>My 2022 NUS research project, rebuilt and audited in 2026. I found 8 evaluation bugs (swapped precision and recall, AUC computed on rounded predictions), retrained both models with fixed seeds on one shared test set, and deployed them with TensorFlow.js so photos never leave the device. VGG19: <code>87.0%</code> accuracy, <code>0.936</code> AUC. An educational project, not a diagnostic tool.</p>
    </td>
  </tr>
</table>

<details>
  <summary><b>More projects</b></summary>
  <br/>

| Project | What it is | Stack |
|---|---|---|
| [NextPlay Boards](https://github.com/Srinivas-Vengaldas/NextPlayBoards) | Kanban board with a web app, a mobile app and a shared API | React, React Native, Prisma, Supabase |
| [GW Student Connect](https://github.com/Srinivas-Vengaldas/GWU-Student-Connect) | Study partners, resources and real-time chat for GWU students | Next.js, TypeScript, Tailwind |
| [Mahindra University App](https://github.com/Srinivas-Vengaldas/Mahindra-University-App) | Attendance, grades and a parent dashboard with live location | Flutter, Firebase, Google Maps |
| [DC Book Store](https://github.com/Srinivas-Vengaldas/DC-Book-Store) | Multi-page bookstore storefront | JavaScript, Bootstrap |

</details>

---

### 🧰 Toolbox

<p align="center">
  <img src="https://skillicons.dev/icons?i=py,ts,js,java,sql,cpp&theme=dark" alt="Languages" /><br/>
  <img src="https://skillicons.dev/icons?i=nodejs,fastapi,nextjs,react,vite,tailwind&theme=dark" alt="Backend and frontend" /><br/>
  <img src="https://skillicons.dev/icons?i=postgres,redis,prisma,supabase,docker,githubactions,grafana,prometheus&theme=dark" alt="Data and infrastructure" /><br/>
  <img src="https://skillicons.dev/icons?i=tensorflow,pytorch,git,linux&theme=dark" alt="ML and tools" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Apache_Spark-050505?style=for-the-badge&logo=apachespark&logoColor=FFD700" />
  <img src="https://img.shields.io/badge/Databricks-050505?style=for-the-badge&logo=databricks&logoColor=FFD700" />
  <img src="https://img.shields.io/badge/Delta_Lake-050505?style=for-the-badge&logoColor=FFD700" />
  <img src="https://img.shields.io/badge/LightGBM-050505?style=for-the-badge&logoColor=FFD700" />
  <img src="https://img.shields.io/badge/ONNX_Runtime-050505?style=for-the-badge&logo=onnx&logoColor=FFD700" />
  <img src="https://img.shields.io/badge/k6-050505?style=for-the-badge&logo=k6&logoColor=FFD700" />
</p>

---

### 🐍 Contributions

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Srinivas-Vengaldas/Srinivas-Vengaldas/output/github-snake-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Srinivas-Vengaldas/Srinivas-Vengaldas/output/github-snake.svg" />
    <img alt="Contribution snake" src="https://raw.githubusercontent.com/Srinivas-Vengaldas/Srinivas-Vengaldas/output/github-snake-dark.svg" />
  </picture>
</p>

---

<p align="center">
  <b>Open to software and data engineering roles.</b><br/>
  <sub>The fastest way to reach me is <a href="mailto:vengaldas02@gmail.com">email</a>, or explore everything at <a href="https://vengaldas.vercel.app">vengaldas.vercel.app</a>.</sub>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FFD700,45:3a2f00,100:050505&height=110&section=footer" alt="" width="100%" />
</p>
