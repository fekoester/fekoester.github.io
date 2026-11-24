// Media, key facts, figures and live demos per project (merged into projects.ts by slug).
//
// - Covers live at public/media/<slug>/cover.webp (+ cover-640.webp) and are rendered by
//   tools/media/make_media.py from each project's own equations or data.
// - Figures and video loops are the projects' own published figures, fetched from the public
//   repositories by the same script. Captions follow the repositories' READMEs.
// - Facts: only numbers that are published in the paper or the repository README.

export type DemoKey =
  | 'exposure'
  | 'reservoir-text'
  | 'lorenz-esn'
  | 'memory'
  | 'wave-sensing'
  | 'causal-mask'
  | 'sync'
  | 'fhn'
  | 'rocblas'
  | 'power'
  | 'pps'
  | 'oscillators'
  | 'terrain'
  | 'evidence';

export type Media = {
  src: string; // .webp image, or the poster frame of a video
  video?: string; // .mp4 loop
  alt: string;
  caption?: string;
  source?: { label: string; href: string };
  pixel?: boolean; // crisp upscaling for pixel art
  narrow?: boolean; // tall or small figure: do not stretch to full width
  dark?: boolean; // already has a dark background (no paper frame)
};

export type Fact = { value: string; label: string };

export type Showcase = {
  coverVideo?: string; // plays on hover in the project grid
  coverAlt: string;
  hero?: Media; // replaces the cover at the top of the project page
  facts?: Fact[];
  factsNote?: string;
  demo?: DemoKey;
  figures?: Media[];
};

const repo = (name: string, label = 'Repository') => ({ label, href: `https://github.com/fekoester/${name}` });
const m = (slug: string, file: string) => `/media/${slug}/${file}`;

