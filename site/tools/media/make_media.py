#!/usr/bin/env python3
"""Build every image and video loop the project pages use.

    python tools/media/make_media.py all                 # fetch + figures + videos + covers + power
    python tools/media/make_media.py covers --only pps   # one step, one project

Run from `site/`. Output goes to `public/media/<slug>/`; downloads are cached in `tools/media/.cache/`.

- figures: real result figures from the public project repositories, converted to WebP
- videos:  the repositories' GIF animations as small H.264 loops (+ a WebP poster frame)
- covers:  one 16:10 cover per project, rendered from the project's own equations or data
           (PPS, oscillators, Lorenz, FitzHugh-Nagumo, a reservoir driven by text, ...)
- power:   a snapshot of real CAISO demand + forecast from the latest PowerForecastMLOps CI run
           (needs `gh`; written to src/data/power-snapshot.json)

Needs numpy, scipy, matplotlib, Pillow and ffmpeg (libx264).
"""
from __future__ import annotations

import argparse
import csv
import json
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np

SITE = Path(__file__).resolve().parents[2]
OUT = SITE / "public" / "media"
CACHE = Path(__file__).resolve().parent / ".cache"
RAW = "https://raw.githubusercontent.com/fekoester/{repo}/{branch}/{path}"
BRANCH: dict[str, str] = {}  # default branch per repo, looked up on first use

# --------------------------------------------------------------------------------------------
# Real figures from the public repositories: (slug, repo, path in repo, output name)
FIGURES = [
    ("reservoir-language-model", "Shakespeare_Res", "results/quick/bpc_vs_params.png", "bpc-vs-params"),
    ("reservoir-language-model", "Shakespeare_Res", "results/quick/radius_sweep.png", "radius-sweep"),
    ("reservoir-language-model", "LAERC", "results/shakespeare_bpe1024/val_curves.png", "laerc-bpe1024"),
    ("reservoir-language-model", "LAERC", "results/owt_5m_t4/val_curves.png", "laerc-owt"),
    ("attention-enhanced-reservoir", "AERes", "benchmarks/results/benchmark.png", "benchmark"),
    ("master-memory-function", "MMF", "docs/delay_scan.png", "delay-scan"),
    ("master-memory-function", "MC_calc", "docs/esn_capacity.png", "esn-capacity"),
    ("adaptive-sensing", "ASAERC", "results/readout_comparison/comparison.png", "comparison"),
    ("echomario", "EchoMario", "docs/media/imitation_dagger.png", "dagger"),
    ("causal-convolution-transformer", "Causal-Convolution-Transformer-CCT", "assets/loss.png", "loss"),
    ("ctm-cifar", "ctm-cifar-bench", "assets/tick0_fix_compare.png", "tick0-fix"),
    ("ctm-cifar", "ctm-cifar-bench", "assets/eval_per_tick_acc.png", "per-tick"),
    ("oscillator-networks", "Oscillator-Network-Simulation", "docs/run_eps0.6.png", "locking"),
    ("oscillator-networks", "Oscillator-Network-Simulation", "docs/sweep.png", "sweep"),
    ("neat", "NEAT-Implementation", "docs/media/dodge_training.png", "dodge-training"),
    ("neat", "NEAT-Implementation", "docs/media/xor_champion.png", "xor-champion"),
    ("neat", "NEAT-Implementation", "docs/media/double_pole_champion.png", "double-pole-champion"),
    ("neat", "NEAT-Implementation", "docs/media/xor_training.png", "xor-training"),
    ("neat", "NEAT-Implementation", "docs/media/viewer.png", "viewer"),
    ("multiplexed-networks", "Multiplexed-Neural-Networks", "docs/curves.png", "curves"),
    ("world-generation", "PWG", "docs/world_42.png", "pwg-world-42"),
    ("world-generation", "PWG", "docs/layers_42.png", "pwg-layers"),
    ("world-generation", "World-Simulation", "docs/evolution.png", "evolution"),
    ("world-generation", "Ant-Simulation", "docs/foraging.png", "foraging"),
]

# GIF animations -> H.264 loops: (slug, repo, path, output name, scale, pixel-art)
VIDEOS = [
    ("primordial-particle-system", "PPS", "docs/pps.gif", "pps", 2, False),
    ("echomario", "EchoMario", "docs/media/teacher_full_level.gif", "teacher", 2, True),
    ("echomario", "EchoMario", "docs/media/imitation_reservoir_gaps.gif", "reservoir-gaps", 2, True),
    ("neat", "NEAT-Implementation", "docs/media/dodge.gif", "dodge", 2, True),
    ("world-generation", "World-Simulation", "docs/world.gif", "world-sim", 2, True),
    ("world-generation", "Ant-Simulation", "docs/ants.gif", "ants", 2, True),
    ("adaptive-sensing", "ASAERC", "docs/media/adaptive_queries_mackey_glass.gif", "adaptive-queries", 1, False),
]


def fetch(repo: str, path: str) -> Path:
    dest = CACHE / repo / path
    if dest.exists():
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    if repo not in BRANCH:
        with urllib.request.urlopen(f"https://api.github.com/repos/fekoester/{repo}") as r:
            BRANCH[repo] = json.load(r)["default_branch"]
    url = RAW.format(repo=repo, branch=BRANCH[repo], path=path)
    print("  fetch", url)
    with urllib.request.urlopen(url) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)
    return dest


def save_webp(img, dest: Path, width: int | None = None, quality: int = 84) -> dict:
    from PIL import Image

    img = img.convert("RGB")
    if width and img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=quality, method=6)
    return {"w": img.width, "h": img.height}


