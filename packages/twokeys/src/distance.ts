/**
 * Vector Distance & Similarity Functions
 *
 * Standalone functions for vector math — zero dependencies.
 * These are the workhorses that Points, graph algorithms, and consumers all use.
 */

// ── Dense vector operations ──────────────────────────────────────────

/**
 * Cosine similarity between two dense vectors.
 * Returns a value in [-1, 1] where 1 means identical direction.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i += 1) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

/**
 * Squared Euclidean distance between two dense vectors.
 * Avoids the sqrt for performance-sensitive comparisons.
 */
export function squaredEuclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const delta = (a[i] ?? 0) - (b[i] ?? 0);
    sum += delta * delta;
  }
  return sum;
}

/**
 * Euclidean (L2) distance between two dense vectors.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(squaredEuclideanDistance(a, b));
}

/**
 * Manhattan (L1) distance between two dense vectors.
 */
export function manhattanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    sum += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
  }
  return sum;
}

/**
 * Mahalanobis distance of a point from a distribution described by
 * per-dimension means and variances.
 *
 * This is the diagonal-covariance special case (dimensions are independent),
 * which is what most embedding-space consumers need.
 *
 * d = sqrt( Σ (x_i - μ_i)² / max(σ²_i, ε) )
 */
export function mahalanobisDistance(
  point: number[],
  means: number[],
  variances: number[],
  epsilon: number = 1e-8,
): number {
  const len = Math.min(point.length, means.length, variances.length);
  if (len === 0) return 0;

  let sum = 0;
  for (let i = 0; i < len; i += 1) {
    const delta = (point[i] ?? 0) - (means[i] ?? 0);
    const variance = Math.max(variances[i] ?? 0, epsilon);
    sum += (delta * delta) / variance;
  }
  return Math.sqrt(sum);
}

/**
 * L2-normalize a dense vector (unit vector in same direction).
 * Returns the zero vector if the input has zero magnitude.
 */
export function normalizeL2(vector: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vector.length; i += 1) {
    const v = vector[i] ?? 0;
    sumSq += v * v;
  }
  const mag = Math.sqrt(sumSq);
  if (mag === 0) return vector.map(() => 0);
  return vector.map((v) => (v ?? 0) / mag);
}

// ── Sparse vector operations ─────────────────────────────────────────

/**
 * Cosine similarity between two sparse vectors represented as Map<string, number>.
 */
export function cosineSimilaritySparse(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  // Iterate over the smaller map for efficiency
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];

  for (const [key, val] of small) {
    const other = large.get(key);
    if (other !== undefined) {
      dot += val * other;
    }
    magA += val * val;
  }

  for (const val of large.values()) {
    magB += val * val;
  }

  // If we iterated the smaller as `a`, magA is correct.
  // If we swapped, magA holds the smaller's magnitude and magB holds the larger's.
  // Since cosine similarity is symmetric, the result is the same.

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

// ── Set operations ───────────────────────────────────────────────────

/**
 * Jaccard similarity between two sets: |A ∩ B| / |A ∪ B|.
 * Returns 0 for empty sets.
 */
export function jaccardSimilarity<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) {
      intersection += 1;
    }
  }

  const union = a.size + b.size - intersection;
  if (union <= 0) return 0;
  return intersection / union;
}

/**
 * Overlap coefficient: |A ∩ B| / min(|A|, |B|).
 * Returns 0 for empty sets.
 */
export function overlapCoefficient<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) {
      intersection += 1;
    }
  }

  const minSize = Math.min(a.size, b.size);
  if (minSize <= 0) return 0;
  return intersection / minSize;
}
