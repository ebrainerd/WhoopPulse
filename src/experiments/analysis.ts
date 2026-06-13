import type { Experiment, JournalEntry, WhoopCycle } from '@/types/models';
import { addDaysKey, todayKey } from '@/utils/date';
import { mean, round } from '@/utils/stats';

import { getCondition } from './conditions';

export interface ExperimentResult {
  conditionTitle: string;
  /** Days within the window that adhered to the protocol. */
  adherentDays: number;
  /** Days within the window that had a journal entry. */
  loggedDays: number;
  totalWindowDays: number;
  daysElapsed: number;
  daysRemaining: number;
  adherencePct: number;
  /** Avg next-day recovery on adherent days during the window. */
  onProtocolRecovery: number | null;
  /** Avg next-day recovery on the 14 days before the experiment started. */
  baselineRecovery: number | null;
  /** onProtocolRecovery − baselineRecovery. */
  delta: number | null;
  verdict: string;
}

function diffDays(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function analyzeExperiment(
  exp: Experiment,
  journals: JournalEntry[],
  cycles: WhoopCycle[],
): ExperimentResult {
  const condition = getCondition(exp.conditionKey);
  const recoveryByDate = new Map<string, number>();
  for (const c of cycles) {
    if (c.recoveryScore != null) recoveryByDate.set(c.date, c.recoveryScore);
  }
  const nextRecovery = (date: string) => recoveryByDate.get(addDaysKey(date, 1));

  const end = exp.endDate ?? todayKey();
  const totalWindowDays = exp.targetDays;
  const daysElapsed = Math.max(0, diffDays(exp.startDate, end) + 1);
  const daysRemaining = Math.max(0, totalWindowDays - daysElapsed);

  const inWindow = (d: string) => d >= exp.startDate && d <= end;
  const windowJournals = journals.filter((j) => inWindow(j.date));

  const onVals: number[] = [];
  let adherentDays = 0;
  for (const j of windowJournals) {
    const adhered = condition ? condition.predicate(j) : false;
    if (adhered) {
      adherentDays += 1;
      const r = nextRecovery(j.date);
      if (r != null) onVals.push(r);
    }
  }

  // Baseline: next-day recovery over the 14 days before the experiment start.
  const baseStart = addDaysKey(exp.startDate, -14);
  const baseVals: number[] = [];
  for (const j of journals) {
    if (j.date >= baseStart && j.date < exp.startDate) {
      const r = nextRecovery(j.date);
      if (r != null) baseVals.push(r);
    }
  }

  const onProtocolRecovery = onVals.length ? round(mean(onVals), 1) : null;
  const baselineRecovery = baseVals.length ? round(mean(baseVals), 1) : null;
  const delta =
    onProtocolRecovery != null && baselineRecovery != null
      ? round(onProtocolRecovery - baselineRecovery, 1)
      : null;

  const loggedDays = windowJournals.length;
  const adherencePct = loggedDays ? round((adherentDays / loggedDays) * 100, 0) : 0;

  let verdict: string;
  if (onVals.length < 3 || baselineRecovery == null) {
    verdict = 'Gathering data — keep logging to reach a verdict.';
  } else if (delta != null && delta >= 3) {
    verdict = `Working: +${delta} pts vs your baseline.`;
  } else if (delta != null && delta <= -3) {
    verdict = `Hurting: ${delta} pts vs your baseline.`;
  } else {
    verdict = 'No clear effect so far.';
  }

  return {
    conditionTitle: condition?.title ?? exp.conditionKey,
    adherentDays,
    loggedDays,
    totalWindowDays,
    daysElapsed,
    daysRemaining,
    adherencePct,
    onProtocolRecovery,
    baselineRecovery,
    delta,
    verdict,
  };
}
