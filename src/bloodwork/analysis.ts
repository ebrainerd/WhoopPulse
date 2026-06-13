import { colors } from '@/theme/colors';
import type { BloodworkPanel } from '@/types/models';

import {
  evaluateMarker,
  getMarker,
  type MarkerStatus,
  type Suggestion,
} from './markers';

export interface Finding {
  key: string;
  label: string;
  value: number;
  unit: string;
  status: MarkerStatus;
  statusColor: string;
  optimalRange: string;
  summary: string;
  suggestions: Suggestion[];
}

export interface PanelAnalysis {
  findings: Finding[];
  flagged: Finding[];
  optimalCount: number;
  totalCount: number;
  /** Suggestions de-duplicated and grouped by type across all flagged markers. */
  groupedSuggestions: { type: string; items: string[] }[];
}

export function statusColor(status: MarkerStatus): string {
  switch (status) {
    case 'optimal':
      return colors.recoveryHigh;
    case 'borderline':
      return colors.recoveryMid;
    default:
      return colors.recoveryLow;
  }
}

function rangeLabel(low: number | null, high: number | null, unit: string): string {
  if (low != null && high != null) return `${low}–${high} ${unit}`;
  if (high != null) return `< ${high} ${unit}`;
  if (low != null) return `> ${low} ${unit}`;
  return '—';
}

const TYPE_LABELS: Record<string, string> = {
  supplement: 'Supplements',
  nutrition: 'Nutrition',
  exercise: 'Exercise',
  mindfulness: 'Mindfulness',
  lifestyle: 'Lifestyle',
};

export function analyzePanel(panel: BloodworkPanel): PanelAnalysis {
  const findings: Finding[] = [];

  for (const [key, value] of Object.entries(panel.markers)) {
    const def = getMarker(key);
    if (!def || value == null || Number.isNaN(value)) continue;
    const status = evaluateMarker(def, value);
    const advice =
      status === 'high'
        ? def.highAdvice
        : status === 'low' || status === 'borderline'
          ? (status === 'borderline' && value > (def.optimalHigh ?? Infinity)
              ? def.highAdvice
              : def.lowAdvice) ?? def.highAdvice
          : undefined;

    findings.push({
      key,
      label: def.label,
      value,
      unit: def.unit,
      status,
      statusColor: statusColor(status),
      optimalRange: rangeLabel(def.optimalLow, def.optimalHigh, def.unit),
      summary: advice?.summary ?? '',
      suggestions: status === 'optimal' ? [] : advice?.suggestions ?? [],
    });
  }

  // Sort: most concerning first.
  const order: Record<MarkerStatus, number> = {
    high: 0,
    low: 1,
    borderline: 2,
    optimal: 3,
  };
  findings.sort((a, b) => order[a.status] - order[b.status]);

  const flagged = findings.filter((f) => f.status !== 'optimal');
  const optimalCount = findings.length - flagged.length;

  // Group + dedupe suggestions across flagged markers.
  const byType = new Map<string, Set<string>>();
  for (const f of flagged) {
    for (const s of f.suggestions) {
      if (!byType.has(s.type)) byType.set(s.type, new Set());
      byType.get(s.type)!.add(s.text);
    }
  }
  const groupedSuggestions = Array.from(byType.entries()).map(([type, set]) => ({
    type: TYPE_LABELS[type] ?? type,
    items: Array.from(set),
  }));

  return {
    findings,
    flagged,
    optimalCount,
    totalCount: findings.length,
    groupedSuggestions,
  };
}
