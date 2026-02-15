import { describe, test, expect } from 'bun:test';
import {
  // WASM management
  isWasmLoaded,
  // Sorting
  sorted,
  // Statistics
  mean,
  median,
  mode,
  extremes,
  variance,
  stddev,
  skewness,
  kurtosis,
  // Quartiles & outliers
  hinges,
  iqr,
  fences,
  outerFences,
  outliers,
  adjacent,
  inside,
  outside,
  // Ordering
  counts,
  ranked,
  binned,
  // Transforms
  logs,
  roots,
  inverse,
  zscore,
  // Smoothing
  hanning,
  smooth,
  rough,
  ema,
  // Summaries
  trimean,
  letterValues,
  stemLeaf,
  midSummaries,
  // Distance
  cosineSimilarity,
  squaredEuclideanDistance,
  euclideanDistance,
  manhattanDistance,
  mahalanobisDistance,
  normalizeL2,
  cosineSimilaritySparse,
  jaccardSimilarity,
  overlapCoefficient,
  // Analysis
  analyze,
} from './index';

const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const outlierData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];

describe('WASM management', () => {
  test('isWasmLoaded returns false without explicit load', () => {
    expect(isWasmLoaded()).toBe(false);
  });
});

describe('sorted', () => {
  test('sorts ascending', () => {
    expect(sorted([5, 2, 8, 1, 9])).toEqual([1, 2, 5, 8, 9]);
  });

  test('handles already sorted', () => {
    expect(sorted(testData)).toEqual(testData);
  });

  test('handles duplicates', () => {
    expect(sorted([3, 1, 3, 2])).toEqual([1, 2, 3, 3]);
  });

  test('handles empty', () => {
    expect(sorted([])).toEqual([]);
  });
});

describe('mean', () => {
  test('calculates mean', () => {
    expect(mean(testData)).toBe(5.5);
  });

  test('single element', () => {
    expect(mean([42])).toBe(42);
  });

  test('empty returns NaN', () => {
    expect(mean([])).toBeNaN();
  });
});

describe('median', () => {
  test('even length', () => {
    const result = median(testData);
    expect(result.datum).toBe(5.5);
    expect(result.depth).toBe(5.5);
  });

  test('odd length', () => {
    expect(median([1, 2, 3, 4, 5]).datum).toBe(3);
  });

  test('single element', () => {
    expect(median([42]).datum).toBe(42);
  });

  test('two elements', () => {
    expect(median([10, 20]).datum).toBe(15);
  });
});

describe('mode', () => {
  test('finds mode', () => {
    const result = mode([1, 2, 2, 3, 3, 3, 4]);
    expect(result.count).toBe(3);
    expect(result.data).toContain(3);
  });

  test('multiple modes', () => {
    const result = mode([1, 1, 2, 2, 3]);
    expect(result.count).toBe(2);
    expect(result.data).toContain(1);
    expect(result.data).toContain(2);
  });

  test('empty', () => {
    const result = mode([]);
    expect(result.count).toBe(0);
    expect(result.data).toEqual([]);
  });
});

describe('extremes', () => {
  test('returns [min, max]', () => {
    expect(extremes(testData)).toEqual([1, 10]);
  });

  test('single element', () => {
    expect(extremes([5])).toEqual([5, 5]);
  });
});

describe('variance & stddev', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  test('variance computes sample variance', () => {
    // mean = 5, deviations²: 9+1+1+1+0+0+4+16 = 32, n-1 = 7
    expect(variance(data)).toBeCloseTo(32 / 7, 5);
  });

  test('stddev is sqrt of variance', () => {
    expect(stddev(data)).toBeCloseTo(Math.sqrt(variance(data)), 10);
  });

  test('variance of single element is NaN', () => {
    expect(variance([5])).toBeNaN();
  });

  test('variance of empty is NaN', () => {
    expect(variance([])).toBeNaN();
  });
});

describe('skewness', () => {
  test('symmetric data is near 0', () => {
    expect(Math.abs(skewness([1, 2, 3, 4, 5]))).toBeLessThan(0.01);
  });

  test('requires at least 3 points', () => {
    expect(skewness([1, 2])).toBeNaN();
  });

  test('constant data returns 0', () => {
    expect(skewness([5, 5, 5, 5])).toBe(0);
  });
});

