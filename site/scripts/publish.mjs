// Copy the Astro build (site/dist) to the repository root, which GitHub Pages serves
// (Pages source: branch `main`, folder `/`). Old generated files are removed first.
import { cpSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const siteDir = resolve(import.meta.dirname, '..');
const repoRoot = resolve(siteDir, '..');
const dist = join(siteDir, 'dist');
const KEEP = new Set(['.git', '.github', 'site', 'README.md', 'CLAUDE.md', '.nojekyll', '.gitignore']);

if (!existsSync(join(dist, 'index.html'))) throw new Error('Run `npm run build` first.');
for (const entry of readdirSync(repoRoot)) {
  if (!KEEP.has(entry)) rmSync(join(repoRoot, entry), { recursive: true, force: true });
}
cpSync(dist, repoRoot, { recursive: true });
writeFileSync(join(repoRoot, '.nojekyll'), '');
console.log('Published site/dist -> repository root');
