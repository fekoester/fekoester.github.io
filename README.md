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

Rules: only verified publications; only public repositories; no employer-confidential work; label preprints and work in progress as such.
