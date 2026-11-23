export type Category = 'Research' | 'Software' | 'Experiment' | 'Simulation';

export type Equation = { tex: string; caption?: string };

export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  category: Category;
  year: string;
  summary: string;
  description: string[];
  equations?: Equation[];
  tags: string[];
  status: 'Live' | 'Active' | 'Published' | 'Research in progress' | 'Done';
  featured?: boolean;
  links?: { label: string; href: string }[];
  highlights?: string[];
  caveats?: string[];
};

const gh = (repo: string) => ({ label: 'GitHub', href: `https://github.com/fekoester/${repo}` });

export const projects: Project[] = [
  {
    slug: 'reservoir-language-model',
    title: 'Reservoir Computing as a Language Model',
    eyebrow: 'Efficient language models',
    category: 'Research',
    year: '2025–2026',
    summary:
      'Can a fixed, untrained dynamical system do autoregressive language modelling? A reservoir with a trainable readout, and an attention-enhanced variant, compared against transformer baselines.',
    description: [
      'A reservoir computer is a fixed high-dimensional dynamical system driven by the input; only a readout is trained. That makes training cheap and inference a single recurrent step per token, and it is the natural thing to build in physical (photonic, electronic) hardware.',
      'The paper compares a classic reservoir with a static linear readout against an attention-enhanced reservoir, where the readout weights become a function of the current state. No gradients are propagated through the reservoir; learning happens only in the surrounding trainable components. Both are benchmarked against transformer baselines on character-level language modelling, looking at quality versus trainable parameters and inference cost.',
      'Shakespeare_Res is the reproducible code base (exact reservoir scaling, multi-timescale reservoirs, ridge readouts, bits-per-character benchmarks). LAERC scales the idea to a layered model on OpenWebText with GPT-2 tokenisation.',
    ],
    equations: [
      {
        tex: String.raw`\mathbf{r}_{t+1} = (1-\alpha)\,\mathbf{r}_t + \alpha \tanh\!\big(W\mathbf{r}_t + W_{\text{in}}\,\mathbf{e}(x_t) + \mathbf{b}\big)`,
        caption: 'Leaky echo-state reservoir driven by token embeddings; W, W_in fixed and random.',
      },
      {
        tex: String.raw`p(x_{t+1}\mid x_{\le t}) = \operatorname{softmax}\!\big(W_{\text{out}}\,\mathbf{r}_{t+1}\big)`,
        caption: 'Classic reservoir LM: only W_out is trained.',
      },
      {
        tex: String.raw`p(x_{t+1}\mid x_{\le t}) = \operatorname{softmax}\!\big(W_{\text{out}}(\mathbf{r}_{t+1})\,\mathbf{r}_{t+1}\big)`,
        caption: 'Attention-enhanced reservoir: the readout itself is a learned function of the state.',
      },
    ],
    tags: ['Reservoir computing', 'Language models', 'PyTorch', 'Dynamical systems'],
    status: 'Published',
    featured: true,
    links: [
      { label: 'Paper (PR Applied)', href: 'https://doi.org/10.1103/sd11-x3ny' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2507.15779' },
      gh('Shakespeare_Res'),
      { label: 'LAERC', href: 'https://github.com/fekoester/LAERC' },
    ],
  },
  {
    slug: 'attention-enhanced-reservoir',
    title: 'Attention-Enhanced Reservoir Computing',
    eyebrow: 'Reservoir computing',
    category: 'Research',
    year: '2023–2025',
    summary:
      'Replace the static linear readout of a reservoir computer with a small attention mechanism. Smaller reservoirs predict chaotic systems better, and one trained model can represent several attractors at once.',
    description: [
      'In standard reservoir computing the output is a fixed linear map of the reservoir state. The attention-enhanced reservoir computer (AERC) makes that map state-dependent: a small network looks at the current reservoir state and produces the readout weights. The reservoir stays fixed.',
      'In Physical Review Applied (2024) this improved closed-loop prediction of chaotic systems, especially for small photonic (delay-based laser) reservoirs. The follow-up preprint shows that a single AERC with one set of trained weights can reproduce several different chaotic systems (Lorenz, Rössler, Hénon, Duffing, Mackey–Glass) and switch between their attractors without retraining.',
      'AERes is the PyTorch library: ESN reservoir, ridge / attention / node-trajectory-attention readouts, closed-loop forecasting and six chaotic benchmark systems.',
    ],
    equations: [
      {
        tex: String.raw`\hat{\mathbf{y}}_t = W_{\text{out}}\,\mathbf{r}_t \quad\longrightarrow\quad \hat{\mathbf{y}}_t = W_{\text{att}}(\mathbf{r}_t)\,\mathbf{r}_t`,
        caption: 'From a static to a state-dependent readout.',
      },
    ],
    tags: ['Reservoir computing', 'Attention', 'Chaotic systems', 'Photonics'],
    status: 'Published',
    featured: true,
    links: [
      { label: 'Paper (PR Applied)', href: 'https://doi.org/10.1103/PhysRevApplied.22.014039' },
      { label: 'Multi-system preprint', href: 'https://arxiv.org/abs/2505.05852' },
      { label: 'AERes library', href: 'https://github.com/fekoester/AERes' },
    ],
  },
  {
    slug: 'master-memory-function',
    title: 'Master Memory Function',
    eyebrow: 'Theory of delay reservoirs',
    category: 'Research',
    year: '2021–2024',
    summary:
      'A single universal function that gives the linear memory capacity of a whole class of delay-based reservoir computers from their linearisation, with no simulation needed.',
    description: [
      'Delay-based reservoirs use one nonlinear node with delayed feedback; the N virtual nodes are time-multiplexed along the delay line. Their memory capacity depends on many parameters, which normally means sweeping a simulation.',
      'For reservoirs with single-variable dynamics and small inputs, the linearised system is characterised by a few numbers. The master memory function computes the linear memory capacity directly from them, so the expensive part can be done once and reused. It also applies to systems whose dynamical model is unknown.',
      'The MMF repository has a C++ core and a Python package. MC_calc computes the full nonlinear information processing capacity (Dambre et al. 2012) from recorded reservoir states, with a χ² significance threshold.',
    ],
    equations: [
      {
        tex: String.raw`\mathrm{MC} = \sum_{k=1}^{\infty} \mathrm{MC}_k,\qquad \mathrm{MC}_k = \frac{\operatorname{cov}^2\!\big(u_{t-k},\, \hat{u}_{t-k}\big)}{\operatorname{var}(u)\,\operatorname{var}(\hat{u}_{t-k})}`,
        caption: 'Linear memory capacity: how well a linear readout recalls the input k steps back.',
      },
      {
        tex: String.raw`\dot{x}(t) = -a\,x(t) + b\,x(t-\tau) + \gamma\, J(t)`,
        caption: 'Linearised single-variable delay reservoir.',
      },
    ],
    tags: ['Delay systems', 'Memory capacity', 'C++', 'Python'],
    status: 'Published',
    featured: true,
    links: [
      { label: 'Paper (IEEE TNNLS)', href: 'https://doi.org/10.1109/TNNLS.2022.3220532' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2108.12643' },
      gh('MMF'),
      { label: 'MC_calc', href: 'https://github.com/fekoester/MC_calc' },
    ],
  },
  {
    slug: 'adaptive-sensing',
    title: 'Adaptive-Sensing Reservoir Computing',
    eyebrow: 'Learning where to look',
    category: 'Research',
    year: '2025–2026',
    summary:
      'Use a continuous field (a 2-D diffusion or wave PDE) as the reservoir and learn where to measure it: moving query points instead of a fixed sensor grid.',
    description: [
      'A physical reservoir does not have discrete nodes; it is a field. Which points you read out matters as much as the readout weights. ASAERC drives a 2-D diffusion/wave PDE with a time series and compares three readouts: linear on a fixed grid, static attention, and adaptive sensing where the measurement locations themselves move as a function of the state.',
      'Evaluated on eight chaotic systems and maps, with direct N-step forecasting and closed-loop valid prediction time.',
    ],
    tags: ['PDE reservoirs', 'Sensing', 'Attention', 'Chaotic systems'],
    status: 'Research in progress',
    links: [gh('ASAERC')],
  },
  {
    slug: 'echomario',
    title: 'EchoMario',
    eyebrow: 'Reservoirs for control',
    category: 'Research',
    year: '2026',
    summary:
      'Can a frozen echo-state network be the memory of an RL agent? A fixed reservoir plus a trained linear readout plays an original procedural platformer, compared against GRU, CNN and linear baselines.',
    description: [
      'The question is whether the memory an agent needs (momentum, gaps that scrolled off screen, timing of a jump) can come from a fixed random dynamical system, so that only a linear policy head has to be learned.',
      'EchoMario ships its own procedural platformer, PPO and imitation-learning (DAgger) training, and recurrent and convolutional baselines at comparable sizes.',
    ],
    caveats: [
      'This is ongoing work. Simple scripted policies (always run right and jump) are surprisingly strong on several level types, so evaluation is being tightened before any claim of a reservoir advantage.',
    ],
    tags: ['Reinforcement learning', 'Echo state networks', 'PPO', 'Imitation learning'],
    status: 'Research in progress',
    links: [gh('EchoMario')],
  },
  {
    slug: 'causal-convolution-transformer',
    title: 'Causal Convolution Transformer',
    eyebrow: 'Architecture experiment',
    category: 'Experiment',
    year: '2026',
    summary:
      'A compact GPT with a causal-convolution residual branch in every block, giving each layer a cheap local-context path next to attention. Includes an ablation against the plain transformer.',
    description: [
      'Attention is good at long-range lookups but spends capacity on local patterns that a short causal convolution gets almost for free. CCT adds a causal convolution branch to the residual stream of every block.',
      'Full train / resume / validate / sample pipeline for Tiny Shakespeare, any text file, or OpenWebText.',
    ],
    tags: ['Transformers', 'Language models', 'PyTorch'],
    status: 'Done',
    links: [gh('Causal-Convolution-Transformer-CCT')],
  },
  {
    slug: 'ctm-cifar',
    title: 'Continuous Thought Machines on CIFAR',
    eyebrow: 'Reimplementation',
    category: 'Experiment',
    year: '2026',
    summary:
      'A reimplementation of Sakana AI’s Continuous Thought Machine for CIFAR-10/100 with a z-residual, normalised synchronisation, four tick losses, adaptive halting and a CNN baseline.',
    description: [
      'Continuous Thought Machines use neuron-level temporal dynamics and the synchronisation between neurons as the representation. This repo rebuilds the model for CIFAR and tests several design choices: tick-wise losses, evaluation rules, and adaptive halting.',
    ],
    tags: ['Neural dynamics', 'Vision', 'PyTorch'],
    status: 'Done',
    links: [gh('ctm-cifar-bench')],
  },
  {
    slug: 'fhn-mnist',
    title: 'FitzHugh–Nagumo Networks',
    eyebrow: 'Neuron models that learn',
    category: 'Experiment',
    year: '2025',
    summary:
      'A dense recurrent network of FitzHugh–Nagumo neurons classifying MNIST and Fashion-MNIST, trained by backpropagation through time and by local three-factor plasticity.',
    description: [
      'A test of how far an excitable, biophysically motivated neuron model can be pushed as a learning substrate, and how gradient training compares with local learning rules.',
    ],
    equations: [
      {
        tex: String.raw`\dot v = v - \tfrac{v^3}{3} - w + I_{\text{ext}} + \textstyle\sum_j W_{ij}\, s(v_j),\qquad \tau\dot w = v + a - b w`,
      },
    ],
    tags: ['Excitable systems', 'Plasticity', 'BPTT'],
    status: 'Done',
    links: [gh('FHN_MNIST')],
  },
  {
    slug: 'gfx1010-rocblas',
    title: 'Tuned rocBLAS for the RX 5700',
    eyebrow: 'GPU tooling',
    category: 'Software',
    year: '2026',
    summary:
      'RDNA1 cards (gfx1010) fall back to slow generic GEMM kernels in current ROCm PyTorch builds. This rebuilds tuned kernels so fp32 training gets roughly 50–70% faster.',
    description: [
      'AMD’s TheRock PyTorch builds run on the RX 5700 / 5700 XT, but rocBLAS has no tuned GEMM solutions for gfx1010, so matrix multiplies use fallback kernels. This project rebuilds rocBLAS with the navi21 tuned kernels retargeted to gfx1010.',
      'Measured on an RX 5700: about 7.2–7.9 TFLOPS fp32 and 15+ TFLOPS fp16 for large GEMMs. Released as a drop-in build with instructions.',
    ],
    tags: ['ROCm', 'rocBLAS', 'PyTorch', 'GPU'],
    status: 'Live',
    featured: true,
    links: [gh('gfx1010-tuned-rocblas'), { label: 'Releases', href: 'https://github.com/fekoester/gfx1010-tuned-rocblas/releases' }],
  },
  {
    slug: 'power-forecast-mlops',
    title: 'PowerForecastMLOps',
    eyebrow: 'Live forecasting',
    category: 'Software',
    year: '2026',
    summary:
      'An end-to-end forecasting system for California (CAISO) electricity demand: data validation, walk-forward backtests of LightGBM, MLP and an echo-state network, conformal intervals, and a daily-updated public dashboard.',
    description: [
      'Hourly demand from the EIA and weather from Open-Meteo are validated, turned into forecast-safe features and fed to several models, which are compared in walk-forward backtests.',
      'A daily GitHub Actions job produces next-24-hour forecasts with conformal prediction intervals, monitors errors, and redeploys the dashboard.',
    ],
    tags: ['MLOps', 'Time series', 'Conformal prediction', 'GitHub Actions'],
    status: 'Live',
    links: [
      { label: 'Live dashboard', href: 'https://fekoester.github.io/PowerForecastMLOps/' },
      gh('PowerForecastMLOps'),
    ],
  },
  {
    slug: 'paperforge',
    title: 'PaperForge',
    eyebrow: 'LLM tooling',
    category: 'Software',
    year: '2026',
    summary:
      'An early pipeline that turns technical PDFs into structured, evidence-checked knowledge cards: every extracted claim must be backed by a verbatim quote from the page.',
    description: [
      'Implemented so far: page-level PDF text extraction, LLM card extraction, verification of evidence quotes against the source, and a CLI.',
    ],
    tags: ['LLMs', 'RAG', 'Document processing'],
    status: 'Active',
    links: [gh('PaperForge')],
  },
  {
    slug: 'primordial-particle-system',
    title: 'Primordial Particle System',
    eyebrow: 'Emergence',
    category: 'Simulation',
    year: '2026',
    summary:
      'A fast C++ implementation of the Primordial Particle System (Schmickl et al., 2016): cell-like structures that grow and divide emerge from a one-line motion law.',
    description: [
      'Each particle turns by a fixed angle plus a term proportional to how many neighbours it has, signed by which side they are on. That is all, and it produces spores, cells and division.',
      'Header-only core, SFML viewer, headless runs at roughly 2.3 million particle-steps per second.',
    ],
    equations: [
      {
        tex: String.raw`\Delta\phi_i = \alpha + \beta\, N_i\, \operatorname{sign}\!\big(R_i - L_i\big)`,
        caption: 'N = neighbours within radius, R/L = neighbours to the right/left.',
      },
    ],
    tags: ['C++17', 'Artificial life', 'SFML'],
    status: 'Done',
    links: [gh('PPS')],
  },
  {
    slug: 'oscillator-networks',
    title: 'Coupled Oscillator Networks',
    eyebrow: 'Synchronisation',
    category: 'Simulation',
    year: '2017 / 2026',
    summary:
      'Networks of SNIPER (active rotator) oscillators with Pyragas delayed feedback, integrated with RK4, with topology sweeps and the Kuramoto order parameter.',
    description: [
      'A header-only C++17 integrator for coupled phase oscillators near a saddle-node-on-invariant-circle bifurcation, with delayed feedback control. Original code from 2017, rewritten in 2026.',
    ],
    equations: [
      {
        tex: String.raw`\dot\varphi_i = \omega - \sin\varphi_i + \frac{\kappa}{N}\sum_j A_{ij}\sin(\varphi_j-\varphi_i) + K\big[\varphi_i(t-\tau)-\varphi_i(t)\big]`,
      },
      { tex: String.raw`R\,e^{i\psi} = \frac{1}{N}\sum_{j=1}^{N} e^{i\varphi_j}` },
    ],
    tags: ['C++17', 'Nonlinear dynamics', 'Delay systems'],
    status: 'Done',
    links: [gh('Oscillator-Network-Simulation')],
  },
  {
    slug: 'neat',
    title: 'NEAT in Modern C++',
    eyebrow: 'Neuroevolution',
    category: 'Simulation',
    year: '2017 / 2026',
    summary:
      'From-scratch NeuroEvolution of Augmenting Topologies (Stanley & Miikkulainen, 2002): XOR, cart-pole, double-pole balancing and a dodge game, with deterministic multithreaded training.',
    description: ['Started in 2017, rewritten as NEAT 2.0 in 2026 with an SFML viewer.'],
    tags: ['C++17', 'Evolutionary algorithms'],
    status: 'Done',
    links: [gh('NEAT-Implementation')],
  },
  {
    slug: 'multiplexed-networks',
    title: 'Multiplexed Neural Networks',
    eyebrow: 'Hypernetworks',
    category: 'Experiment',
    year: '2026',
    summary:
      'Header-only C++17: a control network’s activations set the main network’s weights per sample. Exact backprop with finite-difference checks, benchmarked against same-size MLPs.',
    description: [
      'Multiplicative interactions let a network change its function depending on context. Tested on a context-gated task and UCI letter recognition.',
    ],
    tags: ['C++17', 'Hypernetworks', 'Backprop'],
    status: 'Done',
    links: [gh('Multiplexed-Neural-Networks')],
  },
  {
    slug: 'world-generation',
    title: 'Procedural Worlds & Artificial Life',
    eyebrow: 'Simulation sandbox',
    category: 'Simulation',
    year: '2017 / 2026',
    summary:
      'A Dwarf-Fortress-style world generator (continents, rivers, climate, spreading civilisations), an artificial-life island with evolving neural-network creatures, and a pheromone ant colony.',
    description: [
      'PWG: noise continents, oceans, mountains, rivers, climate and biomes, then civilisations that settle and spread; seeded and exportable.',
      'World-Simulation: organisms with evolving neural-network brains find food, regulate temperature, fight and breed on a Perlin-noise island.',
      'Ant-Simulation: foraging with a single distance-weighted pheromone; in the included experiment pheromone following delivers 38% more food than a random walk.',
    ],
    tags: ['C++17', 'Procedural generation', 'Artificial life'],
    status: 'Done',
    links: [
      { label: 'PWG', href: 'https://github.com/fekoester/PWG' },
      { label: 'World-Simulation', href: 'https://github.com/fekoester/World-Simulation' },
      { label: 'Ant-Simulation', href: 'https://github.com/fekoester/Ant-Simulation' },
    ],
  },
];

export const categories: Category[] = ['Research', 'Software', 'Experiment', 'Simulation'];
export const featuredProjects = projects.filter((p) => p.featured);
