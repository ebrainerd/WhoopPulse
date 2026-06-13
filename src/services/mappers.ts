import type { Database } from '@/types/database';
import type {
  BloodworkPanel,
  Experiment,
  ExperimentStatus,
  Fast,
  JournalEntry,
  Prediction,
  PredictionFactor,
  Profile,
  TrainingType,
  WeatherForecast,
  WhoopCycle,
} from '@/types/models';

type Tables = Database['public']['Tables'];

export function mapJournalRow(row: Tables['journal_entries']['Row']): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    alcoholDrinks: row.alcohol_drinks,
    lastMealTime: row.last_meal_time,
    fastingHours: row.fasting_hours,
    creatine: row.creatine,
    supplements: row.supplements ?? [],
    energy: row.energy,
    mood: row.mood,
    trainingType: row.training_type as TrainingType,
    trainingIntensity: row.training_intensity,
    trainingNotes: row.training_notes,
    workStress: row.work_stress,
    winddownTime: row.winddown_time,
    waterLiters: row.water_liters,
    caffeineAfter2pm: row.caffeine_after_2pm,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function journalToInsert(
  userId: string,
  j: JournalEntry,
): Tables['journal_entries']['Insert'] {
  return {
    user_id: userId,
    date: j.date,
    alcohol_drinks: j.alcoholDrinks,
    last_meal_time: j.lastMealTime,
    fasting_hours: j.fastingHours,
    creatine: j.creatine,
    supplements: j.supplements,
    energy: j.energy,
    mood: j.mood,
    training_type: j.trainingType,
    training_intensity: j.trainingIntensity,
    training_notes: j.trainingNotes,
    work_stress: j.workStress,
    winddown_time: j.winddownTime,
    water_liters: j.waterLiters,
    caffeine_after_2pm: j.caffeineAfter2pm,
    notes: j.notes,
  };
}

export function mapCycleRow(row: Tables['whoop_cycles']['Row']): WhoopCycle {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    recoveryScore: row.recovery_score,
    hrvMs: row.hrv_ms,
    rhrBpm: row.rhr_bpm,
    skinTempC: row.skin_temp_c,
    spo2: row.spo2,
    restingCalories: row.resting_calories,
    dayStrain: row.day_strain,
    sleepPerformance: row.sleep_performance,
    sleepDurationMin: row.sleep_duration_min,
    sleepEfficiency: row.sleep_efficiency,
    sleepConsistency: row.sleep_consistency,
    respiratoryRate: row.respiratory_rate,
    raw: row.raw,
  };
}

export function mapPredictionRow(row: Tables['predictions']['Row']): Prediction {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    predictedScore: row.predicted_score,
    confidence: row.confidence,
    actualScore: row.actual_score,
    baseline: row.baseline,
    factors: (row.factors as unknown as PredictionFactor[]) ?? [],
    modelVersion: row.model_version,
    createdAt: row.created_at,
  };
}

export function predictionToInsert(
  userId: string,
  p: Prediction,
): Tables['predictions']['Insert'] {
  return {
    user_id: userId,
    date: p.date,
    predicted_score: p.predictedScore,
    confidence: p.confidence,
    actual_score: p.actualScore,
    baseline: p.baseline,
    factors: p.factors as unknown as Database['public']['Tables']['predictions']['Insert']['factors'],
    model_version: p.modelVersion,
  };
}

export function mapProfileRow(row: Tables['profiles']['Row']): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    timezone: row.timezone,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    locationName: row.location_name,
    onboardedAt: row.onboarded_at,
    baselineRecovery: row.baseline_recovery,
  };
}

export function mapExperimentRow(
  row: Tables['experiments']['Row'],
): Experiment {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    hypothesis: row.hypothesis,
    conditionKey: row.condition_key,
    startDate: row.start_date,
    endDate: row.end_date,
    targetDays: row.target_days,
    status: row.status as ExperimentStatus,
    resultSummary: row.result_summary,
    createdAt: row.created_at,
  };
}

export function mapFastRow(row: Tables['fasts']['Row']): Fast {
  return {
    id: row.id,
    userId: row.user_id,
    startAt: row.start_at,
    endAt: row.end_at,
    targetHours: row.target_hours,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function mapBloodworkRow(
  row: Tables['bloodwork_panels']['Row'],
): BloodworkPanel {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    markers: (row.markers as Record<string, number>) ?? {},
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapWeatherRow(
  row: Tables['weather_daily']['Row'],
): WeatherForecast {
  return {
    date: row.date,
    tempMinC: row.temp_min_c,
    tempMaxC: row.temp_max_c,
    overnightLowC: row.overnight_low_c,
    precipitationMm: row.precipitation_mm,
    windKph: row.wind_kph,
    description: row.description,
  };
}
