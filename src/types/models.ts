/** Domain models used across the app (UI, services, prediction engine). */

export type TrainingType =
  | 'push'
  | 'pull'
  | 'legs'
  | 'cardio'
  | 'active_recovery'
  | 'rest';

export const TRAINING_TYPES: { value: TrainingType; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'active_recovery', label: 'Active Recovery' },
  { value: 'rest', label: 'Rest' },
];

export const SUPPLEMENTS: { value: string; label: string }[] = [
  { value: 'creatine', label: 'Creatine' },
  { value: 'magnesium', label: 'Magnesium' },
  { value: 'vitamin_d', label: 'Vitamin D' },
  { value: 'omega3', label: 'Omega-3' },
  { value: 'electrolytes', label: 'Electrolytes' },
  { value: 'protein', label: 'Protein' },
  { value: 'zinc', label: 'Zinc' },
  { value: 'ashwagandha', label: 'Ashwagandha' },
];

/** A single day's self-reported journal. `date` is the calendar day (YYYY-MM-DD). */
export interface JournalEntry {
  id?: string;
  userId?: string;
  date: string;
  alcoholDrinks: number;
  /** HH:mm, time of last food intake. */
  lastMealTime: string | null;
  /** Intended fasting window length in hours. */
  fastingHours: number | null;
  creatine: boolean;
  supplements: string[];
  /** 1 (drained) .. 5 (energized). */
  energy: number;
  /** 1 (low) .. 5 (great). */
  mood: number;
  trainingType: TrainingType;
  /** 1 (light) .. 5 (max effort). */
  trainingIntensity: number;
  trainingNotes: string;
  /** 1 (calm) .. 5 (very stressed). */
  workStress: number;
  /** HH:mm, time the user began their wind-down routine. */
  winddownTime: string | null;
  waterLiters: number | null;
  caffeineAfter2pm: boolean;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Whoop physiological data for a recovery day. */
export interface WhoopCycle {
  id?: string;
  userId?: string;
  date: string;
  recoveryScore: number | null;
  hrvMs: number | null;
  rhrBpm: number | null;
  skinTempC: number | null;
  spo2: number | null;
  restingCalories: number | null;
  dayStrain: number | null;
  sleepPerformance: number | null;
  sleepDurationMin: number | null;
  sleepEfficiency: number | null;
  sleepConsistency: number | null;
  respiratoryRate: number | null;
  raw?: unknown;
}

export interface WeatherForecast {
  date: string;
  tempMinC: number | null;
  tempMaxC: number | null;
  /** Forecast overnight low — proxy for bedroom temperature impact on sleep. */
  overnightLowC: number | null;
  precipitationMm: number | null;
  windKph: number | null;
  description: string | null;
}

/** A factor that contributed to a prediction (audit + UI display). */
export interface PredictionFactor {
  key: string;
  label: string;
  /** Point contribution to the predicted score (can be negative). */
  impact: number;
}

export interface Prediction {
  id?: string;
  userId?: string;
  /** The day the score is predicted FOR (typically tomorrow). */
  date: string;
  predictedScore: number;
  /** +/- confidence band, in recovery points. */
  confidence: number;
  /** Filled in once the actual Whoop recovery for `date` is known. */
  actualScore: number | null;
  baseline: number;
  factors: PredictionFactor[];
  modelVersion: string;
  createdAt?: string;
}

export interface Recommendation {
  key: string;
  title: string;
  detail: string;
  /** Potential points recoverable/gainable by acting on this. */
  impactPoints: number;
  priority: number;
}

export interface RecommendationLog {
  id?: string;
  userId?: string;
  date: string;
  actionKey: string;
  title: string;
  impactPoints: number;
  followed: boolean;
}

export interface Profile {
  id: string;
  fullName: string | null;
  timezone: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  onboardedAt: string | null;
  baselineRecovery: number | null;
}

export interface WhoopConnection {
  userId: string;
  whoopUserId: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  scopes: string | null;
}
