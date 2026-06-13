/** Minimal linear-algebra helpers for small dense matrices (ridge regression). */

export type Matrix = number[][];

export function transpose(a: Matrix): Matrix {
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  const t: Matrix = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) t[j][i] = a[i][j];
  return t;
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  const n = a.length;
  const m = b[0]?.length ?? 0;
  const k = b.length;
  const out: Matrix = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let p = 0; p < k; p++) {
      const aip = a[i][p];
      if (aip === 0) continue;
      for (let j = 0; j < m; j++) out[i][j] += aip * b[p][j];
    }
  return out;
}

export function matVec(a: Matrix, v: number[]): number[] {
  return a.map((row) => row.reduce((acc, x, j) => acc + x * v[j], 0));
}

export function identity(n: number, scale = 1): Matrix {
  const out: Matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) out[i][i] = scale;
  return out;
}

export function addInPlace(a: Matrix, b: Matrix): Matrix {
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a[i].length; j++) a[i][j] += b[i][j];
  return a;
}

/**
 * Inverts a square matrix via Gauss-Jordan elimination with partial pivoting.
 * Returns null if the matrix is singular.
 */
export function invert(a: Matrix): Matrix | null {
  const n = a.length;
  const m = a.map((row, i) => [...row, ...identity(n)[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    }
    if (Math.abs(m[pivot][col]) < 1e-12) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];

    const pv = m[col][col];
    for (let j = 0; j < 2 * n; j++) m[col][j] /= pv;

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = m[r][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) m[r][j] -= factor * m[col][j];
    }
  }

  return m.map((row) => row.slice(n));
}
