# fekoester.github.io — agent notes

Felix's public research homepage. Felix wants this site kept current: whenever something
significant happens in any project (paper accepted/published, preprint posted, public release,
new public repo worth showing, major result), update this site in the same session, alongside
the GitHub push and the Notion Dev Log entry.

How: edit `site/src/data/*.ts` (see README table), add a line to `site/src/data/updates.ts`,
bump `updated` in `site/src/data/site.ts`, then `cd site && npm run publish`, commit, push to `main`.

Guardrails: verify bibliographic data before adding a paper; link only public repos; never put
employer-confidential work, private contact details or unreviewed numbers on the site; mark
preprints and work in progress clearly (e.g. EchoMario has no established reservoir advantage yet).

Project pages: visuals live in `site/src/data/showcase.ts` (cover, facts, figures, video loops, demo key);
media are built by `site/tools/media/make_media.py` (see README). Facts and captions must come from the
paper or the repository README. Demo components are in `site/src/components/demos/`.
