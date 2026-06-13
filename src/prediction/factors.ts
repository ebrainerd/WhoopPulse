import type {
  JournalEntry,
  PredictionFactor,
  Recommendation,
  WeatherForecast,
  WhoopCycle,
} from '@/types/models';
import { timeToMinutes } from '@/utils/date';
import { clamp, round } from '@/utils/stats';

/**
 * Context passed to every rule. `baseline` is the recent recovery average that
 * factor impacts are added to.
 */
export interface PredictionContext {
  journal: JournalEntry;
  yesterdayCycle: WhoopCycle | null;
  weather: WeatherForecast | null;
  baseline: number;
}

interface RuleResult {
  /** Realized impact of this factor given the current journal (can be 0/null). */
  factor: PredictionFactor | null;
  /** An actionable suggestion to improve tomorrow's score, if one applies. */
  recommendation: Recommendation | null;
}

interface Rule {
  key: string;
  evaluate(ctx: PredictionContext): RuleResult;
}

const has = (arr: string[], v: string) => arr.includes(v);

/** Minutes-since-midnight helpers with sensible "late night" handling. */
const ALCOHOL_PER_DRINK = -6;
const ALCOHOL_CAP = -22;

export const RULES: Rule[] = [
  {
    key: 'alcohol',
    evaluate({ journal }) {
      const drinks = journal.alcoholDrinks ?? 0;
      const impact = clamp(drinks * ALCOHOL_PER_DRINK, ALCOHOL_CAP, 0);
      const factor =
        drinks > 0
          ? {
              key: 'alcohol',
              label: `Alcohol (${drinks} ${drinks === 1 ? 'drink' : 'drinks'})`,
              impact: round(impact),
            }
          : null;
      const recommendation =
        drinks > 0
          ? {
              key: 'alcohol',
              title: 'Skip alcohol tonight',
              detail:
                'Alcohol suppresses HRV and crushes deep sleep. Going dry tonight is the single biggest lever for tomorrow.',
              impactPoints: round(-impact),
              priority: 0,
            }
          : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'winddown',
    evaluate({ journal }) {
      const m = timeToMinutes(journal.winddownTime);
      if (m == null) return { factor: null, recommendation: null };
      const ideal = 22 * 60; // 22:00
      // Penalty for winding down late; small bonus for early.
      const impact = clamp(-(m - ideal) / 15, -8, 2);
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'winddown',
              label: m > ideal ? 'Late wind-down' : 'Early wind-down',
              impact: round(impact),
            }
          : null;
      const best = 2;
      const gain = best - impact;
      const recommendation =
        gain >= 1
          ? {
              key: 'winddown',
              title: 'Wind down by 10 PM',
              detail:
                'Start dimming lights and screens by 22:00 to protect slow-wave sleep and tomorrow’s recovery.',
              impactPoints: round(gain),
              priority: 1,
            }
          : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'work_stress',
    evaluate({ journal }) {
      const stress = journal.workStress ?? 3;
      const impact = clamp((3 - stress) * 2.5, -6, 5);
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'work_stress',
              label: stress >= 4 ? 'High work stress' : 'Low work stress',
              impact: round(impact),
            }
          : null;
      const gain = clamp(5 - impact, 0, 11);
      const recommendation =
        stress >= 4
          ? {
              key: 'work_stress',
              title: 'Down-regulate before bed',
              detail:
                'High stress keeps your sympathetic system online overnight. Try 10 min of slow breathing or a brain-dump, and front-load tomorrow’s hard meetings earlier.',
              impactPoints: round(gain),
              priority: 2,
            }
          : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'training_load',
    evaluate({ journal }) {
      const base: Record<string, number> = {
        legs: -3,
        pull: -2,
        push: -1.5,
        cardio: -1,
        active_recovery: 2,
        rest: 3,
      };
      const intensity = journal.trainingIntensity ?? 3;
      const b = base[journal.trainingType] ?? 0;
      // Strenuous sessions scale with intensity; recovery days are flat bonuses.
      const impact =
        b < 0 ? clamp(b * (intensity / 3), -7, 0) : b;
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'training_load',
              label: `Training: ${journal.trainingType.replace('_', ' ')}`,
              impact: round(impact),
            }
          : null;
      // Recommend a lighter day only when today's load is heavy.
      const recommendation =
        impact <= -4
          ? {
              key: 'training_load',
              title: 'Consider active recovery tomorrow',
              detail:
                'You logged a heavy session. Swapping tomorrow’s hard day for mobility or zone-2 cardio lets adaptation catch up.',
              impactPoints: round(2 - impact),
              priority: 3,
            }
          : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'creatine',
    evaluate({ journal }) {
      const taken = journal.creatine || has(journal.supplements, 'creatine');
      const impact = taken ? 3 : 0;
      const factor = taken
        ? { key: 'creatine', label: 'Creatine', impact }
        : null;
      const recommendation = !taken
        ? {
            key: 'creatine',
            title: 'Take 5g creatine',
            detail:
              'Daily creatine supports cellular hydration and recovery — keep the streak going.',
            impactPoints: 3,
            priority: 5,
          }
        : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'magnesium',
    evaluate({ journal }) {
      const taken = has(journal.supplements, 'magnesium');
      const impact = taken ? 2 : 0;
      const factor = taken
        ? { key: 'magnesium', label: 'Magnesium', impact }
        : null;
      const recommendation = !taken
        ? {
            key: 'magnesium',
            title: 'Add magnesium glycinate before bed',
            detail:
              'Magnesium supports parasympathetic tone and deeper sleep, nudging HRV up overnight.',
            impactPoints: 2,
            priority: 6,
          }
        : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'hydration',
    evaluate({ journal }) {
      const l = journal.waterLiters;
      if (l == null) return { factor: null, recommendation: null };
      let impact = 0;
      if (l >= 3) impact = 1;
      else if (l < 1.5) impact = -2;
      const factor =
        impact !== 0
          ? {
              key: 'hydration',
              label: l < 1.5 ? 'Under-hydrated' : 'Well hydrated',
              impact,
            }
          : null;
      const recommendation =
        l < 2.5
          ? {
              key: 'hydration',
              title: 'Hydrate with electrolytes',
              detail:
                'Aim for ~3L water plus electrolytes today; under-hydration elevates resting heart rate overnight.',
              impactPoints: l < 1.5 ? 3 : 1,
              priority: 7,
            }
          : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'late_meal',
    evaluate({ journal }) {
      const m = timeToMinutes(journal.lastMealTime);
      const fasting = journal.fastingHours;
      let impact = 0;
      if (m != null) {
        const cutoff = 21 * 60; // 21:00
        if (m > cutoff) impact -= clamp((m - cutoff) / 20, 0, 4);
      }
      if (fasting != null) {
        if (fasting >= 16) impact += 3;
        else if (fasting >= 14) impact += 2;
      }
      impact = clamp(impact, -4, 3);
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'late_meal',
              label: impact < 0 ? 'Late last meal' : 'Good fasting window',
              impact: round(impact),
            }
          : null;
      const recommendation =
        m != null && m > 21 * 60
          ? {
              key: 'late_meal',
              title: 'Finish eating by 8 PM',
              detail:
                'An earlier last meal lets core temperature drop for sleep. Target a 14–16h overnight fast into a noon break-fast.',
              impactPoints: round(clamp(2 - impact, 1, 6)),
              priority: 4,
            }
          : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'caffeine',
    evaluate({ journal }) {
      const late = journal.caffeineAfter2pm;
      const impact = late ? -3 : 0;
      const factor = late
        ? { key: 'caffeine', label: 'Late caffeine', impact }
        : null;
      const recommendation = late
        ? {
            key: 'caffeine',
            title: 'Cut off caffeine by 2 PM',
            detail:
              'Caffeine’s 6h half-life means an afternoon coffee is still active at bedtime, fragmenting deep sleep.',
            impactPoints: 3,
            priority: 4,
          }
        : null;
      return { factor, recommendation };
    },
  },
  {
    key: 'readiness',
    evaluate({ journal }) {
      const energy = journal.energy ?? 3;
      const mood = journal.mood ?? 3;
      const impact = clamp(((energy + mood) / 2 - 3) * 1.5, -4, 4);
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'readiness',
              label: impact >= 0 ? 'Good energy & mood' : 'Low energy & mood',
              impact: round(impact),
            }
          : null;
      return { factor, recommendation: null };
    },
  },
  {
    key: 'yesterday_strain',
    evaluate({ yesterdayCycle }) {
      if (!yesterdayCycle || yesterdayCycle.dayStrain == null) {
        return { factor: null, recommendation: null };
      }
      const strain = yesterdayCycle.dayStrain;
      const impact = clamp(-(strain - 10) * 0.6, -6, 3);
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'yesterday_strain',
              label: `Recent strain ${strain.toFixed(1)}`,
              impact: round(impact),
            }
          : null;
      return { factor, recommendation: null };
    },
  },
  {
    key: 'weather',
    evaluate({ weather }) {
      if (!weather || weather.overnightLowC == null) {
        return { factor: null, recommendation: null };
      }
      const low = weather.overnightLowC;
      // Ideal sleeping ambient ~18-19C. Warmer nights hurt sleep more.
      let impact = -clamp((low - 19) * 0.8, 0, 4);
      if (low >= 15 && low <= 20) impact += 1;
      impact = clamp(impact, -4, 1);
      const factor =
        Math.abs(impact) >= 0.5
          ? {
              key: 'weather',
              label:
                low > 20 ? 'Warm overnight forecast' : 'Cool overnight forecast',
              impact: round(impact),
            }
          : null;
      const recommendation =
        low > 20
          ? {
              key: 'weather',
              title: 'Keep the bedroom cool (<68°F)',
              detail: `Tonight’s low is forecast around ${Math.round(
                (low * 9) / 5 + 32,
              )}°F. Pre-cool the room or run a fan to protect deep sleep.`,
              impactPoints: round(-impact + 1),
              priority: 2,
            }
          : null;
      return { factor, recommendation };
    },
  },
];

export function evaluateRules(ctx: PredictionContext): {
  factors: PredictionFactor[];
  recommendations: Recommendation[];
} {
  const factors: PredictionFactor[] = [];
  const recommendations: Recommendation[] = [];
  for (const rule of RULES) {
    const { factor, recommendation } = rule.evaluate(ctx);
    if (factor && factor.impact !== 0) factors.push(factor);
    if (recommendation && recommendation.impactPoints > 0) {
      recommendations.push(recommendation);
    }
  }
  return { factors, recommendations };
}
