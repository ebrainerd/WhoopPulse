/** Display formatting helpers. */

export function formatMinutesAsHm(min: number | null | undefined): string {
  if (min == null) return '—';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}

export function signed(n: number, decimals = 0): string {
  const v = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
  return n > 0 ? `+${v}` : v;
}

export function num(value: number | null | undefined, suffix = ''): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}${suffix}`;
}

export function decimal(
  value: number | null | undefined,
  decimals = 1,
  suffix = '',
): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}${suffix}`;
}

export function cToF(c: number | null | undefined): number | null {
  if (c == null) return null;
  return (c * 9) / 5 + 32;
}
