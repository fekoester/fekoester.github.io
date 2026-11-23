export type PubStatus = 'Journal' | 'Preprint';

export type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: string;
  status: PubStatus;
  selected?: boolean;
  links?: { label: string; href: string }[];
};

// Only entries checked against publisher / arXiv records (2026-11-23). Newest first.
export const publications: Publication[] = [
  {
    title: 'Reservoir computing as a language model',
    authors: 'Felix Köster, Atsushi Uchida',
    venue: 'Physical Review Applied 26, 024051',
    year: '2026',
    status: 'Journal',
    selected: true,
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1103/sd11-x3ny' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2507.15779' },
      { label: 'Code', href: 'https://github.com/fekoester/Shakespeare_Res' },
    ],
  },
  {
    title: 'Attention-enhanced reservoir computing as a multiple dynamical system approximator',
    authors: 'Felix Köster, Kazutaka Kanno, Atsushi Uchida',
    venue: 'arXiv:2505.05852',
    year: '2025',
    status: 'Preprint',
    links: [{ label: 'arXiv', href: 'https://arxiv.org/abs/2505.05852' }],
  },
  {
    title: 'Attention-enhanced reservoir computing',
    authors: 'Felix Köster, Kazutaka Kanno, Jun Ohkubo, Atsushi Uchida',
    venue: 'Physical Review Applied 22, 014039',
    year: '2024',
    status: 'Journal',
    selected: true,
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1103/PhysRevApplied.22.014039' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2312.16503' },
      { label: 'Code', href: 'https://github.com/fekoester/AERes' },
    ],
  },
  {
    title: 'Master memory function for delay-based reservoir computers with single-variable dynamics',
    authors: 'Felix Köster, Serhiy Yanchuk, Kathy Lüdge',
    venue: 'IEEE Transactions on Neural Networks and Learning Systems 35(6), 7712–7725',
    year: '2024',
    status: 'Journal',
    selected: true,
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1109/TNNLS.2022.3220532' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2108.12643' },
      { label: 'Code', href: 'https://github.com/fekoester/MMF' },
    ],
  },
  {
    title: 'Data-informed reservoir computing for efficient time-series prediction',
    authors: 'Felix Köster, Dhruvit Patel, Alexander Wikner, Lina Jaurigue, Kathy Lüdge',
    venue: 'Chaos 33, 073109',
    year: '2023',
    status: 'Journal',
  },
  {
    title: 'Limitations of the recall capabilities in delay-based reservoir computing systems',
    authors: 'Felix Köster, Dominik Ehlert, Kathy Lüdge',
    venue: 'Cognitive Computation 15, 1419–1426',
    year: '2023',
    status: 'Journal',
    links: [{ label: 'arXiv', href: 'https://arxiv.org/abs/2010.15562' }],
  },
  {
    title: 'Deriving task specific performance from the information processing capacity of a reservoir computer',
    authors: 'Tobias Hülser, Felix Köster, Kathy Lüdge, Lina Jaurigue',
    venue: 'Nanophotonics 12(5), 937–947',
    year: '2023',
    status: 'Journal',
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1515/nanoph-2022-0415' },
      { label: 'Code', href: 'https://github.com/fekoester/MC_calc' },
    ],
  },
  {
    title: 'Role of delay-times in delay-based photonic reservoir computing',
    authors: 'Tobias Hülser, Felix Köster, Lina Jaurigue, Kathy Lüdge',
    venue: 'Optical Materials Express 12(3), 1214–1231',
    year: '2022',
    status: 'Journal',
    links: [{ label: 'DOI', href: 'https://doi.org/10.1364/OME.451016' }],
  },
  {
    title: 'Insight into delay based reservoir computing via eigenvalue analysis',
    authors: 'Felix Köster, Serhiy Yanchuk, Kathy Lüdge',
    venue: 'Journal of Physics: Photonics 3, 024011',
    year: '2021',
    status: 'Journal',
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1088/2515-7647/abf237' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2009.07928' },
    ],
  },
];

export const selectedPublications = publications.filter((p) => p.selected);
