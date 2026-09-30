# Nurulabs

Free, hands-on AI education for African students, structured like a
real programme. Learners enroll in one track, work through its syllabus
module by module (each ending in a milestone), and finish it before
starting the next. Every lab mixes short lessons with things to *do*:
interactives, quick quizzes, real Python that runs in the browser, and a
reflection in their own words.

## Tracks

| Track | Level | Status |
| --- | --- | --- |
| Python Essentials | Beginner | 17 labs + 2 projects, live — from first variables to working like a developer: terminal, pip & virtual environments, Jupyter/Colab, Git & GitHub |
| AI & Machine Learning | Intermediate | Requires Python Essentials (or its placement check); all 11 modules live (42 labs + 6 capstones, from NumPy to neural networks, LLMs, responsible AI and the practitioner's toolkit: Hugging Face, PyTorch, Colab and experiment tracking) |
| Data Science | Intermediate | Requires Python Essentials (or its placement check); all 7 modules live — wrangling, statistics, experiments, Excel, SQL, surveys, maps and communication — ending with a real World Bank data capstone |
| Data Engineering | Intermediate | In progress (open in preview mode): Modules 1–4 built — files & formats, data modelling, analytical SQL with DuckDB, query performance; pipelines (paginated extraction with retries and watermarks, idempotent upserts, Airflow-style DAGs, a mini dbt); data quality (JSON Schema and pydantic contracts, pytest with mutation testing, dbt-style data tests, volume/freshness/drift monitoring and lineage); warehouses and lakes (partitioned Parquet, pruning, idempotent rebuilds) dimensional modelling (star schemas, SCD type 2) and streaming (offsets, at-least-once, event-time windows and watermarks); plus four projects. The final capstone is next |

Experienced learners can take the Python placement check
(`/placement/python-essentials`) to go straight to AI & ML.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- [CodeMirror](https://codemirror.net/) for the code editor
- [Pyodide](https://pyodide.org) in a Web Worker for client-side Python. The
  core interpreter is self-hosted in `public/pyodide/`; libraries a lab lists
  in `packages` (NumPy, pandas, matplotlib, scikit-learn…) are fetched on
  demand from the matching jsDelivr build and cached by the browser. There's
  no backend. Progress and enrollment are stored in `localStorage`.
- `public/nl_harness.py` is the Python harness shared by the browser worker and
  the content validator: it runs learner code, reports structured errors,
  captures matplotlib charts, and evaluates checks.

## Getting started

```bash
npm install
npm run dev
```

Routes: `/` landing · `/tracks` choose a track · `/dashboard` the enrolled
track · `/tracks/<slug>` syllabus · `/labs/<slug>` a lab ·
`/placement/<slug>` placement check.

## How a lab works

Content lives in `src/lib/curriculum/`:

- `tracks.ts`: tracks, their modules and milestones, prerequisites, and
  placement questions.
- `labs/*.ts`: labs. Each lab is a list of steps:
  - `concept`: a lesson, short paragraphs plus an optional code sample or photo.
  - `experiment`: an interactive widget (see `src/components/lab/widgets/`).
  - `predict`: a "what will this print?" quiz the learner can then run.
  - `code`: the learner writes Python. `checks` are Python expressions
    evaluated against their namespace after a run. `_stdout` holds printed
    output, `_source` holds their code, and `_with(name=value)` re-runs their
    code with a variable changed, so a check can test logic on other inputs.
    `_charts` describes each matplotlib chart drawn (title, axis labels, and
    counts of lines, bars and points).
    `challenge: true` hides the instructions.
  - `explain`: a reflection, checked for key ideas with regex patterns.

The Python runtime (`public/pyodide-worker.js`) returns structured errors:
the error type, the line, and a snapshot of the learner's variables. The
mentor (`src/lib/mentor.ts`) uses these, along with the learner's attempt
history, to escalate hints.

### Validating content

```bash
npm run validate:labs
```

This runs every lab in the real Pyodide runtime (in Node, with the same
harness as the browser): every code step's starter code must fail its checks
and its solution must pass them, every quiz answer must match real output,
and every reflection's model answer must cover its ideas. Run it after
editing a lab. It needs internet access the first time to fetch packages.

### Previewing locked labs

Labs normally unlock in order after enrolling. To review any lab directly, open `/preview` and turn on preview mode: it opens every built lab — including tracks not yet open for enrollment — in that browser, without touching progress.

### Lab datasets

Lab CSVs live in `src/lib/curriculum/data/` and are listed in `registry.ts`. `npm run data` (run automatically before `dev`, `build` and `validate:labs`) writes them to `public/data/`, and labs reference them with `dataFile("name.csv")`. The Python worker downloads a lab's datasets when the lab opens, so they're never part of the site's JavaScript.

### Keeping pages light

`npm run data` also writes `src/lib/curriculum/lab-index.json`: every lab's title, summary and step outline, without lesson text, code or checks. Syllabus pages, the dashboard and other client code use this index; only a lab's own page (a server component) loads that lab's full content. Widgets and the code editor are loaded on demand. Run `npm run data` (or `dev`/`build`, which run it) after changing labs.

### Extra Python packages and binary files

Pure-Python packages that Pyodide doesn't ship (currently `openpyxl`, for Excel files) are self-hosted as wheels in `public/wheels/` and listed in `WHEELS` in both `public/pyodide-worker.js` and `scripts/validate-labs.mjs`; labs just name the package. Binary lab files (like the Excel workbook) are committed under `public/datasets/`.

### Models and notebooks outside the browser

The Hugging Face lab can run a real model in the browser with transformers.js (loaded from jsDelivr only when the learner opts in, ~67 MB). Work that needs PyTorch or a GPU uses Google Colab notebooks in `public/notebooks/`, opened straight from GitHub (`colab.research.google.com/github/Its-Delimas/nurulabs/blob/main/public/notebooks/…`).

### Real open data

The Data Science track uses real, openly licensed data: World Bank World Development Indicators (CC BY 4.0), Kenya county boundaries from geoBoundaries (public domain) and 2019 census county populations (KNBS). Sources are noted in `src/lib/curriculum/data/open-data.ts`.

### Shared labs

A lab can appear in more than one track's syllabus (Data Science reuses AI & ML's Scientific Python module). Progress is stored per lab, so finishing it in one track counts in the other. Lab numbers, the "next lab" and unlock order follow whichever track the learner is enrolled in.

## Photos

The photos in `public/images/` are from Unsplash and credited in
`public/images/CREDITS.md`.