describe('kurtosis', () => {
  test('returns finite for uniform-like data', () => {
    expect(Number.isFinite(kurtosis(testData))).toBe(true);
  });

  test('requires at least 4 points', () => {
    expect(kurtosis([1, 2, 3])).toBeNaN();
  });

  test('constant data returns 0', () => {
    expect(kurtosis([5, 5, 5, 5, 5])).toBe(0);
  });
});

describe('hinges & iqr', () => {
  test('calculates quartiles', () => {
    const h = hinges(testData);
    expect(h).toHaveLength(2);
    expect(h[0]).toHaveProperty('datum');
    expect(h[0]).toHaveProperty('depth');
    expect(h[0].datum).toBeLessThan(h[1].datum);
  });

  test('returns empty for small data', () => {
    expect(hinges([1, 2])).toEqual([]);
  });

  test('iqr is positive', () => {
    const i = iqr(testData);
    expect(i).toBeGreaterThan(0);
  });

  test('iqr of small data is NaN', () => {
    expect(iqr([1])).toBeNaN();
  });
});

describe('fences & outliers', () => {
  test('fences returns [low, high]', () => {
    const f = fences(testData);
    expect(f).toHaveLength(2);
    expect(f[0]).toBeLessThan(f[1]);
  });

  test('outerFences are wider than fences', () => {
    const inner = fences(testData);
    const outer = outerFences(testData);
    expect(outer[0]).toBeLessThanOrEqual(inner[0]);
    expect(outer[1]).toBeGreaterThanOrEqual(inner[1]);
  });

  test('detects outliers', () => {
    const o = outliers(outlierData);
    expect(o).toContain(100);
  });

  test('no outliers in uniform data', () => {
    expect(outliers([5, 5, 5, 5, 5])).toEqual([]);
  });
});

describe('adjacent, inside, outside', () => {
  test('adjacent returns two values', () => {
    const adj = adjacent(testData);
    expect(adj).toHaveLength(2);
  });

  test('inside filters to values within fences', () => {
    const ins = inside(testData);
    expect(ins.length).toBeGreaterThan(0);
  });

  test('outside contains extreme outliers', () => {
    const o = outside(outlierData);
    expect(o).toContain(100);
  });
});

describe('counts', () => {
  test('counts frequencies', () => {
    const c = counts([1, 2, 2, 3, 3, 3]);
    expect(c).toContainEqual([1, 1]);
    expect(c).toContainEqual([2, 2]);
    expect(c).toContainEqual([3, 3]);
  });

  test('empty data', () => {
    expect(counts([])).toEqual([]);
  });
});

describe('ranked', () => {
  test('returns ranking structure', () => {
    const r = ranked(testData);
    expect(r).toHaveProperty('up');
    expect(r).toHaveProperty('down');
    expect(r).toHaveProperty('groups');
    expect(r.groups).toHaveProperty('up');
    expect(r.groups).toHaveProperty('down');
  });

  test('handles ties', () => {
    const r = ranked([1, 2, 2, 3]);
    expect(r.groups).toBeDefined();
  });
});

describe('binned', () => {
  test('bins data', () => {
    const b = binned(testData);
    expect(b).toHaveProperty('bins');
    expect(b).toHaveProperty('width');
    expect(b).toHaveProperty('binned');
    expect(b.bins).toBeGreaterThan(0);
  });

  test('empty data', () => {
    const b = binned([]);
    expect(b.bins).toBe(0);
  });
});

describe('transforms', () => {
  test('logs computes natural log', () => {
    const l = logs([1, Math.E, Math.E * Math.E]);
    expect(l[0]).toBeCloseTo(0);
    expect(l[1]).toBeCloseTo(1);
    expect(l[2]).toBeCloseTo(2);
  });

  test('roots computes square roots', () => {
    expect(roots([1, 4, 9, 16])).toEqual([1, 2, 3, 4]);
  });

  test('inverse computes reciprocals', () => {
    expect(inverse([1, 2, 4, 5])).toEqual([1, 0.5, 0.25, 0.2]);
  });

  test('zscore normalizes to mean 0', () => {
    const z = zscore(testData);
    const zMean = z.reduce((a, b) => a + b, 0) / z.length;
    expect(zMean).toBeCloseTo(0, 10);
  });

  test('zscore of constant returns all zeros', () => {
    zscore([5, 5, 5, 5]).forEach((v) => expect(v).toBe(0));
  });
});

