# fekoester.github.io

Personal research site of Felix Köster — live at **https://fekoester.github.io**.

- `site/` — Astro source (content lives in `site/src/data/*.ts`)
- everything else at the root — the generated static site that GitHub Pages serves
  (Pages source: branch `main`, folder `/`)

## Update the site

```bash
cd site
npm install            # first time only (Node >= 22.12)
npm run dev            # http://localhost:4321
# edit src/data/{publications,projects,updates,cv,site}.ts
npm run publish        # build + copy site/dist to the repo root
cd .. && git add -A && git commit -m "Update site" && git push
```

| What happened | Edit |
|---|---|
| New paper / preprint / DOI | `site/src/data/publications.ts` (+ an entry in `updates.ts`) |
| New public project or release | `site/src/data/projects.ts` (+ `updates.ts`) |
| Any significant news | `site/src/data/updates.ts` (newest first), bump `updated` in `site.ts` |
| Job / CV change | `site/src/data/cv.ts` |

Equations: add `equations: [{ tex: String.raw\`...\`, caption }]` to a project; KaTeX renders them at build time.

## Project pages: covers, figures, videos, live demos

Each project page has a cover, key facts, a live demo that runs in the browser, and the project's own
figures and video loops. Text lives in `projects.ts`; everything visual lives in `site/src/data/showcase.ts`
(by slug).

| Piece | Where |
|---|---|
| Cover (16:10) | `public/media/<slug>/cover.webp` + `cover-640.webp`, rendered by `tools/media/make_media.py` from the project's own equations or data (Lorenz, PPS, oscillators, a reservoir driven by Hamlet, real CAISO demand, ...) |
| Figures | real result figures from the public repos, listed in `FIGURES` in `make_media.py` → WebP; captions in `showcase.ts` follow the repo READMEs |
| Video loops | the repos' GIFs → H.264 `.mp4` + poster (`VIDEOS` in `make_media.py`); `coverVideo` plays on hover in the grid |
| Key facts | `facts` in `showcase.ts`, only numbers published in a paper or repo README |
| Live demo | `demo: '<key>'` in `showcase.ts` → `src/components/demos/*.astro` (vanilla TS on canvas, helpers in `src/lib/demo.ts`) |
| Power snapshot | `src/data/power-snapshot.json`, real data from the latest PowerForecastMLOps CI run |

```bash
cd site
python3 tools/media/make_media.py all                      # everything (needs numpy, scipy, matplotlib, Pillow, ffmpeg, gh)
python3 tools/media/make_media.py covers --only neat        # one step, one project
python3 tools/media/make_media.py power                     # refresh the PowerForecast snapshot
```

Downloads are cached in `tools/media/.cache/` (not in git). Demos only run while on screen and respect
`prefers-reduced-motion`.

Rules: only verified publications; only public repositories; no employer-confidential work; label preprints and work in progress as such.
