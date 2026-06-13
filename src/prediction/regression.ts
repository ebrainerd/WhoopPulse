import type { JournalEntry, WhoopCycle } from '@/types/models';
import { addDaysKey, timeToMinutes } from '@/utils/date';
import { identity, invert, matVec, multiply, transpose } from '@/utils/matrix';
import { mean, meanAbsoluteError, round, stdDev } from '@/utils/stats';

/**
 * Per-user statistical model: ridge regression of journal features → next-day
 * recovery. This is the "learns you over time" layer that personalizes the
 * otherwise fixed rule weights.
 */

interface FeatureDef {
  key: string;
  extract: (j: JournalEntry) => number | null;
}

const STRENUOUS = new Set(['push', 'pull', 'legs', 'cardio']);

const FEATURES: FeatureDef[] = [
  { key: 'alcohol', extract: (j) => j.alcoholDrinks },
  { key: 'work_stress', extract: (j) => j.workStress },
  {
    key: 'training_load',
    extract: (j) => (STRENUOUS.has(j.trainingType) ? j.trainingIntensity : 0),
  },
  { key: 'creatine', extract: (j) => (j.creatine || j.supplements.includes('creatine') ? 1 : 0) },
  { key: 'magnesium', extract: (j) => (j.supplements.includes('magnesium') ? 1 : 0) },
  { key: 'winddown', extract: (j) => timeToMinutes(j.winddownTime) },
  { key: 'fasting', extract: (j) => j.fastingHours ?? 0 },
  { key: 'energy', extract: (j) => j.energy },
  { key: 'mood', extract: (j) => j.mood },
  { key: 'water', extract: (j) => j.waterLiters },
  { key: 'caffeine', extract: (j) => (j.caffeineAfter2pm ? 1 : 0) },
];

export interface RecoveryModel {
  /** Standardized ridge weights, aligned with FEATURES. */
  weights: number[];
  intercept: number;
  means: number[];
  stds: number[];
  featureMeans: number[]; // for imputing nulls at predict time
  n: number;
  mae: number;
}

const MIN_SAMPLES = 12;
const RIDGE_LAMBDA = 1.0;

/** Builds paired rows: journal day `d` features → recovery on day `d+1`. */
function buildDataset(
  journals: JournalEntry[],
  cycles: WhoopCycle[],
): { X: (number | null)[][]; y: number[] } {
  const recoveryByDate = new Map<string, number>();
  for (const c of cycles) {
    if (c.recoveryScore != null) recoveryByDate.set(c.date, c.recoveryScore);
  }
  const X: (number | null)[][] = [];
  const y: number[] = [];
  for (const j of journals) {
    const next = recoveryByDate.get(addDaysKey(j.date, 1));
    if (next == null) continue;
    X.push(FEATURES.map((f) => f.extract(j)));
    y.push(next);
  }
  return { X, y };
}

export function fitRecoveryModel(
  journals: JournalEntry[],
  cycles: WhoopCycle[],
): RecoveryModel | null {
  const { X, y } = buildDataset(journals, cycles);
  if (y.length < MIN_SAMPLES) return null;

  const p = FEATURES.length;
  const n = y.length;

  // Impute null features with column mean.
  const featureMeans: number[] = [];
  for (let j = 0; j < p; j++) {
    const vals = X.map((row) => row[j]).filter((v): v is number => v != null);
    featureMeans[j] = vals.length ? mean(vals) : 0;
  }
  const Xi: number[][] = X.map((row) =>
    row.map((v, j) => (v == null ? featureMeans[j] : v)),
  );

  // Standardize features.
  const means: number[] = [];
  const stds: number[] = [];
  for (let j = 0; j < p; j++) {
    const col = Xi.map((row) => row[j]);
    means[j] = mean(col);
    const s = stdDev(col);
    stds[j] = s < 1e-8 ? 1 : s;
  }
  const Z: number[][] = Xi.map((row) =>
    row.map((v, j) => (v - means[j]) / stds[j]),
  );

  const yBar = mean(y);
  const yc = y.map((v) => v - yBar);

  // Ridge: w = (ZᵀZ + λI)⁻¹ Zᵀ yc
  const Zt = transpose(Z);
  const ZtZ = multiply(Zt, Z);
  const reg = identity(p, RIDGE_LAMBDA);
  for (let i = 0; i < p; i++)
    for (let j = 0; j < p; j++) ZtZ[i][j] += reg[i][j];
  const inv = invert(ZtZ);
  if (!inv) return null;
  const Zty = matVec(Zt, yc);
  const weights = matVec(inv, Zty);

  // In-sample MAE (rough confidence proxy).
  const preds = Z.map((row) => yBar + row.reduce((acc, z, j) => acc + z * weights[j], 0));
  const mae = meanAbsoluteError(preds, y);

  return { weights, intercept: yBar, means, stds, featureMeans, n, mae: round(mae, 1) };
}

export function predictWithModel(
  model: RecoveryModel,
  journal: JournalEntry,
): number {
  let acc = model.intercept;
  FEATURES.forEach((f, j) => {
    const raw = f.extract(journal);
    const v = raw == null ? model.featureMeans[j] : raw;
    const z = (v - model.means[j]) / model.stds[j];
    acc += z * model.weights[j];
  });
  return acc;
}