def step_figures(only: str | None) -> None:
    from PIL import Image

    sizes = {}
    for slug, repo, path, name in FIGURES:
        if only and only != slug:
            continue
        src = fetch(repo, path)
        info = save_webp(Image.open(src), OUT / slug / f"{name}.webp", width=1600)
        sizes[f"/media/{slug}/{name}.webp"] = info
        print("  figure", slug, name, info)
    merge_sizes(sizes)


def step_videos(only: str | None) -> None:
    from PIL import Image

    sizes = {}
    for slug, repo, path, name, scale, pixel in VIDEOS:
        if only and only != slug:
            continue
        src = fetch(repo, path)
        dest = OUT / slug / f"{name}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        flags = "neighbor" if pixel else "lanczos"
        vf = f"scale=trunc(iw*{scale}/2)*2:trunc(ih*{scale}/2)*2:flags={flags}"
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p",
             "-crf", "31" if name == "pps" else "24", "-preset", "slow", "-movflags", "+faststart", "-an", str(dest)],
            check=True,
        )
        gif = Image.open(src)
        gif.seek(gif.n_frames - 1)  # the last frame shows the most structure
        poster = gif.convert("RGB")
        w, h = poster.width * scale, poster.height * scale
        poster = poster.resize((w - w % 2, h - h % 2), Image.NEAREST if pixel else Image.LANCZOS)
        info = save_webp(poster, OUT / slug / f"{name}.webp", quality=82)
        sizes[f"/media/{slug}/{name}.webp"] = info
        sizes[f"/media/{slug}/{name}.mp4"] = info
        print("  video", slug, name, info, f"{dest.stat().st_size // 1024} KB")
    merge_sizes(sizes)


def merge_sizes(sizes: dict) -> None:
    """Image sizes for width/height attributes (no layout shift)."""
    path = SITE / "src" / "data" / "media-sizes.json"
    data = json.loads(path.read_text()) if path.exists() else {}
    data.update(sizes)
    path.write_text(json.dumps(dict(sorted(data.items())), indent=1) + "\n")


# --------------------------------------------------------------------------------------------
# Covers. One visual language: near-black green ground, mint / amber / coral / sky accents.
BG = "#0c110f"
MINT, TEAL, AMBER, CORAL, SKY, VIOLET, PAPER = "#9dc6b5", "#3f7a69", "#e3a857", "#d8735e", "#7fb0d8", "#a99ad6", "#eef1ea"
W, H, DPI = 16, 10, 100  # 1600 x 1000 render


