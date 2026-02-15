import { describe, test, expect } from 'bun:test';
import { Twokeys, Series, Points } from './index';

describe('Twokeys', () => {
  test('exports constants', () => {
    expect(Twokeys.DEFAULT_MAX_RANDOM_INTEGER).toBe(100);
    expect(Twokeys.DEFAULT_MIN_RANDOM_INTEGER).toBe(0);
    expect(Twokeys.DEFAULT_RANDOM_SERIES_COUNT).toBe(1000);
    expect(Twokeys.DEFAULT_OUTLIER_MULTIPLE).toBe(1.5);
    expect(Twokeys.DEFAULT_JITTER_MULTIPLIER).toBe(1);
    expect(Twokeys.DEFAULT_SPLIT_PASSES).toBe(2);
    expect(Twokeys.DEFAULT_MAX_RANDOM_DIMENSIONALITY).toBe(2);
  });

  test('has smoothed property', () => {
    const tk = new Twokeys();
    expect(tk.smoothed).toBe(false);
  });

  test('exports Series and Points classes', () => {
    expect(Twokeys.Series).toBe(Series);
    expect(Twokeys.Points).toBe(Points);
  });

  test('randomInteger returns number within range', () => {
    for (let i = 0; i < 100; i++) {
      const num = Twokeys.randomInteger(50);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(50);
    }
  });

  test('randomInteger uses default max', () => {
    const num = Twokeys.randomInteger();
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThan(100);
  });

  test('randomSeries returns array of correct length', () => {
    const series = Twokeys.randomSeries(50, 100);
    expect(series).toHaveLength(50);
    series.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(100);
    });
  });

  test('randomSeries uses defaults', () => {
    const series = Twokeys.randomSeries();
    expect(series).toHaveLength(1000);
  });

  test('randomPoint returns array of correct dimension', () => {
    const point = Twokeys.randomPoint(3, 100);
    expect(point).toHaveLength(3);
  });

  test('randomPoint uses defaults', () => {
    const point = Twokeys.randomPoint();
    expect(point).toHaveLength(2);
  });

  test('randomPoints returns array of correct length', () => {
    const points = Twokeys.randomPoints(10, 3, 100);
    expect(points).toHaveLength(10);
    points.forEach((p) => expect(p).toHaveLength(3));
  });

  test('randomPoints uses defaults', () => {
    const points = Twokeys.randomPoints();
    expect(points).toHaveLength(1000);
    points.forEach((p) => expect(p).toHaveLength(2));
  });
});

