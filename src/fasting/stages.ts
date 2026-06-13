/**
 * Approximate metabolic stages of a fast. Hour thresholds are general guidance
 * (they vary by individual, last meal, and activity), not medical advice.
 */
export interface FastStage {
  /** Hours since the fast started when this stage begins. */
  startHour: number;
  name: string;
  description: string;
  color: string;
}

export const FAST_STAGES: FastStage[] = [
  {
    startHour: 0,
    name: 'Fed / Anabolic',
    description:
      'Blood sugar and insulin rise as you digest your last meal. Energy is stored.',
    color: '#60A5FA',
  },
  {
    startHour: 4,
    name: 'Post-absorptive',
    description:
      'Digestion completes; blood sugar and insulin start to fall back toward baseline.',
    color: '#34D399',
  },
  {
    startHour: 8,
    name: 'Glycogen burning',
    description:
      'The body taps liver glycogen for fuel. Insulin is low and fat-burning begins.',
    color: '#22D3EE',
  },
  {
    startHour: 12,
    name: 'Fat burning / ketosis onset',
    description:
      'Glycogen runs low and you shift to burning fat, producing ketones.',
    color: '#A78BFA',
  },
  {
    startHour: 16,
    name: 'Ketosis & early autophagy',
    description:
      'Ketones rise and cellular cleanup (autophagy) begins to ramp up.',
    color: '#F59E0B',
  },
  {
    startHour: 18,
    name: 'Autophagy + growth hormone',
    description:
      'Autophagy increases and growth hormone rises to preserve lean mass.',
    color: '#FB923C',
  },
  {
    startHour: 24,
    name: 'Deep autophagy & BDNF',
    description:
      'Sustained autophagy; BDNF (brain health) rises. A full day fasted.',
    color: '#F87171',
  },
  {
    startHour: 48,
    name: 'Immune reset',
    description:
      'Extended fast: stem-cell and immune renewal. Advanced — proceed carefully.',
    color: '#EC4899',
  },
];

export interface FastProgress {
  elapsedHours: number;
  elapsedLabel: string;
  current: FastStage;
  currentIndex: number;
  next: FastStage | null;
  hoursToNext: number | null;
  /** Progress toward the target, 0..1. */
  targetPct: number;
  reachedTarget: boolean;
}

export function computeFastProgress(
  startAt: string,
  targetHours: number,
  now: Date = new Date(),
): FastProgress {
  const elapsedMs = now.getTime() - new Date(startAt).getTime();
  const elapsedHours = Math.max(0, elapsedMs / 3_600_000);

  let currentIndex = 0;
  for (let i = 0; i < FAST_STAGES.length; i++) {
    if (elapsedHours >= FAST_STAGES[i].startHour) currentIndex = i;
  }
  const current = FAST_STAGES[currentIndex];
  const next = FAST_STAGES[currentIndex + 1] ?? null;
  const hoursToNext = next ? round1(next.startHour - elapsedHours) : null;

  return {
    elapsedHours,
    elapsedLabel: formatDuration(elapsedMs),
    current,
    currentIndex,
    next,
    hoursToNext,
    targetPct: targetHours > 0 ? Math.min(1, elapsedHours / targetHours) : 0,
    reachedTarget: elapsedHours >= targetHours,
  };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(
    s,
  ).padStart(2, '0')}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export const FAST_TARGET_OPTIONS = [13, 16, 18, 20, 24, 36];