describe('smoothing', () => {
  test('hanning preserves endpoints', () => {
    const h = hanning(testData);
    expect(h).toHaveLength(testData.length);
    expect(h[0]).toBe(testData[0]);
    expect(h[h.length - 1]).toBe(testData[testData.length - 1]);
  });

  test('smooth returns same length', () => {
    const s = smooth(testData);
    expect(s).toHaveLength(testData.length);
  });

  test('rough is original minus smooth', () => {
    const r = rough(testData);
    const s = smooth(testData);
    expect(r).toHaveLength(testData.length);
    for (let i = 0; i < testData.length; i++) {
      expect(r[i]).toBeCloseTo(testData[i] - s[i], 10);
    }
  });

  test('ema produces correct values', () => {
    const result = ema([10, 20, 30], 0.5);
    expect(result[0]).toBe(10);
    expect(result[1]).toBeCloseTo(15, 10);
    expect(result[2]).toBeCloseTo(22.5, 10);
  });

  test('ema of empty returns empty', () => {
    expect(ema([], 0.5)).toEqual([]);
  });
});

describe('summaries', () => {
  test('trimean computes weighted median', () => {
    const t = trimean(testData);
    expect(typeof t).toBe('number');
    expect(Number.isFinite(t)).toBe(true);
  });

  test('trimean falls back to median for small data', () => {
    expect(trimean([5])).toBe(5);
  });

  test('letterValues start with M', () => {
    const lv = letterValues(testData);
    expect(lv.length).toBeGreaterThan(0);
    expect(lv[0].letter).toBe('M');
    expect(lv[0].spread).toBe(0);
  });

  test('letterValues returns empty for single element', () => {
    expect(letterValues([5])).toEqual([]);
  });

  test('stemLeaf produces display', () => {
    const sl = stemLeaf([5, 12, 13, 21, 22, 23, 35]);
    expect(sl.stems.length).toBeGreaterThan(0);
    expect(sl.display.length).toBeGreaterThan(0);
    expect(sl.display[0]).toContain('|');
  });

  test('stemLeaf empty data', () => {
    const sl = stemLeaf([]);
    expect(sl.stems).toEqual([]);
  });

  test('midSummaries derived from letterValues', () => {
    const ms = midSummaries(testData);
    expect(ms.length).toBeGreaterThan(0);
    expect(ms[0]).toHaveProperty('depth');
    expect(ms[0]).toHaveProperty('mid');
    expect(ms[0]).toHaveProperty('spread');
  });
});

describe('distance functions', () => {
  test('cosineSimilarity of identical vectors is 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5);
  });

  test('cosineSimilarity of orthogonal vectors is 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  test('cosineSimilarity of empty is 0', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  test('euclideanDistance known value', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5, 10);
  });

  test('euclideanDistance of same point is 0', () => {
    expect(euclideanDistance([1, 2], [1, 2])).toBeCloseTo(0, 10);
  });

  test('squaredEuclideanDistance avoids sqrt', () => {
    expect(squaredEuclideanDistance([0, 0], [3, 4])).toBeCloseTo(25, 10);
  });

  test('manhattanDistance known value', () => {
    expect(manhattanDistance([0, 0], [3, 4])).toBeCloseTo(7, 10);
  });

  test('mahalanobisDistance with unit variance equals euclidean', () => {
    const point = [3, 4];
    const means = [0, 0];
    const variances = [1, 1];
    expect(mahalanobisDistance(point, means, variances)).toBeCloseTo(5, 5);
  });

  test('mahalanobisDistance empty returns 0', () => {
    expect(mahalanobisDistance([], [], [])).toBe(0);
  });

  test('normalizeL2 produces unit vector', () => {
    const n = normalizeL2([3, 4]);
    const mag = Math.sqrt(n[0] * n[0] + n[1] * n[1]);
    expect(mag).toBeCloseTo(1, 5);
    expect(n[0]).toBeCloseTo(0.6, 5);
    expect(n[1]).toBeCloseTo(0.8, 5);
  });

  test('normalizeL2 zero vector returns zeros', () => {
    expect(normalizeL2([0, 0])).toEqual([0, 0]);
  });
});