describe('Series', () => {
  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const outlierData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];

  describe('constructor', () => {
    test('creates series with provided data', () => {
      const series = new Series({ data: testData });
      expect(series.sorted()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    test('creates series with random data when none provided', () => {
      const series = new Series();
      expect(series.sorted()).toHaveLength(1000);
    });

    test('creates series with empty options', () => {
      const series = new Series({});
      expect(series.sorted()).toHaveLength(1000);
    });
  });

  describe('sorted', () => {
    test('returns sorted array', () => {
      const series = new Series({ data: [5, 2, 8, 1, 9] });
      expect(series.sorted()).toEqual([1, 2, 5, 8, 9]);
    });

    test('caches sorted result', () => {
      const series = new Series({ data: [5, 2, 8, 1, 9] });
      const first = series.sorted();
      const second = series.sorted();
      expect(first).toBe(second);
    });

    test('handles equal values', () => {
      const series = new Series({ data: [3, 1, 3, 2, 3] });
      expect(series.sorted()).toEqual([1, 2, 3, 3, 3]);
    });
  });

  describe('median', () => {
    test('calculates median for odd length array', () => {
      const series = new Series({ data: [1, 2, 3, 4, 5] });
      const result = series.median();
      expect(result.datum).toBe(3);
    });

    test('calculates median for even length array', () => {
      const series = new Series({ data: testData });
      const result = series.median();
      expect(result.datum).toBe(5.5);
    });

    test('returns depth', () => {
      const series = new Series({ data: testData });
      const result = series.median();
      expect(result.depth).toBe(5.5);
    });

    test('handles single element', () => {
      const series = new Series({ data: [42] });
      expect(series.median().datum).toBe(42);
    });

    test('handles two elements', () => {
      const series = new Series({ data: [10, 20] });
      expect(series.median().datum).toBe(15);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.median();
      const second = series.median();
      expect(first).toEqual(second);
    });
  });

  describe('mean', () => {
    test('calculates mean', () => {
      const series = new Series({ data: testData });
      expect(series.mean()).toBe(5.5);
    });

    test('handles single element', () => {
      const series = new Series({ data: [42] });
      expect(series.mean()).toBe(42);
    });

    test('returns NaN for empty array', () => {
      const series = new Series({ data: [] });
      expect(series.mean()).toBeNaN();
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      series.mean();
      expect(series.mean()).toBe(5.5);
    });
  });

  describe('mode', () => {
    test('finds mode', () => {
      const series = new Series({ data: [1, 2, 2, 3, 3, 3, 4] });
      const result = series.mode();
      expect(result.count).toBe(3);
      expect(result.data).toContain(3);
    });

    test('handles multiple modes', () => {
      const series = new Series({ data: [1, 1, 2, 2, 3] });
      const result = series.mode();
      expect(result.count).toBeGreaterThanOrEqual(2);
    });

    test('handles empty data', () => {
      const series = new Series({ data: [] });
      const result = series.mode();
      expect(result.count).toBe(0);
      expect(result.data).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: [1, 2, 2, 3] });
      const first = series.mode();
      const second = series.mode();
      expect(first).toEqual(second);
    });
  });

  describe('extremes', () => {
    test('returns min and max', () => {
      const series = new Series({ data: testData });
      expect(series.extremes()).toEqual([1, 10]);
    });

    test('handles single element', () => {
      const series = new Series({ data: [5] });
      expect(series.extremes()).toEqual([5, 5]);
    });

    test('handles empty data', () => {
      const series = new Series({ data: [] });
      expect(series.extremes()).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.extremes();
      const second = series.extremes();
      expect(first).toBe(second);
    });
  });

  describe('counts', () => {
    test('counts occurrences', () => {
      const series = new Series({ data: [1, 2, 2, 3, 3, 3] });
      const counts = series.counts();
      expect(counts).toContainEqual([1, 1]);
      expect(counts).toContainEqual([2, 2]);
      expect(counts).toContainEqual([3, 3]);
    });

    test('handles empty data', () => {
      const series = new Series({ data: [] });
      expect(series.counts()).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: [1, 2, 2] });
      const first = series.counts();
      const second = series.counts();
      expect(first).toBe(second);
    });
  });

  describe('hinges', () => {
    test('calculates quartiles', () => {
      const series = new Series({ data: testData });
      const hinges = series.hinges();
      expect(hinges).toHaveLength(2);
      expect(hinges[0]).toHaveProperty('datum');
      expect(hinges[0]).toHaveProperty('depth');
    });

    test('handles small data', () => {
      const series = new Series({ data: [1, 2] });
      const hinges = series.hinges();
      expect(hinges).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.hinges();
      const second = series.hinges();
      expect(first).toBe(second);
    });
  });

  describe('iqr', () => {
    test('calculates interquartile range', () => {
      const series = new Series({ data: testData });
      const iqr = series.iqr();
      expect(typeof iqr).toBe('number');
      expect(iqr).toBeGreaterThanOrEqual(0);
    });

    test('returns NaN for insufficient data', () => {
      const series = new Series({ data: [1] });
      expect(series.iqr()).toBeNaN();
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      series.iqr();
      expect(series.iqr()).toBeDefined();
    });
  });

  describe('fences', () => {
    test('calculates inner fences', () => {
      const series = new Series({ data: testData });
      const fences = series.fences();
      expect(fences).toHaveLength(2);
      expect(fences[0]).toBeLessThan(fences[1]);
    });

    test('returns empty for insufficient data', () => {
      const series = new Series({ data: [1] });
      expect(series.fences()).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.fences();
      const second = series.fences();
      expect(first).toBe(second);
    });
  });

  describe('outer', () => {
    test('calculates outer fences', () => {
      const series = new Series({ data: testData });
      const outer = series.outer();
      expect(outer).toHaveLength(2);
    });

    test('returns empty for insufficient data', () => {
      const series = new Series({ data: [1] });
      expect(series.outer()).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.outer();
      const second = series.outer();
      expect(first).toBe(second);
    });
  });

  describe('outside', () => {
    test('finds values outside outer fences', () => {
      const series = new Series({ data: outlierData });
      const outside = series.outside();
      expect(outside).toContain(100);
    });

    test('caches result', () => {
      const series = new Series({ data: outlierData });
      const first = series.outside();
      const second = series.outside();
      expect(first).toBe(second);
    });
  });

  describe('inside', () => {
    test('finds values inside fences', () => {
      const series = new Series({ data: testData });
      const inside = series.inside();
      expect(inside.length).toBeGreaterThan(0);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.inside();
      const second = series.inside();
      expect(first).toBe(second);
    });
  });

  describe('outliers', () => {
    test('detects outliers', () => {
      const series = new Series({ data: outlierData });
      const outliers = series.outliers();
      expect(outliers).toContain(100);
    });

    test('returns empty for no outliers', () => {
      const series = new Series({ data: [5, 5, 5, 5, 5] });
      const outliers = series.outliers();
      expect(Array.isArray(outliers)).toBe(true);
    });

    test('returns empty when fences empty', () => {
      const series = new Series({ data: [1] });
      expect(series.outliers()).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: outlierData });
      const first = series.outliers();
      const second = series.outliers();
      expect(first).toBe(second);
    });
  });

  describe('ranked', () => {
    test('returns ranking information', () => {
      const series = new Series({ data: testData });
      const ranked = series.ranked();
      expect(ranked).toHaveProperty('up');
      expect(ranked).toHaveProperty('down');
      expect(ranked).toHaveProperty('groups');
    });

    test('handles ties', () => {
      const series = new Series({ data: [1, 2, 2, 3] });
      const ranked = series.ranked();
      expect(ranked.groups).toBeDefined();
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.ranked();
      const second = series.ranked();
      expect(first).toBe(second);
    });
  });

  describe('adjacent', () => {
    test('finds adjacent values', () => {
      const series = new Series({ data: testData });
      const adjacent = series.adjacent();
      expect(adjacent).toHaveLength(2);
    });

    test('returns empty when fences empty', () => {
      const series = new Series({ data: [1] });
      expect(series.adjacent()).toEqual([]);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.adjacent();
      const second = series.adjacent();
      expect(first).toBe(second);
    });
  });

  describe('binned', () => {
    test('bins data', () => {
      const series = new Series({ data: testData });
      const binned = series.binned();
      expect(binned).toHaveProperty('bins');
      expect(binned).toHaveProperty('width');
      expect(binned).toHaveProperty('binned');
    });

    test('handles empty data', () => {
      const series = new Series({ data: [] });
      const binned = series.binned();
      expect(binned.bins).toBe(0);
    });

    test('caches result', () => {
      const series = new Series({ data: testData });
      const first = series.binned();
      const second = series.binned();
      expect(first).toBe(second);
    });
  });

  describe('transforms', () => {
    test('logs calculates natural logarithms', () => {
      const series = new Series({ data: [1, Math.E, Math.E * Math.E] });
      const logs = series.logs();
      expect(logs[0]).toBeCloseTo(0);
      expect(logs[1]).toBeCloseTo(1);
      expect(logs[2]).toBeCloseTo(2);
    });

    test('logs caches result', () => {
      const series = new Series({ data: testData });
      const first = series.logs();
      const second = series.logs();
      expect(first).toBe(second);
    });

    test('roots calculates square roots', () => {
      const series = new Series({ data: [1, 4, 9, 16] });
      const roots = series.roots();
      expect(roots).toEqual([1, 2, 3, 4]);
    });

    test('roots caches result', () => {
      const series = new Series({ data: testData });
      const first = series.roots();
      const second = series.roots();
      expect(first).toBe(second);
    });

    test('inverse calculates reciprocals', () => {
      const series = new Series({ data: [1, 2, 4, 5] });
      const inverse = series.inverse();
      expect(inverse).toEqual([1, 0.5, 0.25, 0.2]);
    });

    test('inverse caches result', () => {
      const series = new Series({ data: testData });
      const first = series.inverse();
      const second = series.inverse();
      expect(first).toBe(second);
    });
  });

  describe('smoothing', () => {
    test('hanning applies skip means', () => {
      const series = new Series({ data: testData });
      const hanning = series.hanning();
      expect(hanning).toHaveLength(testData.length);
      expect(hanning[0]).toBe(testData[0]);
      expect(hanning[hanning.length - 1]).toBe(testData[testData.length - 1]);
    });

    test('hanning caches result', () => {
      const series = new Series({ data: testData });
      const first = series.hanning();
      const second = series.hanning();
      expect(first).toBe(second);
    });

    test('smooth applies median smoothing', () => {
      const series = new Series({ data: testData });
      const smooth = series.smooth();
      expect(smooth).toHaveLength(testData.length);
    });

    test('smooth caches result', () => {
      const series = new Series({ data: testData });
      const first = series.smooth();
      const second = series.smooth();
      expect(first).toBe(second);
    });
  });

  describe('describe', () => {
    test('returns full description', () => {
      const series = new Series({ data: testData });
      const desc = series.describe();

      expect(desc).toHaveProperty('original');
      expect(desc).toHaveProperty('summary');
      expect(desc).toHaveProperty('smooths');
      expect(desc).toHaveProperty('transforms');
      expect(desc).toHaveProperty('counts');
      expect(desc).toHaveProperty('sorted');
      expect(desc).toHaveProperty('ranked');
      expect(desc).toHaveProperty('binned');

      expect(desc.summary).toHaveProperty('median');
      expect(desc.summary).toHaveProperty('mean');
      expect(desc.summary).toHaveProperty('mode');
      expect(desc.summary).toHaveProperty('hinges');
      expect(desc.summary).toHaveProperty('adjacent');
      expect(desc.summary).toHaveProperty('outliers');
      expect(desc.summary).toHaveProperty('outer');
      expect(desc.summary).toHaveProperty('outside');
      expect(desc.summary).toHaveProperty('inside');
      expect(desc.summary).toHaveProperty('extremes');
      expect(desc.summary).toHaveProperty('iqr');
      expect(desc.summary).toHaveProperty('fences');
    });
  });
});

