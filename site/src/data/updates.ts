// Newest first. Add an entry whenever something significant happens
// (paper accepted, preprint posted, release, new public project).
export type Update = { date: string; text: string; href?: string };

export const updates: Update[] = [
  {
    date: '2026-11',
    text: 'This site goes live: publications, research projects and open code in one place.',
  },
  {
    date: '2026-11',
    text: 'Released tuned rocBLAS kernels for RX 5700 (gfx1010): 50–70% faster fp32 training with ROCm PyTorch.',
    href: '/projects/gfx1010-rocblas',
  },
  {
    date: '2026-08',
    text: '“Reservoir computing as a language model” published in Physical Review Applied.',
    href: 'https://doi.org/10.1103/sd11-x3ny',
  },
  {
    date: '2025-05',
    text: 'Preprint: one attention-enhanced reservoir that learns several chaotic attractors at once.',
    href: 'https://arxiv.org/abs/2505.05852',
  },
];