describe('sparse & set operations', () => {
  test('cosineSimilaritySparse identical maps', () => {
    const a = new Map([['x', 1], ['y', 2]]);
    const b = new Map([['x', 1], ['y', 2]]);
    expect(cosineSimilaritySparse(a, b)).toBeCloseTo(1, 5);
  });

  test('cosineSimilaritySparse disjoint maps', () => {
    const a = new Map([['x', 1]]);
    const b = new Map([['y', 1]]);
    expect(cosineSimilaritySparse(a, b)).toBeCloseTo(0, 5);
  });

  test('cosineSimilaritySparse empty returns 0', () => {
    expect(cosineSimilaritySparse(new Map(), new Map([['x', 1]]))).toBe(0);
  });

  test('jaccardSimilarity known value', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    expect(jaccardSimilarity(a, b)).toBeCloseTo(0.5, 5);
  });

  test('jaccardSimilarity identical sets is 1', () => {
    const s = new Set([1, 2, 3]);
    expect(jaccardSimilarity(s, s)).toBeCloseTo(1, 5);
  });

  test('jaccardSimilarity empty returns 0', () => {
    expect(jaccardSimilarity(new Set(), new Set([1]))).toBe(0);
  });

  test('overlapCoefficient known value', () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4, 5]);
    // intersection=2, min(3,4)=3
    expect(overlapCoefficient(a, b)).toBeCloseTo(2 / 3, 5);
  });

  test('overlapCoefficient subset is 1', () => {
    const a = new Set([1, 2]);
    const b = new Set([1, 2, 3, 4]);
    expect(overlapCoefficient(a, b)).toBeCloseTo(1, 5);
  });

  test('overlapCoefficient empty returns 0', () => {
    expect(overlapCoefficient(new Set(), new Set([1]))).toBe(0);
  });
});

describe('analyze', () => {
  test('returns full SeriesDescription-compatible result', () => {
    const result = analyze(testData);

    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('smooths');
    expect(result).toHaveProperty('transforms');
    expect(result).toHaveProperty('counts');
    expect(result).toHaveProperty('sorted');
    expect(result).toHaveProperty('ranked');
    expect(result).toHaveProperty('binned');
    expect(result).toHaveProperty('implementation');

    expect(result.original).toEqual(testData);
    expect(result.sorted).toEqual(testData);
    expect(result.implementation).toBe('typescript');
  });

  test('summary contains all fields', () => {
    const { summary } = analyze(testData);
    expect(summary).toHaveProperty('median');
    expect(summary).toHaveProperty('mean');
    expect(summary).toHaveProperty('mode');
    expect(summary).toHaveProperty('hinges');
    expect(summary).toHaveProperty('adjacent');
    expect(summary).toHaveProperty('outliers');
    expect(summary).toHaveProperty('outer');
    expect(summary).toHaveProperty('outside');
    expect(summary).toHaveProperty('inside');
    expect(summary).toHaveProperty('extremes');
    expect(summary).toHaveProperty('iqr');
    expect(summary).toHaveProperty('fences');
  });

  test('smooths contains smooth and hanning', () => {
    const { smooths } = analyze(testData);
    expect(smooths.smooth).toHaveLength(testData.length);
    expect(smooths.hanning).toHaveLength(testData.length);
  });

  test('transforms contains logs, roots, inverse', () => {
    const { transforms } = analyze(testData);
    expect(transforms.logs).toHaveLength(testData.length);
    expect(transforms.roots).toHaveLength(testData.length);
    expect(transforms.inverse).toHaveLength(testData.length);
  });

  test('detects outliers in skewed data', () => {
    const result = analyze(outlierData);
    expect(result.summary.outliers).toContain(100);
  });

  test('statistics are correct', () => {
    const result = analyze(testData);
    expect(result.summary.mean).toBe(5.5);
    expect(result.summary.median.datum).toBe(5.5);
    expect(result.summary.extremes).toEqual([1, 10]);
  });
});
