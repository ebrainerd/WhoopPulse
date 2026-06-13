import type { JournalEntry } from '@/types/models';
import { timeToMinutes } from '@/utils/date';

/**
 * Catalog of n-of-1 experiment conditions. Each defines a behavior to hold
 * constant and a predicate that decides whether a given day adhered to it.
 */
export interface ExperimentCondition {
  key: string;
  title: string;
  hypothesis: string;
  /** True when the day adhered to the protocol. */
  predicate: (j: JournalEntry) => boolean;
}

export const EXPERIMENT_CONDITIONS: ExperimentCondition[] = [
  {
    key: 'no_alcohol',
    title: 'No alcohol',
    hypothesis: 'Cutting alcohol raises my next-day recovery.',
    predicate: (j) => j.alcoholDrinks === 0,
  },
  {
    key: 'creatine',
    title: 'Daily creatine',
    hypothesis: 'Taking creatine every day improves recovery.',
    predicate: (j) => j.creatine || j.supplements.includes('creatine'),
  },
  {
    key: 'magnesium',
    title: 'Magnesium before bed',
    hypothesis: 'Magnesium at night improves sleep and recovery.',
    predicate: (j) => j.supplements.includes('magnesium'),
  },
  {
    key: 'early_winddown',
    title: 'Wind down by 10 PM',
    hypothesis: 'An earlier wind-down improves recovery.',
    predicate: (j) => {
      const m = timeToMinutes(j.winddownTime);
      return m != null && m <= 22 * 60;
    },
  },
  {
    key: 'no_late_caffeine',
    title: 'No caffeine after 2 PM',
    hypothesis: 'Cutting afternoon caffeine improves sleep and recovery.',
    predicate: (j) => !j.caffeineAfter2pm,
  },
  {
    key: 'early_last_meal',
    title: 'Finish eating by 8 PM',
    hypothesis: 'An earlier last meal improves recovery.',
    predicate: (j) => {
      const m = timeToMinutes(j.lastMealTime);
      return m != null && m <= 20 * 60;
    },
  },
  {
    key: 'hydrated',
    title: 'Hydrate (3L+)',
    hypothesis: 'Better hydration improves recovery.',
    predicate: (j) => (j.waterLiters ?? 0) >= 3,
  },
  {
    key: 'more_rest',
    title: 'More recovery days',
    hypothesis: 'Adding rest / active-recovery days raises recovery.',
    predicate: (j) =>
      j.trainingType === 'rest' || j.trainingType === 'active_recovery',
  },
];

export function getCondition(key: string): ExperimentCondition | undefined {
  return EXPERIMENT_CONDITIONS.find((c) => c.key === key);
}
