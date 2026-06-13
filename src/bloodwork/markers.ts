/**
 * Bloodwork marker catalog with general optimal ranges and lifestyle guidance.
 *
 * IMPORTANT: ranges are general adult guidance for educational use and are not
 * medical advice. Always interpret labs with a qualified clinician.
 */

export type SuggestionType =
  | 'supplement'
  | 'nutrition'
  | 'exercise'
  | 'mindfulness'
  | 'lifestyle';

export interface Suggestion {
  type: SuggestionType;
  text: string;
}

export type MarkerStatus = 'low' | 'optimal' | 'borderline' | 'high';

export interface MarkerDef {
  key: string;
  label: string;
  unit: string;
  category: string;
  decimals: number;
  /** Optimal band. Values below `optimalLow` are low; above `optimalHigh` high. */
  optimalLow: number | null;
  optimalHigh: number | null;
  /** Optional borderline thresholds for nuance. */
  borderlineHigh?: number;
  borderlineLow?: number;
  lowAdvice?: { summary: string; suggestions: Suggestion[] };
  highAdvice?: { summary: string; suggestions: Suggestion[] };
}

export const BLOODWORK_DISCLAIMER =
  'Educational guidance only — not medical advice. Discuss results with a clinician.';

export const MARKERS: MarkerDef[] = [
  {
    key: 'vitamin_d',
    label: 'Vitamin D (25-OH)',
    unit: 'ng/mL',
    category: 'Vitamins & Minerals',
    decimals: 0,
    optimalLow: 40,
    optimalHigh: 60,
    borderlineLow: 30,
    lowAdvice: {
      summary: 'Low vitamin D impairs recovery, immunity, and testosterone.',
      suggestions: [
        { type: 'supplement', text: 'Vitamin D3 2,000–5,000 IU/day with K2 and a fat-containing meal.' },
        { type: 'lifestyle', text: 'Get 15–20 min of midday sun on skin a few times a week.' },
        { type: 'nutrition', text: 'Add fatty fish (salmon, sardines) and egg yolks.' },
      ],
    },
    highAdvice: {
      summary: 'Very high vitamin D can cause calcium issues.',
      suggestions: [{ type: 'supplement', text: 'Reduce/pause D3 supplementation and recheck.' }],
    },
  },
  {
    key: 'ferritin',
    label: 'Ferritin',
    unit: 'ng/mL',
    category: 'Vitamins & Minerals',
    decimals: 0,
    optimalLow: 50,
    optimalHigh: 150,
    borderlineHigh: 300,
    lowAdvice: {
      summary: 'Low iron stores cause fatigue and poor recovery.',
      suggestions: [
        { type: 'nutrition', text: 'Eat red meat, liver, lentils; pair plant iron with vitamin C.' },
        { type: 'supplement', text: 'Consider iron bisglycinate (only if confirmed low).' },
      ],
    },
    highAdvice: {
      summary: 'High ferritin can signal inflammation or iron overload.',
      suggestions: [
        { type: 'lifestyle', text: 'Reduce alcohol; donate blood if iron overload is confirmed.' },
        { type: 'nutrition', text: 'Avoid iron supplements and limit heme-iron excess.' },
      ],
    },
  },
  {
    key: 'b12',
    label: 'Vitamin B12',
    unit: 'pg/mL',
    category: 'Vitamins & Minerals',
    decimals: 0,
    optimalLow: 500,
    optimalHigh: 900,
    lowAdvice: {
      summary: 'Low B12 affects energy, nerves, and homocysteine.',
      suggestions: [
        { type: 'supplement', text: 'Methylcobalamin B12; add a B-complex if also low folate.' },
        { type: 'nutrition', text: 'Eggs, fish, meat, dairy; nutritional yeast if plant-based.' },
      ],
    },
  },
  {
    key: 'magnesium_rbc',
    label: 'Magnesium (RBC)',
    unit: 'mg/dL',
    category: 'Vitamins & Minerals',
    decimals: 1,
    optimalLow: 5,
    optimalHigh: 6.8,
    lowAdvice: {
      summary: 'Low magnesium worsens sleep, HRV, and muscle recovery.',
      suggestions: [
        { type: 'supplement', text: 'Magnesium glycinate 200–400 mg before bed.' },
        { type: 'nutrition', text: 'Leafy greens, pumpkin seeds, dark chocolate, almonds.' },
        { type: 'mindfulness', text: 'Pairs well with a wind-down/breathing routine for deeper sleep.' },
      ],
    },
  },
  {
    key: 'omega3_index',
    label: 'Omega-3 Index',
    unit: '%',
    category: 'Vitamins & Minerals',
    decimals: 1,
    optimalLow: 8,
    optimalHigh: 12,
    borderlineLow: 4,
    lowAdvice: {
      summary: 'Low omega-3 index is linked to higher inflammation.',
      suggestions: [
        { type: 'supplement', text: 'EPA/DHA fish oil 1–2 g/day.' },
        { type: 'nutrition', text: 'Eat fatty fish 2–3×/week; reduce seed-oil intake.' },
      ],
    },
  },
  {
    key: 'testosterone_total',
    label: 'Total Testosterone',
    unit: 'ng/dL',
    category: 'Hormones',
    decimals: 0,
    optimalLow: 600,
    optimalHigh: 1000,
    borderlineLow: 400,
    lowAdvice: {
      summary: 'Lower testosterone reduces recovery, drive, and muscle.',
      suggestions: [
        { type: 'exercise', text: 'Prioritize heavy compound lifts; avoid chronic overtraining.' },
        { type: 'lifestyle', text: 'Protect 7–9 h sleep; limit alcohol; manage body fat.' },
        { type: 'supplement', text: 'Optimize vitamin D, zinc, and magnesium if low.' },
        { type: 'mindfulness', text: 'Lower chronic stress (cortisol suppresses testosterone).' },
      ],
    },
  },
  {
    key: 'free_testosterone',
    label: 'Free Testosterone',
    unit: 'pg/mL',
    category: 'Hormones',
    decimals: 1,
    optimalLow: 15,
    optimalHigh: 25,
    lowAdvice: {
      summary: 'Low free testosterone can stem from high SHBG or low total T.',
      suggestions: [
        { type: 'lifestyle', text: 'Improve sleep and reduce alcohol; manage insulin/body fat.' },
        { type: 'exercise', text: 'Resistance training + adequate protein.' },
      ],
    },
  },
  {
    key: 'cortisol_am',
    label: 'Cortisol (AM)',
    unit: 'µg/dL',
    category: 'Hormones',
    decimals: 1,
    optimalLow: 10,
    optimalHigh: 18,
    borderlineHigh: 20,
    highAdvice: {
      summary: 'Elevated morning cortisol points to stress load affecting recovery.',
      suggestions: [
        { type: 'mindfulness', text: 'Daily breathwork/meditation; 10 min slow nasal breathing.' },
        { type: 'lifestyle', text: 'Earlier wind-down, consistent sleep, limit late caffeine.' },
        { type: 'exercise', text: 'Favor zone-2 cardio and walks over excess high-intensity work.' },
      ],
    },
    lowAdvice: {
      summary: 'Low morning cortisol can indicate adrenal fatigue/over-reaching.',
      suggestions: [
        { type: 'lifestyle', text: 'Deload training; prioritize sleep and recovery.' },
      ],
    },
  },
  {
    key: 'tsh',
    label: 'TSH',
    unit: 'mIU/L',
    category: 'Thyroid',
    decimals: 2,
    optimalLow: 0.5,
    optimalHigh: 2.0,
    borderlineHigh: 2.5,
    highAdvice: {
      summary: 'Higher TSH may indicate an underactive thyroid (fatigue, cold).',
      suggestions: [
        { type: 'nutrition', text: 'Ensure adequate iodine, selenium, and zinc.' },
        { type: 'lifestyle', text: 'Discuss thyroid panel (free T3/T4) with a clinician.' },
      ],
    },
  },
  {
    key: 'hscrp',
    label: 'hs-CRP',
    unit: 'mg/L',
    category: 'Inflammation',
    decimals: 2,
    optimalLow: null,
    optimalHigh: 1.0,
    borderlineHigh: 3.0,
    highAdvice: {
      summary: 'Elevated hs-CRP signals systemic inflammation that blunts recovery.',
      suggestions: [
        { type: 'nutrition', text: 'Anti-inflammatory diet: omega-3s, polyphenols; cut refined carbs.' },
        { type: 'lifestyle', text: 'Reduce alcohol, improve sleep, manage visceral fat.' },
        { type: 'exercise', text: 'Consistent zone-2 cardio; avoid overtraining spikes.' },
        { type: 'mindfulness', text: 'Stress reduction lowers inflammatory tone.' },
      ],
    },
  },
  {
    key: 'homocysteine',
    label: 'Homocysteine',
    unit: 'µmol/L',
    category: 'Inflammation',
    decimals: 1,
    optimalLow: null,
    optimalHigh: 8,
    borderlineHigh: 10,
    highAdvice: {
      summary: 'High homocysteine relates to low B vitamins and cardiovascular risk.',
      suggestions: [
        { type: 'supplement', text: 'Methylated B-complex (B12, folate, B6).' },
        { type: 'nutrition', text: 'Leafy greens, legumes; reduce alcohol.' },
      ],
    },
  },
  {
    key: 'hba1c',
    label: 'HbA1c',
    unit: '%',
    category: 'Metabolic',
    decimals: 1,
    optimalLow: null,
    optimalHigh: 5.4,
    borderlineHigh: 5.7,
    highAdvice: {
      summary: 'Rising HbA1c reflects higher average blood sugar.',
      suggestions: [
        { type: 'nutrition', text: 'Reduce refined carbs/sugar; prioritize protein and fiber.' },
        { type: 'lifestyle', text: 'Time-restricted eating; post-meal walks.' },
        { type: 'exercise', text: 'Add resistance training to improve insulin sensitivity.' },
      ],
    },
  },
  {
    key: 'glucose_fasting',
    label: 'Fasting Glucose',
    unit: 'mg/dL',
    category: 'Metabolic',
    decimals: 0,
    optimalLow: 70,
    optimalHigh: 90,
    borderlineHigh: 100,
    highAdvice: {
      summary: 'Elevated fasting glucose suggests reduced insulin sensitivity.',
      suggestions: [
        { type: 'nutrition', text: 'Lower refined carbs; protein/fat first; extend overnight fast.' },
        { type: 'exercise', text: 'Walk after meals; resistance + zone-2 training.' },
      ],
    },
  },
  {
    key: 'ldl',
    label: 'LDL Cholesterol',
    unit: 'mg/dL',
    category: 'Lipids',
    decimals: 0,
    optimalLow: null,
    optimalHigh: 100,
    borderlineHigh: 130,
    highAdvice: {
      summary: 'Elevated LDL is a cardiovascular risk factor to address.',
      suggestions: [
        { type: 'nutrition', text: 'Increase soluble fiber (oats, beans); reduce saturated/trans fat.' },
        { type: 'exercise', text: 'Regular aerobic exercise.' },
        { type: 'lifestyle', text: 'Discuss risk and options with a clinician.' },
      ],
    },
  },
  {
    key: 'hdl',
    label: 'HDL Cholesterol',
    unit: 'mg/dL',
    category: 'Lipids',
    decimals: 0,
    optimalLow: 55,
    optimalHigh: 90,
    borderlineLow: 40,
    lowAdvice: {
      summary: 'Low HDL is associated with higher cardiovascular risk.',
      suggestions: [
        { type: 'exercise', text: 'Aerobic exercise and HIIT raise HDL.' },
        { type: 'nutrition', text: 'Olive oil, nuts, fatty fish; reduce refined carbs.' },
      ],
    },
  },
  {
    key: 'triglycerides',
    label: 'Triglycerides',
    unit: 'mg/dL',
    category: 'Lipids',
    decimals: 0,
    optimalLow: null,
    optimalHigh: 90,
    borderlineHigh: 150,
    highAdvice: {
      summary: 'High triglycerides usually track with sugar/alcohol and insulin resistance.',
      suggestions: [
        { type: 'nutrition', text: 'Cut sugar, refined carbs, and alcohol.' },
        { type: 'supplement', text: 'Omega-3 (EPA/DHA) can lower triglycerides.' },
        { type: 'exercise', text: 'Aerobic training and fasting windows help.' },
      ],
    },
  },
];

export function getMarker(key: string): MarkerDef | undefined {
  return MARKERS.find((m) => m.key === key);
}

export function evaluateMarker(def: MarkerDef, value: number): MarkerStatus {
  if (def.optimalHigh != null && value > def.optimalHigh) {
    if (def.borderlineHigh != null && value <= def.borderlineHigh) return 'borderline';
    return 'high';
  }
  if (def.optimalLow != null && value < def.optimalLow) {
    if (def.borderlineLow != null && value >= def.borderlineLow) return 'borderline';
    return 'low';
  }
  return 'optimal';
}
