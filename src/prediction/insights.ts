import type { JournalEntry, WhoopCycle } from '@/types/models';
import { addDaysKey, timeToMinutes } from '@/utils/date';
import { mean, pearson, round } from '@/utils/stats';

/** A measurable journal feature and how to extract it. */
interface FeatureDef {
  key: string;
  label: string;
  /** Returns null if not measurable for this entry. */
  extract: (j: JournalEntry) => number | null;
  /** Human phrasing when correlation is positive vs negative. */
  positiveIsGood: boolean;
  unit?: string;
}

const FEATURES: FeatureDef[] = [
  { key: 'alcohol', label: 'Alcohol', extract: (j) => j.alcoholDrinks, positiveIsGood: false, unit: 'drinks' },
  { key: 'work_stress', label: 'Work stress', extract: (j) => j.workStress, positiveIsGood: false },
  { key: 'training_intensity', label: 'Training intensity', extract: (j) => j.trainingIntensity, positiveIsGood: false },
  { key: 'creatine', label: 'Creatine', extract: (j) => (j.creatine || j.supplements.includes('creatine') ? 1 : 0), positiveIsGood: true },
  { key: 'magnesium', label: 'Magnesium', extract: (j) => (j.supplements.includes('magnesium') ? 1 : 0), positiveIsGood: true },
  { key: 'winddown', label: 'Wind-down time', extract: (j) => timeToMinutes(j.winddownTime), positiveIsGood: false },
  { key: 'fasting', label: 'Fasting hours', extract: (j) => j.fastingHours, positiveIsGood: true },
  { key: 'energy', label: 'Energy', extract: (j) => j.energy, positiveIsGood: true },
  { key: 'mood', label: 'Mood', extract: (j) => j.mood, positiveIsGood: true },
  { key: 'water', label: 'Hydration', extract: (j) => j.waterLiters, positiveIsGood: true },
];

export interface Driver {
  key: string;
  label: string;
  correlation: number;
  /** How many paired observations supported this correlation. */
  samples: number;
  /** Plain-English direction, e.g. "lower recovery". */
  effect: string;
}

/**
 * Pairs each journal day `d` with the recovery score on day `d+1`, then computes
 * Pearson correlation per feature. Returns the strongest drivers first.
 */
export function computeDrivers(
  journals: JournalEntry[],
  cycles: WhoopCycle[],
  minSamples = 6,
): Driver[] {
  const recoveryByDate = new Map<string, number>();
  for (const c of cycles) {
    if (c.recoveryScore != null) recoveryByDate.set(c.date, c.recoveryScore);
  }

  const drivers: Driver[] = [];
  for (const feat of FEATURES) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const j of journals) {
      const nextRecovery = recoveryByDate.get(addDaysKey(j.date, 1));
      const x = feat.extract(j);
      if (nextRecovery != null && x != null) {
        xs.push(x);
        ys.push(nextRecovery);
      }
    }
    if (xs.length < minSamples) continue;
    // Skip features with no variance (constant input).
    if (new Set(xs).size < 2) continue;
    const r = pearson(xs, ys);
    if (Math.abs(r) < 0.1) continue;
    const lowersRecovery = r < 0;
    drivers.push({
      key: feat.key,
      label: feat.label,
      correlation: round(r, 2),
      samples: xs.length,
      effect: lowersRecovery ? 'lower next-day recovery' : 'higher next-day recovery',
    });
  }
  return drivers.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

export interface TrendInsight {
  text: string;
}

/**
 * Long-term observations, e.g. "Creatine on training days boosts recovery by X".
 * Compares mean next-day recovery for a behavior present vs absent.
 */
export function computeTrends(
  journals: JournalEntry[],
  cycles: WhoopCycle[],
): TrendInsight[] {
  const recoveryByDate = new Map<string, number>();
  for (const c of cycles) {
    if (c.recoveryScore != null) recoveryByDate.set(c.date, c.recoveryScore);
  }
  const nextRecovery = (j: JournalEntry) => recoveryByDate.get(addDaysKey(j.date, 1));

  const insights: TrendInsight[] = [];

  const compareBoolean = (
    pred: (j: JournalEntry) => boolean,
    onLabel: string,
  ) => {
    const withVals: number[] = [];
    const withoutVals: number[] = [];
    for (const j of journals) {
      const r = nextRecovery(j);
      if (r == null) continue;
      (pred(j) ? withVals : withoutVals).push(r);
    }
    if (withVals.length >= 4 && withoutVals.length >= 4) {
      const delta = round(mean(withVals) - mean(withoutVals), 1);
      if (Math.abs(delta) >= 2) {
        insights.push({
          text: `${onLabel} is associated with ${Math.abs(delta)} pts ${
            delta > 0 ? 'higher' : 'lower'
          } next-day recovery (${withVals.length} days).`,
        });
      }
    }
  };

  compareBoolean(
    (j) => j.creatine || j.supplements.includes('creatine'),
    'Creatine',
  );
  compareBoolean((j) => j.alcoholDrinks > 0, 'Drinking alcohol');
  compareBoolean((j) => j.supplements.includes('magnesium'), 'Magnesium');
  compareBoolean((j) => j.workStress >= 4, 'High work-stress days');
  compareBoolean(
    (j) => j.trainingType === 'rest' || j.trainingType === 'active_recovery',
    'Recovery/rest days',
  );
  compareBoolean((j) => j.caffeineAfter2pm, 'Late caffeine');

  return insights;
}
