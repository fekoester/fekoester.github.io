import type { Category } from './projects';

export const categoryLabel: Record<Category, string> = {
  Research: 'Research',
  Software: 'Software',
  Experiment: 'ML experiment',
  Simulation: 'Simulation',
};

export const categoryTitle: Record<Category, string> = {
  Research: 'Research',
  Software: 'Software & tools',
  Experiment: 'ML experiments',
  Simulation: 'Simulations',
};

export const categoryBlurb: Record<Category, string> = {
  Research: 'Work behind papers, or heading toward one.',
  Software: 'Tools and systems other people can use today.',
  Experiment: 'Architecture and learning experiments: small, fast, honest.',
  Simulation: 'Dynamical systems, emergence and artificial life, mostly C++.',
};
