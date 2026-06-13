import type {
  JournalEntry,
  Prediction,
  PredictionFactor,
  Recommendation,
  TrainingType,
  WeatherForecast,
  WhoopCycle,
} from '@/types/models';
import { todayKey } from '@/utils/date';
import { clamp, ewma, meanAbsoluteError, mean, round } from '@/utils/stats';

import { evaluateRules, type PredictionContext } from './factors';

export const MODEL_VERSION = 'rule+calib-v1';

const DEFAULT_BASELINE = 60;

export interface PredictInput {
  /** The day the prediction is FOR (typically tomorrow). */
  date: string;
  /** Today's journal — the inputs we can still act on. */
  journal: JournalEntry;
  /** Recent recovery history used to compute the baseline (oldest→newest). */
  recentCycles: WhoopCycle[];
  /** Most recent completed Whoop day (strain/sleep momentum). */
  yesterdayCycle: WhoopCycle | null;
  /** Tomorrow-night weather forecast. */
  weather: WeatherForecast | null;
  /** Past predictions with known actuals — used to calibrate + size confidence. */
  pastPredictions?: Prediction[];
}

export interface PredictionResult {
  prediction: Prediction;
  recommendations: Recommendation[];
}

/** Recent recovery baseline via exponentially weighted moving average. */
export function computeBaseline(cycles: WhoopCycle[]): number {
  const scores = cycles
    .map((c) => c.recoveryScore)
    .filter((s): s is number => s != null);
  if (scores.length === 0) return DEFAULT_BASELINE;
  const recent = scores.slice(-14);
  return round(ewma(recent, 0.3), 1);
}

/**
 * Systematic-bias calibration. If the model has historically run a bit high or
 * low for this user, shift future predictions by the mean residual. This is the
 * lightweight "statistical model learns from your data" layer of the MVP.
 */
function calibrationOffset(pastPredictions: Prediction[]): number {
  const paired = pastPredictions.filter((p) => p.actualScore != null);
  if (paired.length < 5) return 0;
  const residuals = paired.map((p) => (p.actualScore as number) - p.predictedScore);
  return clamp(round(mean(residuals), 1), -12, 12);
}

/** Confidence band (± points) from historical accuracy or data volume. */
function computeConfidence(
  pastPredictions: Prediction[],
  recentCycles: WhoopCycle[],
): number {
  const paired = pastPredictions.filter((p) => p.actualScore != null);
  if (paired.length >= 5) {
    const mae = meanAbsoluteError(
      paired.map((p) => p.predictedScore),
      paired.map((p) => p.actualScore as number),
    );
    return clamp(Math.round(mae * 1.25), 4, 20);
  }
  // Cold start: wider band the less history we have.
  const n = recentCycles.filter((c) => c.recoveryScore != null).length;
  if (n >= 7) return 10;
  if (n >= 3) return 14;
  return 18;
}

export function runPrediction(input: PredictInput): PredictionResult {
  const baseline = computeBaseline(input.recentCycles);
  const ctx: PredictionContext = {
    journal: input.journal,
    yesterdayCycle: input.yesterdayCycle,
    weather: input.weather,
    baseline,
  };

  const { factors, recommendations } = evaluateRules(ctx);
  const sumImpacts = factors.reduce((acc, f) => acc + f.impact, 0);
  const calibration = calibrationOffset(input.pastPredictions ?? []);

  const allFactors: PredictionFactor[] = [...factors];
  if (calibration !== 0) {
    allFactors.push({
      key: 'calibration',
      label: 'Personal calibration',
      impact: calibration,
    });
  }

  const predictedScore = clamp(
    Math.round(baseline + sumImpacts + calibration),
    1,
    99,
  );
  const confidence = computeConfidence(
    input.pastPredictions ?? [],
    input.recentCycles,
  );

  // Sort recommendations by realizable impact, then priority, top 5.
  const sortedRecs = recommendations
    .sort((a, b) => b.impactPoints - a.impactPoints || a.priority - b.priority)
    .slice(0, 5);

  const prediction: Prediction = {
    date: input.date,
    predictedScore,
    confidence,
    actualScore: null,
    baseline,
    factors: allFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
    modelVersion: MODEL_VERSION,
  };

  return { prediction, recommendations: sortedRecs };
}

/** Plain-English summary of a predicted score. */
export function predictionVerdict(score: number): string {
  if (score >= 80) return 'Primed — you’re set up for a strong day.';
  if (score >= 67) return 'Good, with a little room to improve.';
  if (score >= 50) return 'Moderate — a few tweaks could move the needle.';
  if (score >= 34) return 'Compromised — prioritize the actions below.';
  return 'Low — focus hard on rest and the actions below.';
}

export interface AccuracyStats {
  count: number;
  mae: number | null;
  withinBand: number | null; // fraction of predictions whose actual fell in band
  bias: number | null; // mean(actual - predicted)
}

export function predictionAccuracy(predictions: Prediction[]): AccuracyStats {
  const paired = predictions.filter((p) => p.actualScore != null);
  if (paired.length === 0) {
    return { count: 0, mae: null, withinBand: null, bias: null };
  }
  const mae = meanAbsoluteError(
    paired.map((p) => p.predictedScore),
    paired.map((p) => p.actualScore as number),
  );
  const within =
    paired.filter(
      (p) => Math.abs((p.actualScore as number) - p.predictedScore) <= p.confidence,
    ).length / paired.length;
  const bias = mean(
    paired.map((p) => (p.actualScore as number) - p.predictedScore),
  );
  return {
    count: paired.length,
    mae: round(mae, 1),
    withinBand: round(within, 2),
    bias: round(bias, 1),
  };
}

/** A neutral journal entry for a given day (used as form defaults / what-if base). */
export function buildEmptyJournal(date: string = todayKey()): JournalEntry {
  return {
    date,
    alcoholDrinks: 0,
    lastMealTime: null,
    fastingHours: null,
    creatine: false,
    supplements: [],
    energy: 3,
    mood: 3,
    trainingType: 'rest' as TrainingType,
    trainingIntensity: 3,
    trainingNotes: '',
    workStress: 3,
    winddownTime: null,
    waterLiters: null,
    caffeineAfter2pm: false,
    notes: '',
  };
}