def canvas():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig = plt.figure(figsize=(W, H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor(BG)
    ax.set_axis_off()
    return fig, ax


def finish(fig, slug: str) -> None:
    import io

    import matplotlib.pyplot as plt
    from PIL import Image

    buf = io.BytesIO()
    fig.savefig(buf, format="png", facecolor=fig.get_facecolor(), dpi=DPI)
    plt.close(fig)
    img = Image.open(buf)
    write_cover(img, slug)


def write_cover(img, slug: str) -> None:
    from PIL import Image

    img = img.convert("RGB")
    # centre-crop to exactly 16:10
    tw = min(img.width, round(img.height * 1.6))
    th = round(tw / 1.6)
    left, top = (img.width - tw) // 2, (img.height - th) // 2
    img = img.crop((left, top, left + tw, top + th))
    sizes = {}
    for width, suffix in ((1280, ""), (640, "-640")):
        resized = img.resize((width, round(width / 1.6)), Image.LANCZOS)
        sizes[f"/media/{slug}/cover{suffix}.webp"] = save_webp(resized, OUT / slug / f"cover{suffix}.webp", quality=80)
    merge_sizes(sizes)
    print("  cover", slug)


def glow_line(ax, x, y, color, lw=1.2, alpha=0.9, glow=True):
    if glow:
        for w, a in ((lw * 7, 0.05), (lw * 3.5, 0.10)):
            ax.plot(x, y, color=color, lw=w, alpha=a * alpha, solid_capstyle="round")
    ax.plot(x, y, color=color, lw=lw, alpha=alpha, solid_capstyle="round")


def cmap(*colors):
    from matplotlib.colors import LinearSegmentedColormap

    return LinearSegmentedColormap.from_list("c", list(colors))


def rk4(f, x0, dt, n, every=1):
    x = np.array(x0, dtype=float)
    out = []
    for i in range(n):
        k1 = f(x)
        k2 = f(x + dt / 2 * k1)
        k3 = f(x + dt / 2 * k2)
        k4 = f(x + dt * k3)
        x = x + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        if i % every == 0:
            out.append(x.copy())
    return np.array(out)


def cover_llm_training_dynamics():
    """Heavy-ball training m θ'' + mγ θ' = -∇S on an anisotropic, slightly curved valley."""
    fig, ax = canvas()
    xs, ys = np.meshgrid(np.linspace(-3.2, 3.2, 500), np.linspace(-2, 2, 320))

    def loss(x, y):
        return 0.08 * x**2 + 1.6 * (y - 0.35 * np.sin(1.2 * x)) ** 2

    def grad(p):
        x, y = p
        r = y - 0.35 * np.sin(1.2 * x)
        return np.array([0.16 * x + 3.2 * r * (-0.42 * np.cos(1.2 * x)), 3.2 * r])

    ax.contour(xs, ys, np.log(loss(xs, ys) + 0.02), levels=30, colors=[TEAL], linewidths=0.9, alpha=0.75)
    rng = np.random.default_rng(3)
    colors = [AMBER, MINT, CORAL, SKY, VIOLET]
    for k in range(7):
        th = np.array([rng.uniform(-3, 3), rng.choice([-1.8, 1.8]) * rng.uniform(0.6, 1)])
        v = np.zeros(2)
        m, gamma, dt = 1.0, rng.uniform(1.8, 2.6), 0.04
        pts = [th.copy()]
        for _ in range(1400):
            v += dt * (-grad(th) / m - gamma * v)
            th = th + dt * v
            pts.append(th.copy())
        p = np.array(pts)
        glow_line(ax, p[:, 0], p[:, 1], colors[k % len(colors)], lw=1.4, alpha=0.9)
        ax.scatter(p[0, 0], p[0, 1], s=40, color=colors[k % len(colors)], zorder=5)
    ax.scatter([0], [0], s=260, color=PAPER, alpha=0.12)
    ax.scatter([0], [0], s=40, color=PAPER, zorder=6)
    ax.set_xlim(-3.2, 3.2)
    ax.set_ylim(-2, 2)
    finish(fig, "llm-training-dynamics")


SHAKESPEARE = (
    "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows "
    "of outrageous fortune, Or to take arms against a sea of troubles And by opposing end them. To die: to sleep; "
    "No more; and by a sleep to say we end The heart-ache and the thousand natural shocks That flesh is heir to"
)


def esn_states(text: str, n: int, rho: float, leak: float, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    w = rng.normal(size=(n, n)) * (rng.random((n, n)) < 0.1)
    w *= rho / max(abs(np.linalg.eigvals(w)))
    chars = sorted(set(text))
    emb = rng.normal(size=(len(chars), n)) * 0.9
    r = np.zeros(n)
    out = []
    for c in text:
        r = (1 - leak) * r + leak * np.tanh(w @ r + emb[chars.index(c)])
        out.append(r.copy())
    return np.array(out)


def cover_reservoir_language_model():
    """A 40-unit leaky ESN driven by Hamlet, one column per character."""
    fig, ax = canvas()
    text = SHAKESPEARE[:200]
    s = esn_states(text, 40, 0.95, 0.22, seed=3)
    view = slice(40, 40 + 44)
    shown = s[view]
    order = np.argsort(np.argmax(shown, axis=0))
    ax.imshow(shown[:, order].T, aspect="auto", cmap=cmap(SKY, "#13283a", BG, "#3a2a14", AMBER), vmin=-0.55, vmax=0.55,
              extent=(0, shown.shape[0], 0, 40), interpolation="nearest")
    for i, c in enumerate(text[view]):
        ax.text(i + 0.5, -2.3, c, color=PAPER, ha="center", va="center", fontsize=22, family="monospace", alpha=0.92)
    ax.set_xlim(0, shown.shape[0])
    ax.set_ylim(-4.6, 40)
    finish(fig, "reservoir-language-model")


def lorenz(n=24000, dt=0.005):
    s, r, b = 10, 28, 8 / 3
    return rk4(lambda v: np.array([s * (v[1] - v[0]), v[0] * (r - v[2]) - v[1], v[0] * v[1] - b * v[2]]),
               [1, 1, 20], dt, n)


def cover_attention_enhanced_reservoir():
    fig, ax = canvas()
    p = lorenz()[1500:]
    # project slightly rotated for depth
    a = 0.55
    x = p[:, 0] * np.cos(a) + p[:, 1] * np.sin(a)
    z = p[:, 2]
    from matplotlib.collections import LineCollection

    segs = np.stack([np.column_stack([x[:-1], z[:-1]]), np.column_stack([x[1:], z[1:]])], axis=1)
    t = np.linspace(0, 1, len(segs))
    for lw, al in ((6, 0.04), (2.5, 0.08), (0.9, 0.85)):
        lc = LineCollection(segs, cmap=cmap(TEAL, MINT, AMBER, CORAL), linewidths=lw, alpha=al)
        lc.set_array(t)
        ax.add_collection(lc)
    ax.set_xlim(x.min() - 14, x.max() + 14)
    ax.set_ylim(z.min() - 4, z.max() + 4)
    finish(fig, "attention-enhanced-reservoir")


def memory_function(n, rho, kmax=60, t=6000, seed=0):
    """Linear memory function m(k) of a linear reservoir (exact regression on a long run)."""
    rng = np.random.default_rng(seed)
    w = rng.normal(size=(n, n))
    w *= rho / max(abs(np.linalg.eigvals(w)))
    win = rng.uniform(-1, 1, n)
    u = rng.uniform(-1, 1, t)
    x = np.zeros(n)
    xs = []
    for ut in u:
        x = w @ x + win * ut
        xs.append(x.copy())
    xs = np.array(xs)[200:]
    u = u[200:]
    c = xs.T @ xs / len(xs) + 1e-9 * np.eye(n)
    ci = np.linalg.inv(c)
    m = []
    for k in range(1, kmax + 1):
        v = xs[k:].T @ u[:-k] / (len(u) - k)
        m.append(v @ ci @ v / np.var(u))
    return np.clip(m, 0, 1)


def cover_master_memory_function():
    fig, ax = canvas()
    radii = np.linspace(0.55, 0.995, 11)
    for i, rho in enumerate(radii):
        m = memory_function(40, rho, kmax=70, seed=i)
        k = np.arange(1, len(m) + 1)
        off = i * 0.55
        col = cmap(TEAL, MINT, AMBER)(i / (len(radii) - 1))
        ax.fill_between(k, off, off + m * 1.6, color=col, alpha=0.18, lw=0)
        glow_line(ax, k, off + m * 1.6, col, lw=1.6)
    ax.set_xlim(-6, 76)
    ax.set_ylim(-0.6, len(radii) * 0.55 + 1.3)
    finish(fig, "master-memory-function")


def cover_adaptive_sensing():
    """2-D damped wave field driven at a few points by a Mackey-Glass series; sensors and query points."""
    fig, ax = canvas()
    n = 200
    # Mackey-Glass drive
    tau, beta, gamma, nexp, dt = 17, 0.2, 0.1, 10, 1.0
    hist = [1.2] * (tau + 1)
    for _ in range(3000):
        x, xt = hist[-1], hist[-tau - 1]
        hist.append(x + dt * (beta * xt / (1 + xt**nexp) - gamma * x))
    drive = np.array(hist[-900:]) - 0.9
    u = np.zeros((n, n))
    up = np.zeros((n, n))
    srcs = [(60, 70), (140, 120), (90, 150), (150, 50)]
    c2 = 0.18
    for t in range(900):
        lap = np.roll(u, 1, 0) + np.roll(u, -1, 0) + np.roll(u, 1, 1) + np.roll(u, -1, 1) - 4 * u
        un = 2 * u - up + c2 * lap - 0.004 * (u - up)
        for j, (a, b) in enumerate(srcs):
            un[a - 2:a + 3, b - 2:b + 3] += 0.5 * drive[(t + 40 * j) % len(drive)]
        up, u = u, un
    ax.imshow(u, cmap=cmap("#2c5f86", "#0f2230", BG, "#17443a", MINT), vmin=-np.percentile(abs(u), 99.5),
              vmax=np.percentile(abs(u), 99.5), extent=(0, n, 0, n * 0.625), aspect="auto", interpolation="bicubic")
    rng = np.random.default_rng(1)
    gx, gy = np.meshgrid(np.linspace(12, n - 12, 14), np.linspace(10, n * 0.625 - 10, 9))
    ax.scatter(gx, gy, s=9, color=PAPER, alpha=0.55)
    q = np.array([[110, 70], [70, 40], [150, 85]])
    for cx, cy in q:
        pts = rng.normal(size=(9, 2)) * 7 + [cx, cy]
        ax.scatter(pts[:, 0], pts[:, 1], s=120, color=AMBER, alpha=0.18)
        ax.scatter(pts[:, 0], pts[:, 1], s=26, color=AMBER, edgecolors=BG, linewidths=0.8)
    ax.set_xlim(0, n)
    ax.set_ylim(0, n * 0.625)
    finish(fig, "adaptive-sensing")


def cover_from_gif(slug, repo, path, frame_frac, pad_color=None):
    from PIL import Image

    gif = Image.open(fetch(repo, path))
    gif.seek(int(frame_frac * (gif.n_frames - 1)))
    img = gif.convert("RGB")
    # pad to 16:10 with the edge colour, then upscale crisply
    w, h = img.size
    target_h = round(w / 1.6)
    if target_h > h:
        canvas_img = Image.new("RGB", (w, target_h), pad_color or img.getpixel((w // 2, 2)))
        canvas_img.paste(img, (0, target_h - h))
        img = canvas_img
    scale = max(1, 1280 // img.width + 1)
    img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    write_cover(img, slug)


def cover_echomario():
    from PIL import Image

    gif = Image.open(fetch("EchoMario", "docs/media/teacher_full_level.gif"))
    gif.seek(int(0.55 * (gif.n_frames - 1)))
    img = gif.convert("RGB")
    h = 150  # bottom of the frame: ground, platforms, coins (the text HUD sits at the top)
    w = round(h * 1.6)
    img = img.crop((img.width - w, img.height - h, img.width, img.height))
    write_cover(img.resize((img.width * 5, img.height * 5), Image.NEAREST), "echomario")


def cover_causal_convolution_transformer():
    fig, ax = canvas()
    n = 40
    rng = np.random.default_rng(2)
    for i in range(n):
        for j in range(i + 1):
            d = i - j
            if d < 4:
                col, a = AMBER, 0.95 - 0.12 * d
            else:
                col, a = MINT, float(np.clip(0.08 + 0.5 * rng.random() ** 6 + 0.25 * np.exp(-d / 6), 0, 0.85))
            ax.add_patch(__import__("matplotlib").patches.FancyBboxPatch(
                (j + 0.08, n - i - 1 + 0.08), 0.84, 0.84, boxstyle="round,pad=0,rounding_size=0.18",
                facecolor=col, alpha=a, lw=0))
    ax.set_xlim(-12, n + 12 * 1.6 * 0 + 12)
    ax.set_ylim(-1, n + 1)
    ax.set_aspect("equal")
    ax.set_xlim(-(n * 1.6 * 1.05 - n) / 2, n + (n * 1.6 * 1.05 - n) / 2)
    ax.set_ylim(-n * 0.025, n * 1.025)
    finish(fig, "causal-convolution-transformer")


def cover_ctm_cifar():
    """CTM's representation is neuron synchronisation: traces lock into groups (left), and the
    synchronisation matrix S_ij = <z_i z_j> over the ticks becomes block-structured (right)."""
    import matplotlib.patches as mp

    fig, ax = canvas()
    rng = np.random.default_rng(5)
    groups, per = 3, 6
    n = groups * per
    g = np.repeat(np.arange(groups), per)
    omega = np.array([0.9, 1.4, 2.0])[g] + 0.45 * rng.normal(size=n)
    th = rng.uniform(0, 2 * np.pi, n)
    dt, steps = 0.02, 900
    trace = []
    for i in range(steps):
        k = 0.0 if i < 260 else 6.0 * min(1.0, (i - 260) / 150)
        coup = np.array([np.mean(np.sin(th[g == g[j]] - th[j])) for j in range(n)])
        th = th + dt * (omega + k * coup)
        trace.append(np.sin(th))
    z = np.array(trace).T
    t = np.arange(steps) / steps * 13.5
    cols = [MINT, AMBER, SKY]
    for j in range(n):
        glow_line(ax, t, z[j] * 0.36 + j * 0.92 + 0.5 * g[j], cols[g[j]], lw=1.4, alpha=0.88)
    late = z[:, 500:]
    sync = late @ late.T / late.shape[1] * 2
    x0, y0, c = 15.2, 0.5, 0.92
    for i in range(n):
        for j in range(n):
            v = float(np.clip(sync[i, j], -1, 1))
            col = cols[g[i]] if (g[i] == g[j] and v > 0.4) else (SKY if v < 0 else PAPER)
            ax.add_patch(mp.FancyBboxPatch((x0 + j * c, y0 + (n - 1 - i) * c), c * 0.86, c * 0.86,
                                           boxstyle="round,pad=0,rounding_size=0.12", lw=0, facecolor=col,
                                           alpha=0.9 * abs(v) if col != PAPER else 0.10 + 0.25 * abs(v)))
    ax.set_xlim(-0.4, 32.3)
    ax.set_ylim(-0.6, -0.6 + 32.7 / 1.6)
    finish(fig, "ctm-cifar")


def fhn(v, w, i_ext, a=0.7, b=0.8, tau=12.5):
    return v - v**3 / 3 - w + i_ext, (v + a - b * w) / tau


def cover_fhn_mnist():
    fig, ax = canvas()
    i_ext = 0.5
    vv = np.linspace(-2.6, 2.6, 400)
    glow_line(ax, vv, vv - vv**3 / 3 + i_ext, SKY, lw=1.6, alpha=0.7)
    glow_line(ax, vv, (vv + 0.7) / 0.8, VIOLET, lw=1.6, alpha=0.7)
    vg, wg = np.meshgrid(np.linspace(-2.6, 2.6, 30), np.linspace(-1.1, 2.3, 18))
    dv, dw = fhn(vg, wg, i_ext)
    sp = np.hypot(dv, dw * 8) + 1e-9
    ax.quiver(vg, wg, dv / sp, dw * 8 / sp, color=TEAL, alpha=0.5, scale=60, width=0.0016)
    rng = np.random.default_rng(0)
    cols = [AMBER, CORAL, MINT, AMBER, CORAL]
    for k in range(5):
        s = np.array([rng.uniform(-2.3, 2.3), rng.uniform(-0.9, 2.0)])
        f = lambda p: np.array(fhn(p[0], p[1], i_ext))
        tr = rk4(f, s, 0.05, 2400)
        glow_line(ax, tr[:, 0], tr[:, 1], cols[k], lw=1.5, alpha=0.9)
    ax.set_xlim(-2.75, 2.75)
    ax.set_ylim(-1.15, 2.3)
    finish(fig, "fhn-mnist")


def cover_gfx1010_rocblas():
    """C = A·B with tiled blocks; the tile being computed is lit."""
    import matplotlib.patches as mp

    fig, ax = canvas()
    rng = np.random.default_rng(4)

    def matrix(x0, y0, rows, cols, lit=None, color=MINT):
        for r in range(rows):
            for c in range(cols):
                on = lit is not None and lit(r, c)
                a = 0.9 if on else 0.10 + 0.12 * rng.random()
                ax.add_patch(mp.FancyBboxPatch((x0 + c, y0 - r), 0.86, 0.86, boxstyle="round,pad=0,rounding_size=0.15",
                                               facecolor=AMBER if on else color, alpha=a, lw=0))

    matrix(1, 21, 8, 12, lit=lambda r, c: 2 <= r <= 3, color=SKY)           # A: rows of the tile
    matrix(15, 21, 12, 8, lit=lambda r, c: 4 <= c <= 5, color=VIOLET)       # B: cols of the tile
    matrix(25.5, 21, 8, 8, lit=lambda r, c: 2 <= r <= 3 and 4 <= c <= 5)    # C
    ax.text(13.4, 17.4, "×", color=PAPER, fontsize=40, ha="center", va="center", alpha=0.6)
    ax.text(24.4, 17.4, "=", color=PAPER, fontsize=40, ha="center", va="center", alpha=0.6)
    ax.set_xlim(-0.5, 34.5)
    ax.set_ylim(21 - 12 - 0.5 - (34.9 / 1.6 - 12.4) / 2, 22 + (34.9 / 1.6 - 12.4) / 2)
    finish(fig, "gfx1010-rocblas")


def cover_power_forecast_mlops():
    snap = json.loads((SITE / "src" / "data" / "power-snapshot.json").read_text())
    fig, ax = canvas()
    hist = snap["history"][-24 * 6:]
    t = np.arange(len(hist))
    y = np.array([h["y"] for h in hist]) / 1000
    fc = snap["forecast"]
    tf = len(hist) + np.arange(len(fc))
    yf = np.array([f["y"] for f in fc]) / 1000
    lo95 = np.array([f["lo95"] for f in fc]) / 1000
    hi95 = np.array([f["hi95"] for f in fc]) / 1000
    lo80 = np.array([f["lo80"] for f in fc]) / 1000
    hi80 = np.array([f["hi80"] for f in fc]) / 1000
    for d in range(0, len(hist) + len(fc), 24):
        ax.axvline(d, color=PAPER, alpha=0.05, lw=1)
    ax.fill_between(t, y.min() - 3, y, color=MINT, alpha=0.07, lw=0)
    glow_line(ax, t, y, MINT, lw=2)
    ax.fill_between(tf, lo95, hi95, color=AMBER, alpha=0.16, lw=0)
    ax.fill_between(tf, lo80, hi80, color=AMBER, alpha=0.26, lw=0)
    glow_line(ax, tf, yf, AMBER, lw=2.2)
    ax.set_xlim(-4, tf[-1] + 8)
    ax.set_ylim(y.min() - 3, max(hi95.max(), y.max()) + 4)
    finish(fig, "power-forecast-mlops")


def cover_paperforge():
    import matplotlib.patches as mp

    fig, ax = canvas()
    rng = np.random.default_rng(8)
    pages = [(2, 1.2, -6), (6.2, 1.0, 3), (10.4, 1.4, -2)]
    hl = []
    for px, py, rot in pages:
        tr = __import__("matplotlib").transforms.Affine2D().rotate_deg_around(px + 2, py + 2.8, rot) + ax.transData
        ax.add_patch(mp.FancyBboxPatch((px, py), 4, 5.6, boxstyle="round,pad=0,rounding_size=0.12", facecolor="#1b221f",
                                       edgecolor=TEAL, lw=1.2, transform=tr))
        for li in range(13):
            ln = rng.uniform(1.8, 3.4)
            yl = py + 5.1 - li * 0.37
            lit = rng.random() < 0.12
            ax.add_patch(mp.Rectangle((px + 0.3, yl), ln, 0.13, facecolor=AMBER if lit else PAPER,
                                      alpha=0.85 if lit else 0.16, transform=tr, lw=0))
            if lit:
                hl.append(tr.transform((px + 0.3 + ln, yl + 0.06)))
    for i in range(3):
        cx, cy = 16.4, 5.4 - i * 1.9
        ax.add_patch(mp.FancyBboxPatch((cx, cy), 4.4, 1.5, boxstyle="round,pad=0,rounding_size=0.15", facecolor="#18241f",
                                       edgecolor=MINT, lw=1.4))
        ax.add_patch(mp.Rectangle((cx + 0.3, cy + 1.0), 2.6, 0.16, facecolor=MINT, alpha=0.9, lw=0))
        ax.add_patch(mp.Rectangle((cx + 0.3, cy + 0.6), 3.6, 0.11, facecolor=PAPER, alpha=0.25, lw=0))
        ax.add_patch(mp.Rectangle((cx + 0.3, cy + 0.3), 3.0, 0.11, facecolor=AMBER, alpha=0.6, lw=0))
    inv = ax.transData.inverted()
    for k, p in enumerate(hl[:6]):
        x0, y0 = inv.transform(p)
        cx, cy = 16.4, 5.4 - (k % 3) * 1.9 + 0.36
        xs = np.linspace(x0, cx, 50)
        ys = y0 + (cy - y0) * (3 * ((xs - x0) / (cx - x0)) ** 2 - 2 * ((xs - x0) / (cx - x0)) ** 3)
        ax.plot(xs, ys, color=AMBER, alpha=0.45, lw=1.1)
    ax.set_xlim(0.8, 0.8 + 21.5)
    ax.set_ylim(0.2, 0.2 + 21.5 / 1.6)
    finish(fig, "paperforge")


def pps_sim(size=120, density=0.12, steps=3000, seed=4, r=5.0, v=0.67, alpha=180.0, beta=17.0):
    """Primordial Particle System (Schmickl et al. 2016), periodic world, paper parameters."""
    from scipy.spatial import cKDTree

    rng = np.random.default_rng(seed)
    n = int(size * size * density)
    p = rng.uniform(0, size, (n, 2))
    phi = rng.uniform(0, 2 * np.pi, n)
    a, b = np.deg2rad(alpha), np.deg2rad(beta)
    for _ in range(steps):
        tree = cKDTree(p, boxsize=size)
        pairs = tree.query_pairs(r, output_type="ndarray")
        i, j = pairs[:, 0], pairs[:, 1]
        d = p[j] - p[i]
        d -= size * np.round(d / size)
        hx, hy = np.cos(phi), np.sin(phi)
        cross_ij = hx[i] * d[:, 1] - hy[i] * d[:, 0]      # >0: j is left of i
        cross_ji = hx[j] * (-d[:, 1]) - hy[j] * (-d[:, 0])
        left = np.bincount(i, cross_ij > 0, n) + np.bincount(j, cross_ji > 0, n)
        right = np.bincount(i, cross_ij < 0, n) + np.bincount(j, cross_ji < 0, n)
        nn = left + right
        phi = phi - (a + b * nn * np.sign(right - left))   # turn right (clockwise)
        p = (p + v * np.column_stack([np.cos(phi), np.sin(phi)])) % size
    tree = cKDTree(p, boxsize=size)
    n_r = np.array([len(x) - 1 for x in tree.query_ball_point(p, r)])
    n_close = np.array([len(x) - 1 for x in tree.query_ball_point(p, 1.3)])
    return p, n_r, n_close


def cover_primordial_particle_system():
    fig, ax = canvas()
    size = 120
    p, n_r, n_close = pps_sim(size=size, density=0.12, steps=3000, seed=4)
    from scipy.ndimage import gaussian_filter

    hist2, _, _ = np.histogram2d(p[:, 0], p[:, 1], bins=size, range=[[0, size], [0, size]])
    dens = gaussian_filter(hist2 * (n_r[None, None] > 0).any(), 8, mode="wrap")
    cx, cy = np.unravel_index(np.argmax(dens), dens.shape)
    p = (p - [cx, cy] + size / 2) % size
    col = np.where(n_close > 15, CORAL, np.where(n_r > 35, AMBER, np.where(n_r > 15, SKY, np.where(n_r >= 13, VIOLET, MINT))))
    for s, a in ((420, 0.05), (110, 0.12)):
        ax.scatter(p[:, 0], p[:, 1], s=s, c=col, alpha=a, lw=0)
    ax.scatter(p[:, 0], p[:, 1], s=30, c=col, alpha=0.95, lw=0)
    ax.set_xlim(size / 2 - 34, size / 2 + 34)
    ax.set_ylim(size / 2 - 21.25, size / 2 + 21.25)
    finish(fig, "primordial-particle-system")


def cover_oscillator_networks():
    """50 active rotators, b_i in [1.7, 2.3], all-to-all eps = 0.6 (the repository's locking example)."""
    fig, ax = canvas()
    n = 50
    rng = np.random.default_rng(0)
    b = np.linspace(1.7, 2.3, n)
    eps = 0.6 / n
    th0 = rng.uniform(0, 2 * np.pi, n)
    s0 = np.concatenate([np.cos(th0), np.sin(th0)])

    def f(s):
        x, y = s[:n], s[n:]
        r2 = x * x + y * y
        dx = x * (1 - r2) + y * (x - b) + eps * (x.sum() - n * x)
        dy = y * (1 - r2) - x * (x - b) + eps * (y.sum() - n * y)
        return np.concatenate([dx, dy])

    tr = rk4(f, s0, 0.01, 4200, every=6)
    xs = tr[:, :n].T
    ax.imshow(xs, aspect="auto", cmap=cmap(SKY, "#16324a", BG, "#4a3216", AMBER), vmin=-1, vmax=1,
              interpolation="bilinear", extent=(0, 1, 0, 1))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    finish(fig, "oscillator-networks")


def cover_neat():
    fig, ax = canvas()
    rng = np.random.default_rng(11)
    inputs = [(1.5, y) for y in np.linspace(1.2, 8.8, 7)]
    outputs = [(14.5, y) for y in (3.4, 5.0, 6.6)]
    hidden = [(rng.uniform(5, 11), rng.uniform(1.5, 8.5)) for _ in range(9)]
    nodes = inputs + hidden + outputs
    edges = []
    for i, h in enumerate(hidden):
        for k in rng.choice(len(inputs), 2, replace=False):
            edges.append((inputs[k], h))
        edges.append((h, outputs[rng.integers(3)]))
        if i and rng.random() < 0.5:
            edges.append((hidden[rng.integers(i)], h))
    for k in rng.choice(len(inputs), 4, replace=False):
        edges.append((inputs[k], outputs[rng.integers(3)]))
    for (x0, y0), (x1, y1) in edges:
        wgt = rng.normal()
        col = SKY if wgt > 0 else CORAL
        xs = np.linspace(x0, x1, 60)
        ys = y0 + (y1 - y0) * (3 * ((xs - x0) / (x1 - x0)) ** 2 - 2 * ((xs - x0) / (x1 - x0)) ** 3)
        glow_line(ax, xs, ys, col, lw=0.6 + 1.6 * min(abs(wgt), 1.6), alpha=0.75)
    for (x, y), c in zip(nodes, [MINT] * 7 + [AMBER] * 9 + [PAPER] * 3):
        ax.scatter(x, y, s=650, color=c, alpha=0.12)
        ax.scatter(x, y, s=230, color=BG, edgecolors=c, linewidths=2.4, zorder=5)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    finish(fig, "neat")


def cover_multiplexed_networks():
    import matplotlib.patches as mp

    fig, ax = canvas()
    rng = np.random.default_rng(6)
    # control network (left), its output gates the main weight matrix (right)
    lay = [np.linspace(2.5, 7.5, 5), np.linspace(3.5, 6.5, 3)]
    for (xa, ya), (xb, yb) in [((1.5, a), (4.5, b)) for a in lay[0] for b in lay[1]]:
        ax.plot([xa, xb], [ya, yb], color=TEAL, alpha=0.6, lw=1)
    for x, ys in ((1.5, lay[0]), (4.5, lay[1])):
        for y in ys:
            ax.scatter(x, y, s=200, color=BG, edgecolors=MINT, linewidths=2.2, zorder=5)
    for y in lay[1]:
        xs = np.linspace(4.6, 8.0, 40)
        glow_line(ax, xs, y + (5 - y) * ((xs - 4.6) / 3.4) ** 2, AMBER, lw=1.4, alpha=0.8)
    m = rng.normal(size=(8, 8))
    for r in range(8):
        for c in range(8):
            v = np.tanh(m[r, c])
            ax.add_patch(mp.FancyBboxPatch((8.4 + c * 0.75, 2.0 + r * 0.75), 0.64, 0.64,
                                           boxstyle="round,pad=0,rounding_size=0.1", lw=0,
                                           facecolor=AMBER if v > 0 else SKY, alpha=0.15 + 0.75 * abs(v)))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    finish(fig, "multiplexed-networks")


def fractal_noise(h, w, beta=3.1, seed=0):
    rng = np.random.default_rng(seed)
    ky = np.fft.fftfreq(h)[:, None]
    kx = np.fft.fftfreq(w)[None, :]
    k = np.sqrt(kx**2 + ky**2)
    k[0, 0] = 1
    spec = (rng.normal(size=(h, w)) + 1j * rng.normal(size=(h, w))) / k ** (beta / 2)
    spec[0, 0] = 0
    z = np.real(np.fft.ifft2(spec))
    return (z - z.mean()) / z.std()


def cover_world_generation():
    """Fractal-noise continent with a radial falloff, biomes from height + moisture, hillshade."""
    fig, ax = canvas()
    h, w = 500, 800
    z = fractal_noise(h, w, 3.2, seed=42)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.hypot((xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2))
    z = z * 0.55 + 1.25 - 1.9 * d**2
    moist = fractal_noise(h, w, 2.6, seed=7)
    rgb = np.zeros((h, w, 3))

    def hexrgb(c):
        return np.array([int(c[i:i + 2], 16) for i in (1, 3, 5)]) / 255

    deep, shallow = hexrgb("#0e2433"), hexrgb("#1d4b5c")
    sea = z < 0
    t = np.clip(-z / 1.2, 0, 1)[..., None]
    rgb[sea] = (shallow * (1 - t) + deep * t)[sea]
    land = ~sea
    sand, grass, forest, dry, rock, snow = map(hexrgb, ["#c9b98a", "#7fa46a", "#3e6b4b", "#b59a62", "#7d7a70", "#eef1ea"])
    zz = z
    col = np.where((zz < 0.08)[..., None], sand,
           np.where((zz < 1.15)[..., None], np.where((moist > 0.3)[..., None], forest, np.where((moist < -0.6)[..., None], dry, grass)),
           np.where((zz < 1.75)[..., None], rock, snow)))
    rgb[land] = col[land]
    gy, gx = np.gradient(z)
    shade = np.clip(1 + 2.2 * (gx * -0.7 + gy * -0.7), 0.55, 1.35)[..., None]
    rgb[land] = np.clip(rgb * shade, 0, 1)[land]
    ax.imshow(rgb, extent=(0, w, 0, h), interpolation="bilinear")
    ax.contour(np.flipud(z), levels=[0], colors=[PAPER], linewidths=0.8, alpha=0.5, extent=(0, w, 0, h))
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    finish(fig, "world-generation")


COVERS = {name[len("cover_"):].replace("_", "-"): fn for name, fn in globals().items() if name.startswith("cover_")
          and name != "cover_from_gif"}


def step_covers(only: str | None) -> None:
    for slug, fn in COVERS.items():
        if only and only != slug:
            continue
        fn()


# --------------------------------------------------------------------------------------------
def step_power(run_id: str | None) -> None:
    """Snapshot of the latest successful PowerForecastMLOps run: last 14 days of demand, the
    out-of-sample latest-24h predictions and the next-24h forecast with conformal intervals."""
    dest = CACHE / "power"
    if dest.exists():
        shutil.rmtree(dest)
    repo = "fekoester/PowerForecastMLOps"
    if not run_id:
        runs = json.loads(subprocess.run(["gh", "run", "list", "-R", repo, "--limit", "10", "--json",
                                          "databaseId,conclusion,createdAt"], capture_output=True, check=True,
                                         text=True).stdout)
        run_id = str(next(r["databaseId"] for r in runs if r["conclusion"] == "success"))
    subprocess.run(["gh", "run", "download", run_id, "-R", repo, "-n", "raw-data", "-n", "predictions", "-D", str(dest)],
                   check=True)

    def rows(p):
        with open(p) as f:
            return list(csv.DictReader(f))

    demand = rows(next(dest.rglob("eia_demand.csv")))
    latest = rows(next(dest.rglob("latest_predictions.csv")))
    future = rows(next(dest.rglob("future_24h_forecast.csv")))
    ts = lambda s: s.replace(" ", "T").replace("+00:00", "Z")
    snap = {
        "run": run_id,
        "region": "CAISO",
        "history": [{"t": ts(r["timestamp_utc"]), "y": float(r["demand_mwh"])} for r in demand[-24 * 14:]],
        "latest": [{"t": ts(r["timestamp_utc"]), "y": float(r["prediction_mwh"]),
                    "lo80": float(r["prediction_mwh_lower_80"]), "hi80": float(r["prediction_mwh_upper_80"]),
                    "lo95": float(r["prediction_mwh_lower_95"]), "hi95": float(r["prediction_mwh_upper_95"]),
                    "actual": float(r["demand_mwh"])} for r in latest],
        "forecast": [{"t": ts(r["timestamp_utc"]), "y": float(r["forecast_mwh_best"]),
                      "lo80": float(r["forecast_mwh_best_lower_80"]), "hi80": float(r["forecast_mwh_best_upper_80"]),
                      "lo95": float(r["forecast_mwh_best_lower_95"]), "hi95": float(r["forecast_mwh_best_upper_95"])}
                     for r in future],
    }
    out = SITE / "src" / "data" / "power-snapshot.json"
    out.write_text(json.dumps(snap, separators=(",", ":")) + "\n")
    print("  power snapshot", run_id, len(snap["history"]), "h history")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("step", choices=["figures", "videos", "covers", "power", "all"])
    ap.add_argument("--only", help="limit to one project slug")
    ap.add_argument("--run", help="PowerForecastMLOps run id for the power snapshot (default: latest success)")
    a = ap.parse_args()
    if a.step in ("power", "all"):
        step_power(a.run)
    if a.step in ("figures", "all"):
        step_figures(a.only)
    if a.step in ("videos", "all"):
        step_videos(a.only)
    if a.step in ("covers", "all"):
        step_covers(a.only)


if __name__ == "__main__":
    sys.exit(main())