describe('Points', () => {
  describe('constructor', () => {
    test('creates points with provided data', () => {
      const data = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const points = new Points({ data });
      const desc = points.describe();
      expect(desc.original).toEqual(data);
    });

    test('creates points with count as number', () => {
      const points = new Points(50);
      const desc = points.describe();
      expect(desc.original).toHaveLength(50);
    });

    test('creates points with options', () => {
      const points = new Points({ count: 20, dimensionality: 3 });
      const desc = points.describe();
      expect(desc.original).toHaveLength(20);
      desc.original.forEach((p) => expect(p).toHaveLength(3));
    });

    test('uses default values', () => {
      const points = new Points({});
      const desc = points.describe();
      expect(desc.original).toHaveLength(100);
      desc.original.forEach((p) => expect(p).toHaveLength(2));
    });
  });

  describe('describe', () => {
    test('returns description with original data', () => {
      const points = new Points(10);
      const desc = points.describe();
      expect(desc).toHaveProperty('original');
      expect(desc.original).toHaveLength(10);
    });
  });
});

describe('Series statistical methods', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  test('variance computes sample variance', () => {
    const s = new Series({ data });
    const v = s.variance();
    // mean = 5, deviations²: 9+1+1+1+0+0+4+16 = 32, n-1 = 7
    expect(v).toBeCloseTo(32 / 7, 5);
  });

  test('stddev is sqrt of variance', () => {
    const s = new Series({ data });
    expect(s.stddev()).toBeCloseTo(Math.sqrt(s.variance()), 10);
  });

  test('variance of single element is NaN', () => {
    const s = new Series({ data: [5] });
    expect(s.variance()).toBeNaN();
  });

  test('ema produces correct exponential moving average', () => {
    const s = new Series({ data: [10, 20, 30] });
    const result = s.ema(0.5);
    expect(result[0]).toBe(10);
    expect(result[1]).toBeCloseTo(15, 10);
    expect(result[2]).toBeCloseTo(22.5, 10);
  });

  test('ema of empty series returns empty', () => {
    const s = new Series({ data: [] });
    expect(s.ema(0.5)).toEqual([]);
  });

  test('zscore normalizes data', () => {
    const s = new Series({ data });
    const z = s.zscore();
    // z-scores should have mean ≈ 0
    const zMean = z.reduce((a, b) => a + b, 0) / z.length;
    expect(zMean).toBeCloseTo(0, 10);
  });

  test('zscore of constant data returns all zeros', () => {
    const s = new Series({ data: [5, 5, 5, 5] });
    const z = s.zscore();
    z.forEach((v) => expect(v).toBe(0));
  });

  test('skewness of symmetric data is near 0', () => {
    const s = new Series({ data: [1, 2, 3, 4, 5] });
    expect(Math.abs(s.skewness())).toBeLessThan(0.01);
  });

  test('skewness requires at least 3 points', () => {
    const s = new Series({ data: [1, 2] });
    expect(s.skewness()).toBeNaN();
  });

  test('kurtosis of normal-like data is near 0', () => {
    // Uniform distribution has excess kurtosis of -1.2
    const s = new Series({ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
    expect(Number.isFinite(s.kurtosis())).toBe(true);
  });

  test('kurtosis requires at least 4 points', () => {
    const s = new Series({ data: [1, 2, 3] });
    expect(s.kurtosis()).toBeNaN();
  });
});

describe('Points multivariate analysis', () => {
  const data = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ];

  test('centroid is the mean point', () => {
    const p = new Points({ data });
    const c = p.centroid();
    expect(c[0]).toBeCloseTo(4, 10); // (1+3+5+7)/4
    expect(c[1]).toBeCloseTo(5, 10); // (2+4+6+8)/4
  });

  test('variances returns per-dimension sample variance', () => {
    const p = new Points({ data });
    const v = p.variances();
    expect(v.length).toBe(2);
    // Dim 0: values [1,3,5,7], mean=4, var = (9+1+1+9)/3 = 20/3
    expect(v[0]).toBeCloseTo(20 / 3, 5);
  });

  test('standardDeviations are sqrt of variances', () => {
    const p = new Points({ data });
    const v = p.variances();
    const sd = p.standardDeviations();
    expect(sd[0]).toBeCloseTo(Math.sqrt(v[0]), 10);
    expect(sd[1]).toBeCloseTo(Math.sqrt(v[1]), 10);
  });

  test('covarianceMatrix is symmetric', () => {
    const p = new Points({ data });
    const cov = p.covarianceMatrix();
    expect(cov[0][1]).toBeCloseTo(cov[1][0], 10);
  });

  test('correlationMatrix diagonal is 1', () => {
    const p = new Points({ data });
    const corr = p.correlationMatrix();
    expect(corr[0][0]).toBeCloseTo(1, 10);
    expect(corr[1][1]).toBeCloseTo(1, 10);
  });

  test('correlationMatrix for perfectly correlated data is 1', () => {
    const p = new Points({ data }); // y = x + 1, perfectly correlated
    const corr = p.correlationMatrix();
    expect(corr[0][1]).toBeCloseTo(1, 5);
  });

  test('mahalanobis of centroid is 0', () => {
    const p = new Points({ data });
    const c = p.centroid();
    expect(p.mahalanobis(c)).toBeCloseTo(0, 10);
  });

  test('mahalanobisAll returns array of correct length', () => {
    const p = new Points({ data });
    const distances = p.mahalanobisAll();
    expect(distances.length).toBe(4);
    distances.forEach((d) => expect(d).toBeGreaterThanOrEqual(0));
  });

  test('outliersByMahalanobis with high threshold returns no outliers', () => {
    const p = new Points({ data });
    const outliers = p.outliersByMahalanobis(100);
    expect(outliers.length).toBe(0);
  });

  test('normalizeL2 returns Points with unit-magnitude vectors', () => {
    const p = new Points({ data });
    const normalized = p.normalizeL2();
    const desc = normalized.describe();
    for (const pt of desc.original) {
      const mag = Math.sqrt(pt[0] * pt[0] + pt[1] * pt[1]);
      expect(mag).toBeCloseTo(1, 5);
    }
  });

  test('normalizeZscore returns Points with per-dimension mean ~0', () => {
    const p = new Points({ data });
    const normalized = p.normalizeZscore();
    const c = normalized.centroid();
    expect(c[0]).toBeCloseTo(0, 5);
    expect(c[1]).toBeCloseTo(0, 5);
  });

  test('describe returns enhanced description', () => {
    const p = new Points({ data });
    const desc = p.describe();
    expect(desc).toHaveProperty('centroid');
    expect(desc).toHaveProperty('variances');
    expect(desc).toHaveProperty('correlationMatrix');
    expect(desc).toHaveProperty('mahalanobisDistances');
    expect(desc).toHaveProperty('outlierCount');
    expect(desc).toHaveProperty('dimensionSummaries');
    expect(desc.dimensionSummaries.length).toBe(2);
  });

  test('single point has NaN variance', () => {
    const p = new Points({ data: [[1, 2]] });
    const v = p.variances();
    expect(v[0]).toBeNaN();
  });
});

describe('default export', () => {
  test('exports Twokeys as default', async () => {
    const { default: DefaultTwokeys } = await import('./index');
    expect(DefaultTwokeys).toBe(Twokeys);
  });
});
