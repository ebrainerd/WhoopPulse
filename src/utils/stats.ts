/** Small dependency-free statistics helpers used by the prediction engine. */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Exponentially weighted average — more recent values (later in the array)
 * count more. `alpha` in (0,1]; higher = more responsive to recent data.
 */
export function ewma(values: number[], alpha = 0.35): number {
  if (values.length === 0) return 0;
  let acc = values[0];
  for (let i = 1; i < values.length; i++) {
    acc = alpha * values[i] + (1 - alpha) * acc;
  }
  return acc;
}

/**
 * Pearson correlation coefficient between two equal-length series.
 * Returns 0 when undefined (constant series or <2 points).
 */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

/** Mean absolute error between paired predictions and actuals. */
export function meanAbsoluteError(predicted: number[], actual: number[]): number {
  const n = Math.min(predicted.length, actual.length);
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs(predicted[i] - actual[i]);
  return sum / n;
}

/**
 * Ordinary least-squares simple linear regression: y = slope * x + intercept.
 */
export function linearRegression(
  xs: number[],
  ys: number[],
): { slope: number; intercept: number } {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { slope: 0, intercept: mean(ys) };
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}
