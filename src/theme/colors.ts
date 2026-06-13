/**
 * Dark, minimal palette. Mirrors `tailwind.config.js` so non-className contexts
 * (SVG charts, navigation options, status bar) can use the same values.
 */
export const colors = {
  bg: '#0B0F14',
  bgElevated: '#121821',
  bgCard: '#161D27',
  bgInput: '#1C2530',
  border: '#243040',
  borderSubtle: '#1A2230',
  text: '#E7ECF2',
  textMuted: '#9AA7B6',
  textFaint: '#5E6B7A',
  accent: '#22D3EE',
  accentDim: '#0E7490',
  recoveryHigh: '#34D399',
  recoveryMid: '#FBBF24',
  recoveryLow: '#F87171',
} as const;

/** Whoop-style recovery color buckets: green >=67, yellow 34-66, red <34. */
export function recoveryColor(score: number | null | undefined): string {
  if (score == null) return colors.textFaint;
  if (score >= 67) return colors.recoveryHigh;
  if (score >= 34) return colors.recoveryMid;
  return colors.recoveryLow;
}

export function recoveryLabel(score: number | null | undefined): string {
  if (score == null) return 'No data';
  if (score >= 67) return 'High';
  if (score >= 34) return 'Moderate';
  return 'Low';
}