export const showcase: Record<string, Showcase> = {
  'llm-training-dynamics': {
    coverAlt: 'Heavy-ball trajectories descending a curved loss valley, drawn over its contour lines.',
    facts: [
      { value: '0.5 nats', label: 'loss drop per e-fold of exposures to a pattern (TinyStories)' },
      { value: '1.36×', label: 'data-equivalent gain of Muon over AdamW at 2.6M parameters' },
      { value: '≤ 0.05', label: 'nats residual: LR, β₂, width and depth only change the speed' },
      { value: '344k–27M', label: 'parameters measured so far; larger runs in progress' },
    ],
    demo: 'exposure',
  },
  'reservoir-language-model': {
    coverAlt: 'Activations of a reservoir driven by Hamlet’s soliloquy, one column per character.',
    facts: [
      { value: '2.089', label: 'bits/char, multi-timescale LAERC (200k params, Tiny Shakespeare, BPE-1024)' },
      { value: '2.135', label: 'bits/char for a GPT of the same width and depth' },
      { value: '0', label: 'gradients propagated through the reservoir' },
    ],
    factsNote: 'Numbers from the LAERC repository. At 4.8M parameters on OpenWebText the GPT is clearly better (see figures).',
    demo: 'reservoir-text',
    figures: [
      {
        src: m('reservoir-language-model', 'bpc-vs-params.webp'),
        alt: 'Test bits per character against trainable parameters for the classic reservoir, the attention-enhanced reservoir and a transformer.',
        caption: 'Shakespeare_Res quick benchmark (2,000 steps, 256 windows of 32 characters): test bits per character against trainable parameters. The attention-enhanced reservoir is below the best-learning-rate transformer at every size of this run.',
        source: repo('Shakespeare_Res', 'Shakespeare_Res'),
      },
      {
        src: m('reservoir-language-model', 'laerc-bpe1024.webp'),
        alt: 'Validation curves of LAERC variants and a GPT on Tiny Shakespeare with a 1,024-token BPE.',
        caption: 'LAERC on Tiny Shakespeare with a 1,024-token BPE: the multi-timescale reservoir (2.089 bpc) ends ahead of the single-ρ reservoir (2.143) and the GPT of the same width and depth (2.135).',
        source: repo('LAERC', 'LAERC'),
      },
      {
        src: m('reservoir-language-model', 'radius-sweep.webp'),
        alt: 'Test bits per character against the spectral radius of the reservoir.',
        caption: 'Spectral-radius sweep of the attention-enhanced reservoir (R = 150, H = 25): best just above 1, at the edge of stability.',
        source: repo('Shakespeare_Res', 'Shakespeare_Res'),
        narrow: true,
      },
      {
        src: m('reservoir-language-model', 'laerc-owt.webp'),
        alt: 'OpenWebText validation curves of LAERC and a GPT.',
        caption: 'The honest counterpoint: at 4.8M non-embedding parameters on OpenWebText, the GPT reaches 4.57 nats/token against 4.99 for LAERC.',
        source: repo('LAERC', 'LAERC'),
        narrow: true,
      },
    ],
  },
  'attention-enhanced-reservoir': {
    coverAlt: 'The Lorenz attractor, coloured along time.',
    facts: [
      { value: '4.7×', label: 'lower one-step error on Lorenz-63 with 25 nodes (NRMSE 0.056 → 0.012)' },
      { value: '3.3×', label: 'longer valid prediction time (0.47 → 1.53 Lyapunov times)' },
      { value: '5', label: 'chaotic systems reproduced by one trained model (preprint)' },
    ],
    factsNote: 'Small reservoirs gain most. With 200 nodes the ridge readout catches up and wins (AERes benchmark).',
    demo: 'lorenz-esn',
    figures: [
      {
        src: m('attention-enhanced-reservoir', 'benchmark.webp'),
        alt: 'One-step NRMSE and valid prediction time against reservoir size for ridge, attention and node-trajectory-attention readouts on Lorenz-63 and Rössler.',
        caption: 'AERes benchmark on Lorenz-63 and Rössler (3 seeds): one-step error (top) and valid prediction time (bottom) against reservoir size. Attention wins clearly at 25–50 nodes; at 200 nodes ridge wins.',
        source: repo('AERes', 'AERes'),
        narrow: true,
      },
    ],
  },
  'master-memory-function': {
    coverAlt: 'Memory functions of linear reservoirs with increasing spectral radius, stacked as ridgelines.',
    facts: [
      { value: '1', label: 'universal function for the linear memory of a whole class of delay reservoirs' },
      { value: '43.2 / 50', label: 'total information processing capacity of a 50-node tanh ESN (MC_calc example)' },
      { value: 'IEEE TNNLS', label: 'published 2022' },
    ],
    demo: 'memory',
    figures: [
      {
        src: m('master-memory-function', 'delay-scan.webp'),
        alt: 'Total memory capacity against the delay, master memory function against simulations.',
        caption: 'Total linear memory capacity against the delay τ for N = 50 virtual nodes. Line: the master memory function. Dots: direct simulations of the linear map. Capacity drops where τ approaches a multiple of the clock cycle Nθ.',
        source: repo('MMF', 'MMF'),
      },
      {
        src: m('master-memory-function', 'esn-capacity.webp'),
        alt: 'Capacity by polynomial degree and the linear memory function of a 50-node ESN.',
        caption: 'MC_calc on a 50-node tanh ESN with bias: capacity by degree (left) and the linear memory function (right). Without a bias, the reservoir is odd and has no even-degree capacity, a useful sanity check.',
        source: repo('MC_calc', 'MC_calc'),
      },
    ],
  },
  'adaptive-sensing': {
    coverVideo: m('adaptive-sensing', 'adaptive-queries.mp4'),
    coverAlt: 'A wave field driven by a chaotic signal, with a grid of fixed sensors and clusters of moving query points.',
    facts: [
      { value: '0.013', label: 'one-step MSE on the Hénon map with adaptive sensing' },
      { value: '0.42', label: 'for a linear readout of the same field' },
      { value: '8', label: 'chaotic systems and maps compared' },
    ],
    demo: 'wave-sensing',
    figures: [
      {
        src: m('adaptive-sensing', 'adaptive-queries.webp'),
        video: m('adaptive-sensing', 'adaptive-queries.mp4'),
        alt: 'Animation of a diffusion reservoir with fixed sensors and moving adaptive query points.',
        caption: 'A diffusion reservoir driven by the Mackey–Glass series on the held-out test segment. White dots are the fixed sensors; coloured dots are the adaptive readout’s query positions, coloured by their output weight.',
        source: repo('ASAERC', 'ASAERC'),
      },
      {
        src: m('adaptive-sensing', 'comparison.webp'),
        alt: 'Bar chart of one-step test errors of linear, static-attention and adaptive readouts on eight systems.',
        caption: 'One-step test error (standardised, log scale) of the linear, static-attention and adaptive-sensing readouts on eight systems, mean ± std over seeds. On the maps, attention readouts clearly win.',
        source: repo('ASAERC', 'ASAERC'),
      },
    ],
  },
  echomario: {
    coverVideo: m('echomario', 'reservoir-gaps.mp4'),
    coverAlt: 'A frame of EchoMario’s procedural platformer: ground, platforms, coins and the player.',
    hero: {
      src: m('echomario', 'reservoir-gaps.webp'),
      video: m('echomario', 'reservoir-gaps.mp4'),
      alt: 'A reservoir-controlled player finishing an unseen level with gaps.',
      pixel: true,
    },
    facts: [
      { value: '55 %', label: 'unseen gaps levels finished by a frozen 3000-neuron reservoir + ridge readout' },
      { value: '40 %', label: 'for the best constant action (“bunny hop”)' },
      { value: '0 %', label: 'for a linear readout of the current frame' },
    ],
    factsNote: 'One stage of the toy platformer, imitation learning (DAgger). On harder stages and with PPO the reservoir does not beat simple baselines yet.',
    figures: [
      {
        src: m('echomario', 'reservoir-gaps.webp'),
        video: m('echomario', 'reservoir-gaps.mp4'),
        alt: 'Reservoir student finishing an unseen gaps level.',
        caption: 'A frozen 3000-neuron reservoir (local receptive fields, multi-timescale leaks) with a ridge-regression readout finishing an unseen level from the gaps stage. Only the linear readout was trained, without any reward signal.',
        source: repo('EchoMario', 'EchoMario'),
        pixel: true,
      },
      {
        src: m('echomario', 'teacher.webp'),
        video: m('echomario', 'teacher.mp4'),
        alt: 'The planning teacher on a full-difficulty level.',
        caption: 'The speedrunner teacher on an unseen full-difficulty level: it finishes, stomps 9 enemies and collects 26 coins. The student copies the running and jumping, not the rest.',
        source: repo('EchoMario', 'EchoMario'),
        pixel: true,
      },
      {
        src: m('echomario', 'dagger.webp'),
        alt: 'Fraction of test levels finished and mean progress against DAgger iteration.',
        caption: 'DAgger rounds: fraction of unseen test levels finished (left) and mean progress (right) for reservoir and frame students on each stage.',
        source: repo('EchoMario', 'EchoMario'),
      },
    ],
  },
  'causal-convolution-transformer': {
    coverAlt: 'A causal attention mask with a bright band along the diagonal for the causal convolution.',
    demo: 'causal-mask',
    figures: [
      {
        src: m('causal-convolution-transformer', 'loss.webp'),
        alt: 'Training loss against step on a log axis.',
        caption: 'An earlier GPT-2-scale CCT on OpenWebText, validation loss ≈ 2.9 after 5 epochs. Its exact configuration was not recorded; the repository’s ablation is the like-for-like test.',
        source: repo('Causal-Convolution-Transformer-CCT', 'CCT'),
        narrow: true,
      },
    ],
  },
  'ctm-cifar': {
    coverAlt: 'Neuron traces locking into three synchronised groups, next to their block-structured synchronisation matrix.',
    facts: [
      { value: '10 → 35 %', label: 'tick-1 accuracy after fixing the tick-0 synchronisation order (CIFAR-10, small CPU runs)' },
      { value: '≈ 80 %', label: 'flat per-tick accuracy with stochastic tick training (full-size runs)' },
    ],
    factsNote: 'The full-size runs predate the tick-0 fix; the fix was checked on short CPU runs with one seed.',
    demo: 'sync',
    figures: [
      {
        src: m('ctm-cifar', 'tick0-fix.webp'),
        alt: 'Per-tick accuracy and certainty-based halting, legacy versus fixed ordering.',
        caption: 'Check of the tick-0 fix (CIFAR-10, 279k-parameter CTM, 6 short epochs): accuracy per tick (left) and certainty-based halting (right). Tick 1 goes from chance to 35%; both models fall apart beyond the training horizon.',
        source: repo('ctm-cifar-bench', 'ctm-cifar-bench'),
      },
      {
        src: m('ctm-cifar', 'per-tick.webp'),
        alt: 'End-of-run accuracy per tick for minmax, monotone and stochastic tick losses.',
        caption: 'End-of-run per-tick accuracy for three tick losses. Stochastic training is best and stable across ticks; monotone peaks mid-way, minmax is unstable. These full-size runs predate the tick-0 fix.',
        source: repo('ctm-cifar-bench', 'ctm-cifar-bench'),
        narrow: true,
      },
    ],
  },
  'fhn-mnist': {
    coverAlt: 'FitzHugh–Nagumo phase plane: nullclines, the flow field and trajectories converging onto the limit cycle.',
    facts: [
      { value: '95.0 %', label: 'MNIST without backprop (three-factor teacher plasticity)' },
      { value: '+4.1', label: 'points from plasticity in the hidden and recurrent layers' },
      { value: '96.2 %', label: 'the same network trained end to end by BPTT' },
    ],
    factsNote: 'Short CPU runs, one seed. On these budgets a plain MLP (97.75 %) is still the best model.',
    demo: 'fhn',
  },
  'gfx1010-rocblas': {
    coverAlt: 'A tiled matrix multiplication: one tile of the output and the row and column blocks it needs.',
    facts: [
      { value: '7.2–7.9', label: 'TFLOPS fp32 on transformer shapes (stock: 4.7–6.3; peak ≈ 7.95)' },
      { value: '+70 %', label: 'training tokens/s for a 4.3M-parameter GPT, fp32' },
      { value: '580 → 61 s', label: 'one epoch of a character-level transformer' },
    ],
    demo: 'rocblas',
  },
  'power-forecast-mlops': {
    coverAlt: 'Six days of real California electricity demand followed by a 24-hour forecast with prediction intervals.',
    facts: [
      { value: '1,282', label: 'MWh walk-forward MAE, LightGBM 90-day window (v0.2)' },
      { value: '−25 %', label: 'error against the best fair baseline (same hour yesterday, 1,705)' },
      { value: 'Daily', label: 'retrained, monitored and redeployed by GitHub Actions' },
    ],
    factsNote: 'CI configuration, run of 2026-11-11. The numbers move as live data arrives.',
    demo: 'power',
  },
  paperforge: {
    coverAlt: 'Document pages with highlighted lines, connected to structured knowledge cards.',
    demo: 'evidence',
  },
  'primordial-particle-system': {
    coverVideo: m('primordial-particle-system', 'pps.mp4'),
    coverAlt: 'Particles of the Primordial Particle System clustering into cell-like rings.',
    facts: [
      { value: '1', label: 'motion law, two parameters (α = 180°, β = 17°)' },
      { value: '2.3M', label: 'particle-steps per second on one CPU core' },
    ],
    demo: 'pps',
    figures: [
      {
        src: m('primordial-particle-system', 'pps.webp'),
        video: m('primordial-particle-system', 'pps.mp4'),
        alt: 'Animation: particles settle into a lattice while dense structures nucleate, grow and form rings.',
        caption: '120 × 120 world, density 0.08, paper parameters, 3,000 steps. Green particles start out spread randomly and settle into a lattice; dense blue structures nucleate, grow and form rings.',
        source: repo('PPS', 'PPS'),
        dark: true,
        narrow: true,
      },
    ],
  },
  'oscillator-networks': {
    coverAlt: 'Space-time raster of 50 oscillators: incoherent at first, then locked to a common frequency.',
    facts: [
      { value: '50', label: 'oscillators lock to a common frequency at ε = 0.6 (all-to-all)' },
      { value: 'R ≈ 0.3', label: 'order parameter of incoherent SNIPER networks, not 0' },
    ],
    demo: 'oscillators',
    figures: [
      {
        src: m('oscillator-networks', 'locking.webp'),
        alt: 'Order parameter over time and space-time plot of x_i(t) for 50 oscillators.',
        caption: '50 oscillators with b_i ∈ [1.7, 2.3], all-to-all coupling ε = 0.6. After a short transient they lock to a common frequency. Top: order parameter. Bottom: x_i(t).',
        source: repo('Oscillator-Network-Simulation', 'Repository'),
      },
      {
        src: m('oscillator-networks', 'sweep.webp'),
        alt: 'Order parameter and frequency spread against coupling strength for three topologies.',
        caption: 'Coupling sweep for all-to-all, random and ring topologies: mean order parameter (left) and spread of mean frequencies (right).',
        source: repo('Oscillator-Network-Simulation', 'Repository'),
      },
    ],
  },
  neat: {
    coverVideo: m('neat', 'dodge.mp4'),
    coverAlt: 'An evolved NEAT network: inputs, a few hidden nodes and outputs with positive and negative connections.',
    hero: {
      src: m('neat', 'dodge.webp'),
      video: m('neat', 'dodge.mp4'),
      alt: 'An evolved network playing the dodge game.',
      pixel: true,
    },
    facts: [
      { value: '100 / 100', label: 'XOR and double-pole balancing runs solved' },
      { value: '5.5 s', label: 'for all 100 XOR runs' },
      { value: '20.8 s', label: 'mean survival of the dodge champion in 50 unseen games' },
    ],
    figures: [
      {
        src: m('neat', 'dodge.webp'),
        video: m('neat', 'dodge.mp4'),
        alt: 'Evolved network playing the dodge game.',
        caption: 'An evolved network in a typical (median) unseen game of dodge, 19.7 s. It switches rows to avoid the projectiles, which spawn faster and faster.',
        source: repo('NEAT-Implementation', 'Repository'),
        pixel: true,
      },
      {
        src: m('neat', 'dodge-training.webp'),
        alt: 'Survival time, species and hidden nodes over 300 generations.',
        caption: 'Dodge training: survival time, number of species (the threshold adapts towards 8) and network growth.',
        source: repo('NEAT-Implementation', 'Repository'),
      },
      {
        src: m('neat', 'xor-champion.webp'),
        alt: 'Evolved XOR network graph.',
        caption: 'An evolved XOR network. Blue connections are positive, red negative, width shows |weight|.',
        source: repo('NEAT-Implementation', 'Repository'),
        narrow: true,
      },
      {
        src: m('neat', 'double-pole-champion.webp'),
        alt: 'Evolved double-pole controller without hidden nodes.',
        caption: 'The double-pole controller needed no hidden node at all: the minimal solution NEAT’s “start small” principle is designed to find.',
        source: repo('NEAT-Implementation', 'Repository'),
        narrow: true,
      },
      {
        src: m('neat', 'viewer.webp'),
        alt: 'SFML viewer showing the game and the network.',
        caption: 'The SFML viewer: the game and the network that plays it.',
        source: repo('NEAT-Implementation', 'Repository'),
      },
    ],
  },
  'multiplexed-networks': {
    coverAlt: 'A small control network whose outputs set the weights of a main network’s matrix.',
    facts: [
      { value: '95.75 %', label: 'context-gated task, multiplexed net with 1,156 parameters' },
      { value: '90.82 %', label: 'best MLP, with 9× the parameters (10,492)' },
      { value: '95.95 %', label: 'UCI letters, vs 95.69 % for the best same-size MLP' },
    ],
    figures: [
      {
        src: m('multiplexed-networks', 'curves.webp'),
        alt: 'Test accuracy per epoch for MLPs and multiplexed networks on two tasks.',
        caption: 'Test accuracy per epoch on the context-gated task (left) and UCI letter recognition (right), three seeds each.',
        source: repo('Multiplexed-Neural-Networks', 'Repository'),
      },
    ],
  },
  'world-generation': {
    coverVideo: m('world-generation', 'world-sim.mp4'),
    coverAlt: 'A procedurally generated island with seas, beaches, forests, mountains and snow.',
    facts: [
      { value: '1.30–1.42×', label: 'more food delivered by ants that follow pheromone (5 seeds)' },
      { value: '1,059', label: 'creatures after 150k steps with fast food regrowth (default: 101)' },
      { value: '27', label: 'generations of evolved brains in that run' },
    ],
    demo: 'terrain',
    figures: [
      {
        src: m('world-generation', 'pwg-world-42.webp'),
        alt: 'Generated world map with towns of several civilisations.',
        caption: 'PWG, seed 42 after 25 years of history. Squares are towns, coloured by civilisation.',
        source: repo('PWG', 'PWG'),
      },
      {
        src: m('world-generation', 'pwg-layers.webp'),
        alt: 'Height, temperature and moisture layers.',
        caption: 'The layers behind the map: height, temperature and moisture (seed 42).',
        source: repo('PWG', 'PWG'),
      },
      {
        src: m('world-generation', 'world-sim.webp'),
        video: m('world-generation', 'world-sim.mp4'),
        alt: 'Animated island with organisms moving and food regrowing.',
        caption: 'World-Simulation, seed 2, evolving preset, 12,000 steps. Brightness is food; dots are organisms with a heading tick.',
        source: repo('World-Simulation', 'World-Simulation'),
        pixel: true,
        narrow: true,
        dark: true,
      },
      {
        src: m('world-generation', 'evolution.webp'),
        alt: 'Population, births, generation and body statistics over 150,000 steps.',
        caption: 'Two 150,000-step runs. With 10× faster food regrowth the population grows past 1,000 and evolution runs to generation 27; with the default parameters it sits at the floor of 100, kept alive by respawns.',
        source: repo('World-Simulation', 'World-Simulation'),
      },
      {
        src: m('world-generation', 'ants.webp'),
        video: m('world-generation', 'ants.mp4'),
        alt: 'Ant colony foraging with pheromone trails.',
        caption: 'Ant-Simulation, seed 4, 4,000 steps. Purple is pheromone (log scale), red is food, black is the nest. Searching ants are white, ants heading to food yellow, ants carrying food orange.',
        source: repo('Ant-Simulation', 'Ant-Simulation'),
        pixel: true,
        narrow: true,
        dark: true,
      },
      {
        src: m('world-generation', 'foraging.webp'),
        alt: 'Food delivered and colony size over time, with and without pheromone following.',
        caption: 'Do the trails help? The same colonies with pheromone following on and off, mean of five seeds: 1.30–1.42× more food with trails.',
        source: repo('Ant-Simulation', 'Ant-Simulation'),
      },
    ],
  },
};
