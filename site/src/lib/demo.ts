// Small helpers shared by the live demos on the project pages. No dependencies.

export type Palette = {
  bg: string; surface: string; text: string; muted: string; line: string; accent: string;
  amber: string; coral: string; sky: string; violet: string; media: string; dark: boolean;
};

export function palette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    bg: v('--bg'), surface: v('--surface-strong'), text: v('--text'), muted: v('--muted'), line: v('--line'),
    accent: v('--accent'), amber: v('--amber'), coral: v('--coral'), sky: v('--sky'), violet: v('--violet'),
    media: v('--media-bg') || '#0c110f', dark: document.documentElement.dataset.theme === 'dark',
  };
}

/** Fixed colours for demos drawn on the dark media background (same in both themes). */
export const MEDIA = {
  bg: '#0c110f', grid: 'rgba(238,241,234,0.08)', text: '#eef1ea', muted: 'rgba(238,241,234,0.6)',
  mint: '#9dc6b5', teal: '#3f7a69', amber: '#e3a857', coral: '#d8735e', sky: '#7fb0d8', violet: '#a99ad6',
};

export function onThemeChange(cb: () => void): void {
  new MutationObserver(cb).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/** Canvas with CSS-pixel coordinates at device resolution; calls draw on resize. */
export function setupCanvas(canvas: HTMLCanvasElement, aspect: number, onResize?: () => void) {
  const ctx = canvas.getContext('2d')!;
  const state = { w: 0, h: 0, ctx };
  let lastW = -1;
  const fit = (notify: boolean) => {
    const w = canvas.clientWidth || canvas.parentElement!.clientWidth;
    if (w === lastW) return; // height-only changes of the parent do not matter
    lastW = w;
    const h = Math.round(w / aspect);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.w = w;
    state.h = h;
    if (notify) onResize?.();
  };
  fit(false); // size now; the observer's first callback (async, after the caller has its state) draws
  new ResizeObserver(() => fit(true)).observe(canvas.parentElement!);
  queueMicrotask(() => onResize?.()); // first draw, once the caller holds the returned state
  return state;
}

/** requestAnimationFrame loop that only runs while the element is on screen and the tab is visible. */
export function visibleLoop(el: Element, frame: (dt: number) => void) {
  let onScreen = false;
  let raf = 0;
  let last = 0;
  let paused = false;
  const tick = (t: number) => {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    frame(dt);
    raf = requestAnimationFrame(tick);
  };
  const update = () => {
    const run = onScreen && !paused && document.visibilityState === 'visible';
    if (run && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(el);
  document.addEventListener('visibilitychange', update);
  return {
    set paused(p: boolean) { paused = p; update(); },
    get paused() { return paused; },
  };
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Seeded PRNG (mulberry32) with a normal sampler. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    const u = Math.max(next(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
  };
  return { next, normal };
}

/** Solve (A + λI) X = B for symmetric positive definite A (n×n, row-major) and B (n×m), in place on copies. */
export function ridgeSolve(A: Float64Array, B: Float64Array, n: number, m: number, lambda: number): Float64Array {
  const L = new Float64Array(A);
  for (let i = 0; i < n; i++) L[i * n + i] += lambda;
  // Cholesky: L L^T
  for (let j = 0; j < n; j++) {
    let s = L[j * n + j];
    for (let k = 0; k < j; k++) s -= L[j * n + k] * L[j * n + k];
    const d = Math.sqrt(Math.max(s, 1e-12));
    L[j * n + j] = d;
    for (let i = j + 1; i < n; i++) {
      let t = L[i * n + j];
      for (let k = 0; k < j; k++) t -= L[i * n + k] * L[j * n + k];
      L[i * n + j] = t / d;
    }
  }
  const X = new Float64Array(B);
  for (let c = 0; c < m; c++) {
    for (let i = 0; i < n; i++) {
      let t = X[i * m + c];
      for (let k = 0; k < i; k++) t -= L[i * n + k] * X[k * m + c];
      X[i * m + c] = t / L[i * n + i];
    }
    for (let i = n - 1; i >= 0; i--) {
      let t = X[i * m + c];
      for (let k = i + 1; k < n; k++) t -= L[k * n + i] * X[k * m + c];
      X[i * m + c] = t / L[i * n + i];
    }
  }
  return X;
}

/** Random sparse matrix with spectral radius ≈ `radius` (circular law: ρ ≈ σ·√(n·density) for iid entries). */
export function reservoirMatrix(n: number, density: number, radius: number, r: ReturnType<typeof rng>): Float64Array {
  const W = new Float64Array(n * n);
  const s = radius / Math.sqrt(n * density);
  for (let i = 0; i < n * n; i++) if (r.next() < density) W[i] = r.normal() * s;
  return W;
}

/** Axes for simple charts. Returns mapping functions. */
export function axes(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  xr: [number, number], yr: [number, number],
  opts: { color: string; grid: string; xticks?: number[]; yticks?: number[]; xlabel?: string; ylabel?: string;
    xfmt?: (v: number) => string; yfmt?: (v: number) => string; logx?: boolean },
) {
  const tx = (v: number) => {
    const a = opts.logx ? Math.log(v) : v, lo = opts.logx ? Math.log(xr[0]) : xr[0], hi = opts.logx ? Math.log(xr[1]) : xr[1];
    return box.x + ((a - lo) / (hi - lo)) * box.w;
  };
  const ty = (v: number) => box.y + box.h - ((v - yr[0]) / (yr[1] - yr[0])) * box.h;
  ctx.save();
  ctx.font = '12px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = opts.color;
  ctx.strokeStyle = opts.grid;
  ctx.lineWidth = 1;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const v of opts.yticks ?? []) {
    const y = Math.round(ty(v)) + 0.5;
    ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke();
    ctx.fillText(opts.yfmt ? opts.yfmt(v) : String(v), box.x - 8, y);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const v of opts.xticks ?? []) {
    const x = Math.round(tx(v)) + 0.5;
    ctx.beginPath(); ctx.moveTo(x, box.y + box.h); ctx.lineTo(x, box.y + box.h + 4); ctx.stroke();
    ctx.fillText(opts.xfmt ? opts.xfmt(v) : String(v), x, box.y + box.h + 8);
  }
  if (opts.xlabel) { ctx.fillText(opts.xlabel, box.x + box.w / 2, box.y + box.h + 26); }
  if (opts.ylabel) {
    ctx.save(); ctx.translate(box.x - 44, box.y + box.h / 2); ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'middle'; ctx.fillText(opts.ylabel, 0, 0); ctx.restore();
  }
  ctx.restore();
  return { tx, ty };
}

export function line(ctx: CanvasRenderingContext2D, xs: ArrayLike<number>, ys: ArrayLike<number>,
  tx: (v: number) => number, ty: (v: number) => number, color: string, width = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < xs.length; i++) {
    const x = tx(xs[i]), y = ty(ys[i]);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function bindRange(root: Element, name: string, fmt: (v: number) => string, onInput: (v: number) => void) {
  const input = root.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  const out = root.querySelector<HTMLOutputElement>(`output[for="${input.id}"]`) ?? input.parentElement?.querySelector('output');
  const update = () => {
    const v = parseFloat(input.value);
    if (out) out.textContent = fmt(v);
    onInput(v);
  };
  input.addEventListener('input', update);
  if (out) out.textContent = fmt(parseFloat(input.value));
  return () => parseFloat(input.value);
}
