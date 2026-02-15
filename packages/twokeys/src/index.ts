/**
 * Twokeys - A small data exploration and manipulation library
 * Named after John Tukey, pioneer of exploratory data analysis (EDA)
 *
 * Features:
 * - Summary statistics (mean, median, mode, quartiles)
 * - Binning (histogram-like grouping)
 * - Smoothing (Hanning filter and median smoothing)
 * - Ranking and ranking analysis
 * - Outlier detection (using Tukey fences)
 * - Data transforms (logarithms, roots, inverses)
 */

export interface SeriesOptions {
  data?: number[];
}

export interface PointsOptions {
  data?: number[][];
  dimensionality?: number;
  count?: number;
}

export interface MedianResult {
  datum: number;
  depth: number;
}

export interface ModeResult {
  count: number;
  data: number[];
}

export interface RankInfo {
  rank: number;
  peers: number;
}

export interface RankedResult {
  up: Record<number, RankInfo>;
  down: Record<number, RankInfo>;
  groups: {
    up: (number | number[])[];
    down: (number | number[])[];
  };
}

export interface BinnedResult {
  bins: number;
  width: number;
  binned: Record<
    number,
    {
      from: number;
      to: number;
      data: number[];
    }
  >;
}

export interface SeriesDescription {
  original: number[];
  summary: {
    median: MedianResult;
    mean: number;
    mode: ModeResult;
    hinges: MedianResult[];
    adjacent: number[];
    outliers: number[];
    outer: number[];
    outside: number[];
    inside: number[];
    extremes: number[];
    iqr: number;
    fences: number[];
  };
  smooths: {
    smooth: number[];
    hanning: number[];
  };
  transforms: {
    logs: number[];
    roots: number[];
    inverse: number[];
  };
  counts: [number, number][];
  sorted: number[];
  ranked: RankedResult;
  binned: BinnedResult;
}

export interface PointsDescription {
  original: number[][];
  centroid: number[];
  variances: number[];
  correlationMatrix: number[][];
  mahalanobisDistances: number[];
  outlierCount: number;
  dimensionSummaries: SeriesDescription[];
}

// Constants
const DEFAULT_MAX_RANDOM_INTEGER = 100;
const DEFAULT_MIN_RANDOM_INTEGER = 0;
const DEFAULT_RANDOM_SERIES_COUNT = 1000;
const DEFAULT_OUTLIER_MULTIPLE = 1.5;
const DEFAULT_JITTER_MULTIPLIER = 1;
const DEFAULT_SPLIT_PASSES = 2;
const DEFAULT_MAX_RANDOM_DIMENSIONALITY = 2;

// Utility functions
function randomInteger(max: number = DEFAULT_MAX_RANDOM_INTEGER): number {
  return Math.floor(Math.random() * max);
}

function randomSeries(
  count: number = DEFAULT_RANDOM_SERIES_COUNT,
  max: number = DEFAULT_MAX_RANDOM_INTEGER
): number[] {
  const series: number[] = [];
  for (let i = 0; i < count; i++) {
    series.push(randomInteger(max));
  }
  return series;
}

function randomPoint(
  dimension: number = DEFAULT_MAX_RANDOM_DIMENSIONALITY,
  max: number = DEFAULT_MAX_RANDOM_INTEGER
): number[] {
  const point: number[] = [];
  for (let i = 0; i < dimension; i++) {
    point.push(Math.floor((Math.random() * (max / 10)) % max));
  }
  return point;
}

function randomPoints(
  count: number = DEFAULT_RANDOM_SERIES_COUNT,
  dimension: number = DEFAULT_MAX_RANDOM_DIMENSIONALITY,
  max: number = DEFAULT_MAX_RANDOM_INTEGER
): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < count; i++) {
    points.push(randomPoint(dimension, max));
  }
  return points;
}

/**
 * Series class for 1D data exploration
 */
export class Series {
  private data: {
    original: number[];
    sorted?: number[];
    median?: number;
    medianDepth?: number;
    mean?: number;
    variance?: number;
    stddev?: number;
    skewness?: number;
    kurtosis?: number;
    mode?: ModeResult;
    extremes?: number[];
    counts?: [number, number][];
    hinges?: MedianResult[];
    iqr?: number;
    fences?: number[];
    outer?: number[];
    outside?: number[];
    inside?: number[];
    outliers?: number[];
    ranked?: RankedResult;
    adjacent?: number[];
    binned?: BinnedResult;
    logs?: number[];
    roots?: number[];
    inverse?: number[];
    hanning?: number[];
    smooth?: number[];
    rough?: number[];
    description?: SeriesDescription;
  };

  constructor(options: SeriesOptions = {}) {
    this.data = {
      original: options.data ?? randomSeries(),
    };
  }

  // Sort
  sorted(): number[] {
    if (!this.data.sorted) {
      this.data.sorted = this.getSorted(this.data.original);
    }
    return this.data.sorted;
  }

  private getSorted(arr: number[]): number[] {
    return [...arr].sort((a, b) => {
      if (a > b) return 1;
      if (a === b) return 0;
      return -1;
    });
  }

  // Median
  median(): MedianResult {
    this.sorted();
    if (this.data.median === undefined) {
      this.data.median = this.getMedian(this.data.sorted!);
    }
    if (this.data.medianDepth === undefined) {
      this.data.medianDepth = this.getMedianDepth(this.data.sorted!);
    }
    return {
      datum: this.data.median,
      depth: this.data.medianDepth,
    };
  }

  private getMedianDepth(arr: number[], offset: number = 0): number {
    if (!arr.length) return NaN;
    return offset + (arr.length + 1) / 2;
  }

  private getMedian(arr: number[]): number {
    const len = arr.length;
    if (!len) return NaN;
    if (len === 1) return arr[0];

    const mid = Math.floor(len / 2);
    if (len % 2 === 0) {
      return (arr[mid - 1] + arr[mid]) / 2;
    }
    return arr[mid];
  }

  // Mean
  mean(): number {
    if (this.data.mean === undefined) {
      this.data.mean = this.getMean(this.data.original);
    }
    return this.data.mean;
  }

  private getMean(arr: number[]): number {
    if (!arr.length) return NaN;
    let total = 0;
    for (const num of arr) {
      total += num;
    }
    return total / arr.length;
  }

  // Variance (sample variance: Σ(x - mean)² / (n - 1))
  variance(): number {
    if (this.data.variance === undefined) {
      const m = this.mean();
      const arr = this.data.original;
      if (arr.length < 2) {
        this.data.variance = NaN;
      } else {
        let sum = 0;
        for (const val of arr) {
          const delta = val - m;
          sum += delta * delta;
        }
        this.data.variance = sum / (arr.length - 1);
      }
    }
    return this.data.variance;
  }

  // Standard deviation: sqrt(variance)
  stddev(): number {
    if (this.data.stddev === undefined) {
      this.data.stddev = Math.sqrt(this.variance());
    }
    return this.data.stddev;
  }

  // Exponential moving average series
  ema(alpha: number): number[] {
    const arr = this.data.original;
    if (arr.length === 0) return [];
    const result: number[] = [arr[0]];
    for (let i = 1; i < arr.length; i += 1) {
      const prev = result[i - 1];
      result.push(prev * (1 - alpha) + arr[i] * alpha);
    }
    return result;
  }

  // Z-score normalization: (x - mean) / stddev
  zscore(): number[] {
    const m = this.mean();
    const s = this.stddev();
    if (s === 0 || isNaN(s)) {
      return this.data.original.map(() => 0);
    }
    return this.data.original.map((val) => (val - m) / s);
  }

  // Fisher-Pearson skewness: n/((n-1)(n-2)) * Σ((x-mean)/stddev)³
  skewness(): number {
    if (this.data.skewness === undefined) {
      const arr = this.data.original;
      const n = arr.length;
      if (n < 3) {
        this.data.skewness = NaN;
      } else {
        const m = this.mean();
        const s = this.stddev();
        if (s === 0) {
          this.data.skewness = 0;
        } else {
          let sum = 0;
          for (const val of arr) {
            const z = (val - m) / s;
            sum += z * z * z;
          }
          this.data.skewness = (n / ((n - 1) * (n - 2))) * sum;
        }
      }
    }
    return this.data.skewness;
  }

  // Excess kurtosis: adjusted fourth moment minus 3
  kurtosis(): number {
    if (this.data.kurtosis === undefined) {
      const arr = this.data.original;
      const n = arr.length;
      if (n < 4) {
        this.data.kurtosis = NaN;
      } else {
        const m = this.mean();
        const s = this.stddev();
        if (s === 0) {
          this.data.kurtosis = 0;
        } else {
          let sum = 0;
          for (const val of arr) {
            const z = (val - m) / s;
            sum += z * z * z * z;
          }
          const rawKurt = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * sum;
          const correction = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
          this.data.kurtosis = rawKurt - correction;
        }
      }
    }
    return this.data.kurtosis;
  }

  // Mode
  mode(): ModeResult {
    if (!this.data.mode) {
      this.sorted();
      this.data.mode = this.getMode(this.data.sorted!);
    }
    return this.data.mode;
  }

  private getMode(data: number[]): ModeResult {
    if (!data.length) {
      return { count: 0, data: [] };
    }

    // Count frequencies
    const freq: Record<number, number> = {};
    let maxCount = 0;

    for (const val of data) {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxCount) {
        maxCount = freq[val];
      }
    }

    // Find all values with max frequency
    const modes: number[] = [];
    for (const [val, count] of Object.entries(freq)) {
      if (count === maxCount) {
        modes.push(Number(val));
      }
    }

    return {
      count: maxCount,
      data: modes.sort((a, b) => a - b),
    };
  }

  // Extremes
  extremes(): number[] {
    if (!this.data.extremes) {
      this.sorted();
      this.data.extremes = this.getExtremes(this.data.sorted!);
    }
    return this.data.extremes;
  }

  private getExtremes(data: number[]): number[] {
    if (!data.length) return [];
    return [data[0], data[data.length - 1]];
  }

  // Counts
  counts(): [number, number][] {
    if (!this.data.counts) {
      this.sorted();
      this.data.counts = this.getCounts(this.data.sorted!);
    }
    return this.data.counts;
  }

  private getCounts(data: number[]): [number, number][] {
    const freq = new Map<number, number>();
    for (const val of data) {
      freq.set(val, (freq.get(val) || 0) + 1);
    }
    const result: [number, number][] = [];
    for (const [val, count] of freq) {
      result.push([val, count]);
    }
    return result.sort((a, b) => a[0] - b[0]);
  }

  // Hinges (quartiles)
  hinges(): MedianResult[] {
    if (!this.data.hinges) {
      this.sorted();
      this.data.hinges = this.getHinges(this.data.sorted!);
    }
    return this.data.hinges;
  }

  private getHinges(
    arr: number[],
    hinges: number = 2,
    result: MedianResult[] = []
  ): MedianResult[] {
    const copy = [...arr];
    const total = copy.length;

    let hingeCount = hinges;
    if (hingeCount % 2 !== 0) {
      hingeCount++;
    }

    if (total <= hingeCount || hingeCount <= 0) {
      return result;
    }

    const per = Math.floor(total / hingeCount);
    const howMany = Math.floor(total / per) - 1;

    for (let step = 0; step <= howMany; step++) {
      const fragment = copy.slice(step * per, step * per + per);
      result.push({
        datum: this.getMedian(fragment),
        depth: this.getMedianDepth(fragment, step * per),
      });
    }

    return result;
  }

  // IQR (Interquartile Range)
  iqr(): number {
    if (this.data.iqr === undefined) {
      this.hinges();
      this.data.iqr = this.getIQR(this.data.hinges!);
    }
    return this.data.iqr;
  }

  private getIQR(hinges: MedianResult[]): number {
    const first = hinges[0]?.datum;
    const second = hinges[1]?.datum;
    if (first === undefined || second === undefined) {
      return NaN;
    }
    return Math.abs(first - second);
  }

  // Fences
  fences(): number[] {
    if (!this.data.fences) {
      this.median();
      this.iqr();
      this.data.fences = this.getFences();
    }
    return this.data.fences;
  }

  private getFences(multiple: number = DEFAULT_OUTLIER_MULTIPLE): number[] {
    const base = this.data.median;
    const iqr = this.data.iqr;
    if (base === undefined || iqr === undefined || isNaN(iqr)) {
      return [];
    }
    const extra = iqr * multiple;
    return [base - extra, base + extra];
  }

  // Outer fences
  outer(): number[] {
    if (!this.data.outer) {
      this.median();
      this.iqr();
      this.data.outer = this.getOuter();
    }
    return this.data.outer;
  }

  private getOuter(multiple: number = DEFAULT_OUTLIER_MULTIPLE): number[] {
    const base = this.data.median;
    const iqr = this.data.iqr;
    if (base === undefined || iqr === undefined || isNaN(iqr)) {
      return [];
    }
    const extra = 2 * iqr * multiple;
    return [base - extra, base + extra];
  }

  // Outside values
  outside(): number[] {
    if (!this.data.outside) {
      this.outer();
      this.data.outside = this.getOutside();
    }
    return this.data.outside;
  }

  private getOutside(): number[] {
    const results: number[] = [];
    const sorted = this.data.sorted!;
    const outer = this.data.outer;
    if (!outer || outer.length === 0) return [];
    const min = Math.min(...outer);
    const max = Math.max(...outer);
    for (const num of sorted) {
      if (num > max || num < min) {
        results.push(num);
      }
    }
    return results;
  }

  // Inside values
  inside(): number[] {
    if (!this.data.inside) {
      this.fences();
      this.data.inside = this.getInside();
    }
    return this.data.inside;
  }

  private getInside(): number[] {
    const results: number[] = [];
    const sorted = this.data.sorted!;
    const fences = this.data.fences;
    if (!fences || fences.length === 0) return [];
    const min = Math.min(...fences);
    const max = Math.max(...fences);
    for (const num of sorted) {
      if (num < max && num > min) {
        results.push(num);
      }
    }
    return results;
  }

  // Outliers
  outliers(): number[] {
    if (!this.data.outliers) {
      this.fences();
      this.data.outliers = this.getOutliers();
    }
    return this.data.outliers;
  }

  private getOutliers(): number[] {
    const results: number[] = [];
    const sorted = this.data.sorted!;
    const fences = this.data.fences!;
    if (fences.length === 0) return [];
    const min = Math.min(...fences);
    const max = Math.max(...fences);
    for (const num of sorted) {
      if (num > max || num < min) {
        results.push(num);
      }
    }
    return results;
  }

  // Ranked
  ranked(): RankedResult {
    if (!this.data.ranked) {
      this.sorted();
      this.data.ranked = this.getRanked(this.data.sorted!);
    }
    return this.data.ranked;
  }

  private getRanked(arr: number[], ties: boolean = true): RankedResult {
    const up: Record<number, RankInfo> = {};
    const down: Record<number, RankInfo> = {};
    const total = arr.length;
    const ranked: (number | number[])[] = [];

    let tiedRank = NaN;
    let tiedNumbers: number[] = [];

    const reset = () => {
      tiedRank = NaN;
      tiedNumbers = [];
    };

    for (let i = 0; i < arr.length; i++) {
      const num = arr[i];

      if (!ties) {
        up[num] = { rank: i + 1, peers: 0 };
        down[num] = { rank: total - i, peers: 0 };
      } else {
        const incr = i + 1;
        const decr = i - 1;

        if (num === arr[decr]) {
          if (!isNaN(tiedRank) && tiedNumbers.length === 0) {
            tiedNumbers.push(num);
            ranked.push(tiedNumbers);
            reset();
          } else {
            tiedNumbers.push(num);
            tiedRank = decr;
          }
          if (num !== arr[incr]) {
            ranked.push(tiedNumbers);
            reset();
          }
        } else {
          if (num !== arr[incr]) {
            if (tiedNumbers.length > 0) {
              ranked.push(tiedNumbers);
              reset();
            } else {
              ranked.push(num);
            }
          } else {
            tiedNumbers.push(num);
          }
        }
      }
    }

    let offset = 0;
    for (let i = 0; i < ranked.length; i++) {
      const item = ranked[i];
      if (typeof item === 'number') {
        down[item] = { rank: i + 1 + offset, peers: 0 };
        up[item] = { rank: total - i - offset, peers: 0 };
      } else if (Array.isArray(item)) {
        offset += item.length;
        const usable = item[0];
        down[usable] = { rank: i + 1 + offset, peers: item.length };
        up[usable] = { rank: total - i - offset, peers: item.length };
      } else {
        offset += 1;
      }
    }

    return {
      up,
      down,
      groups: {
        down: [...ranked],
        up: [...ranked].reverse(),
      },
    };
  }

  // Adjacent
  adjacent(): number[] {
    if (!this.data.adjacent) {
      this.fences();
      this.data.adjacent = this.getAdjacent(this.data.sorted!, this.data.fences!);
    }
    return this.data.adjacent;
  }

  private getAdjacent(arr: number[], fences: number[]): number[] {
    if (fences.length === 0) return [];

    const low = fences[0];
    const lows: number[] = [];
    const high = fences[1];
    const highs: number[] = [];

    for (const val of arr) {
      if (val > low) lows.push(val);
      if (val < high) highs.push(val);
    }

    lows.sort((a, b) => a - b);
    highs.sort((a, b) => a - b);

    return [lows[0], highs[highs.length - 1]];
  }

  // Binned
  binned(bins: number = NaN): BinnedResult {
    if (!this.data.binned) {
      this.sorted();
      this.extremes();
      this.data.binned = this.getBinned(this.data.sorted!, bins);
    }
    return this.data.binned;
  }

  private getBinned(
    arr: number[],
    bins: number = 10,
    width: number = NaN,
    includeZero: boolean = true
  ): BinnedResult {
    const binned: Record<number, { from: number; to: number; data: number[] }> = {};
    const total = arr.length;
    const zeroOffset = includeZero ? 0 : 1;

    if (total === 0) {
      return { bins: 0, width: NaN, binned: {} };
    }

    const extremes = this.data.extremes!;
    let calculatedWidth = width;

    if (extremes && isNaN(calculatedWidth) && extremes.length === 2) {
      calculatedWidth = (extremes[1] - extremes[0]) / (Math.log(arr.length) / Math.LN2);
      calculatedWidth = Math.floor(calculatedWidth);

      let areIntegers = true;
      for (const item of arr) {
        if (item % 1 !== 0) {
          areIntegers = false;
          break;
        }
      }
      if (areIntegers) {
        calculatedWidth = Math.floor(calculatedWidth);
      }
    }

    let binCount = Math.floor(extremes[1] / calculatedWidth) + 1;
    if (!binCount || binCount < 1) {
      binCount = 1;
    }

    for (const val of arr) {
      const bin = Math.floor((val - zeroOffset) / calculatedWidth);
      if (!binned[bin]) {
        binned[bin] = {
          from: bin * calculatedWidth + zeroOffset,
          to: (bin + 1) * calculatedWidth + zeroOffset - 1,
          data: [],
        };
      }
      binned[bin].data.push(val);
    }

    return {
      bins: binCount,
      width: calculatedWidth,
      binned,
    };
  }

  // Transforms
  logs(): number[] {
    if (!this.data.logs) {
      this.data.logs = this.getLogs(this.data.original);
    }
    return this.data.logs;
  }

  private getLogs(arr: number[]): number[] {
    return arr.map((val) => Math.log(val));
  }

  roots(): number[] {
    if (!this.data.roots) {
      this.data.roots = this.getRoots(this.data.original);
    }
    return this.data.roots;
  }

  private getRoots(arr: number[]): number[] {
    return arr.map((val) => Math.sqrt(val));
  }

  inverse(): number[] {
    if (!this.data.inverse) {
      this.data.inverse = this.getInverse(this.data.original);
    }
    return this.data.inverse;
  }

  private getInverse(arr: number[]): number[] {
    return arr.map((val) => 1 / val);
  }

  // Smoothing
  hanning(): number[] {
    if (!this.data.hanning) {
      this.data.hanning = this.getSkipMeans(this.data.original);
    }
    return this.data.hanning;
  }

  private getSkipMeans(arr: number[]): number[] {
    const results: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i !== 0 && i !== arr.length - 1) {
        results.push((arr[i] + arr[i + 1]) / 2);
      }
    }
    results.unshift(arr[0]);
    results.push(arr[arr.length - 1]);
    return results;
  }

  smooth(): number[] {
    if (!this.data.smooth) {
      this.sorted();
      this.data.smooth = this.getSmooth(this.data.original);
    }
    this.data.rough = this.getRough(this.data.original, this.data.smooth);
    return this.data.smooth;
  }

  private getRough(original: number[], smoothed: number[]): number[] {
    const residuals: number[] = [];
    for (let x = 0; x < original.length; x++) {
      residuals.push(original[x] - smoothed[x]);
    }
    return residuals;
  }

  private getSmooth(arr: number[], passes: number = 3): number[] {
    let smoothed = [...arr];
    smoothed = this.smoothMedian(smoothed, passes);
    smoothed = this.smoothExtremes(smoothed, -1);
    smoothed = this.smoothSplit(smoothed, 2);
    smoothed = this.smoothMedian(smoothed, passes);
    smoothed = this.smoothExtremes(smoothed, -1);
    smoothed = this.smoothMedian(smoothed, passes);
    return smoothed;
  }

  private smoothExtremes(
    arr: number[],
    passes: number = 1,
    current: number = 0,
    end: 'both' | 'head' | 'tail' = 'both'
  ): number[] {
    const len = arr.length;
    if (len <= 2) return [...arr];

    const result = [...arr];

    for (let pass = current; pass < passes || passes === -1; pass++) {
      let changed = false;

      if (end === 'both' || end === 'head') {
        const first = result[0];
        const second = result[1];
        const third = result[2];
        const tmp = second - 2 * (third - second);
        // Median of three: sort and pick middle
        const median =
          first <= second
            ? second <= tmp
              ? second
              : first <= tmp
                ? tmp
                : first
            : first <= tmp
              ? first
              : second <= tmp
                ? tmp
                : second;
        if (result[0] !== median) {
          result[0] = median;
          changed = true;
        }
      }

      if (end === 'both' || end === 'tail') {
        const antepenultimate = result[len - 3];
        const penultimate = result[len - 2];
        const last = result[len - 1];
        const tmp = penultimate - 2 * (antepenultimate - penultimate);
        const median =
          last <= penultimate
            ? penultimate <= tmp
              ? penultimate
              : last <= tmp
                ? tmp
                : last
            : last <= tmp
              ? last
              : penultimate <= tmp
                ? tmp
                : penultimate;
        if (result[len - 1] !== median) {
          result[len - 1] = median;
          changed = true;
        }
      }

      if (passes === -1 && !changed) {
        break;
      }
    }
    return result;
  }

  private smoothSplit(
    arr: number[],
    passes: number = DEFAULT_SPLIT_PASSES,
    current: number = 0
  ): number[] {
    let result = [...arr];
    const len = arr.length;

    for (let pass = current; pass < passes || passes === -1; pass++) {
      let changed = false;

      for (let i = 2; i < len - 1; i++) {
        const num = result[i];
        const t1 = result[i - 1];
        const t2 = result[i - 2];
        const f1 = result[i + 1];

        if (num === t1 && ((t1 > t2 && num > f1) || (t1 < t2 && num < f1))) {
          // Apply smoothExtremes at split point in-place
          const left = this.smoothExtremes(result.slice(0, i));
          const right = this.smoothExtremes(result.slice(i));
          result = left.concat(right);
          changed = true;
        }
      }

      if (passes === -1 && !changed) {
        return result;
      }
    }
    return result;
  }

  private smoothMedian(arr: number[], passes: number = 1, current: number = 0): number[] {
    let result = arr;
    const len = arr.length;
    if (len <= 2) return [...arr];

    for (let pass = current; pass < passes || passes === -1; pass++) {
      const next = new Array<number>(len);
      next[0] = result[0];
      next[len - 1] = result[len - 1];

      let changed = false;
      for (let i = 1; i < len - 1; i++) {
        const val = result[i];
        const smoothed = Math.min(Math.max(result[i - 1], val), result[i + 1]);
        next[i] = smoothed;
        if (smoothed !== val) changed = true;
      }

      if (passes === -1 && !changed) {
        return result;
      }
      result = next;
    }
    return result;
  }

  private jitter(
    arr: number[],
    passes: number = 1,
    floor: number = NaN,
    multiplier: number = DEFAULT_JITTER_MULTIPLIER,
    weight: number = NaN,
    current: number = 0
  ): number[] {
    const nextCurrent = current + 1;
    const copy = [...arr];

    if (nextCurrent <= passes) {
      const jittered: number[] = [];
      for (const num of copy) {
        let w = weight;
        if (!w && !isNaN(w)) {
          w = (1 + Math.floor(num / 10)) * (Math.random() > 0.5 ? 1 : -1);
        }
        let value = num + Math.floor(Math.random() * multiplier * w);
        if (!isNaN(floor) && value < floor) {
          value = floor;
        }
        jittered.push(value);
      }
      return this.jitter(jittered, passes, floor, multiplier, weight, nextCurrent);
    }
    return copy;
  }

  // Trimean (Tukey's trimean: (Q1 + 2*median + Q3) / 4)
  trimean(): number {
    const med = this.median();
    const h = this.hinges();
    if (h.length < 2) return med.datum;
    return (h[0].datum + 2 * med.datum + h[1].datum) / 4;
  }

  // Letter values (depth-based summaries beyond hinges)
  letterValues(): Array<{ letter: string; depth: number; lower: number; upper: number; mid: number; spread: number }> {
    this.sorted();
    const n = this.data.sorted!.length;
    if (n < 2) return [];

    const letters = ['M', 'F', 'E', 'D', 'C', 'B', 'A', 'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S'];
    const results: Array<{ letter: string; depth: number; lower: number; upper: number; mid: number; spread: number }> = [];

    // M = median
    const medDepth = (n + 1) / 2;
    const medValue = this.median().datum;
    results.push({
      letter: 'M',
      depth: medDepth,
      lower: medValue,
      upper: medValue,
      mid: medValue,
      spread: 0,
    });

    // Subsequent letter values
    let depth = medDepth;
    let letterIdx = 1;

    while (depth > 1 && letterIdx < letters.length) {
      depth = Math.floor((Math.floor(depth) + 1) / 2);
      if (depth < 1) break;

      const lowerIdx = Math.ceil(depth) - 1;
      const upperIdx = n - Math.ceil(depth);

      if (lowerIdx < 0 || upperIdx >= n || lowerIdx >= upperIdx) break;

      const lower = this.data.sorted![lowerIdx];
      const upper = this.data.sorted![upperIdx];
      const mid = (lower + upper) / 2;
      const spread = upper - lower;

      results.push({
        letter: letters[letterIdx],
        depth,
        lower,
        upper,
        mid,
        spread,
      });

      letterIdx++;
    }

    return results;
  }

  // Rough (residuals: original - smooth)
  rough(): number[] {
    if (!this.data.rough) {
      this.smooth();
    }
    return this.data.rough || [];
  }

  // Stem-and-leaf display (text-based visualization)
  stemLeaf(leafDigits: number = 1): { stems: string[]; leaves: Record<string, string[]>; display: string[] } {
    this.sorted();
    const data = this.data.sorted!;
    if (!data.length) return { stems: [], leaves: {}, display: [] };

    const scale = Math.pow(10, leafDigits);
    const stems = new Map<number, number[]>();

    for (const val of data) {
      const stem = Math.floor(val / scale);
      const leaf = Math.abs(Math.round(val % scale));
      if (!stems.has(stem)) {
        stems.set(stem, []);
      }
      stems.get(stem)!.push(leaf);
    }

    const sortedStems = Array.from(stems.keys()).sort((a, b) => a - b);
    const stemStrings: string[] = [];
    const leavesRecord: Record<string, string[]> = {};
    const display: string[] = [];

    for (const stem of sortedStems) {
      const stemStr = String(stem);
      stemStrings.push(stemStr);
      const leaves = stems.get(stem)!.sort((a, b) => a - b).map(String);
      leavesRecord[stemStr] = leaves;
      display.push(`${stemStr.padStart(4)} | ${leaves.join(' ')}`);
    }

    return { stems: stemStrings, leaves: leavesRecord, display };
  }

  // Mid-summaries (averages of symmetric quantile pairs)
  midSummaries(): Array<{ depth: number; mid: number; spread: number }> {
    const lv = this.letterValues();
    return lv.map(({ depth, mid, spread }) => ({ depth, mid, spread }));
  }

  // Describe - full summary
  describe(): SeriesDescription {
    this.data.description = {
      original: this.data.original,
      summary: {
        median: this.median(),
        mean: this.mean(),
        mode: this.mode(),
        hinges: this.hinges(),
        adjacent: this.adjacent(),
        outliers: this.outliers(),
        outer: this.outer(),
        outside: this.outside(),
        inside: this.inside(),
        extremes: this.extremes(),
        iqr: this.iqr(),
        fences: this.fences(),
      },
      smooths: {
        smooth: this.smooth(),
        hanning: this.hanning(),
      },
      transforms: {
        logs: this.logs(),
        roots: this.roots(),
        inverse: this.inverse(),
      },
      counts: this.counts(),
      sorted: this.sorted(),
      ranked: this.ranked(),
      binned: this.binned(),
    };
    return this.data.description;
  }
}

/**
 * Points class for n-dimensional data exploration
 */
export class Points {
  private data: {
    original: number[][];
    centroid?: number[];
    variances?: number[];
    stddevs?: number[];
    covarianceMatrix?: number[][];
    correlationMatrix?: number[][];
    mahalanobisDistances?: number[];
    description?: PointsDescription;
  };
  private dimension: number;
  private count: number;

  constructor(options: PointsOptions | number = {}) {
    if (typeof options === 'number') {
      this.count = options;
      this.dimension = DEFAULT_MAX_RANDOM_DIMENSIONALITY;
      this.data = {
        original: randomPoints(this.count, this.dimension),
      };
    } else {
      this.dimension = options.dimensionality ?? 2;
      this.count = options.count ?? 100;
      this.data = {
        original: options.data ?? randomPoints(this.count, this.dimension),
      };
      if (options.data && options.data.length > 0) {
        this.dimension = options.data[0].length;
        this.count = options.data.length;
      }
    }
  }

  // Mean point across all dimensions
  centroid(): number[] {
    if (!this.data.centroid) {
      const pts = this.data.original;
      const dim = this.dimension;
      const n = pts.length;
      if (n === 0) {
        this.data.centroid = [];
        return this.data.centroid;
      }
      const sums = new Array<number>(dim).fill(0);
      for (const pt of pts) {
        for (let d = 0; d < dim; d += 1) {
          sums[d] += pt[d] ?? 0;
        }
      }
      this.data.centroid = sums.map((s) => s / n);
    }
    return this.data.centroid;
  }

  // Per-dimension sample variance
  variances(): number[] {
    if (!this.data.variances) {
      const pts = this.data.original;
      const dim = this.dimension;
      const n = pts.length;
      if (n < 2) {
        this.data.variances = new Array<number>(dim).fill(NaN);
        return this.data.variances;
      }
      const means = this.centroid();
      const sums = new Array<number>(dim).fill(0);
      for (const pt of pts) {
        for (let d = 0; d < dim; d += 1) {
          const delta = (pt[d] ?? 0) - means[d];
          sums[d] += delta * delta;
        }
      }
      this.data.variances = sums.map((s) => s / (n - 1));
    }
    return this.data.variances;
  }

  // Per-dimension standard deviation
  standardDeviations(): number[] {
    if (!this.data.stddevs) {
      this.data.stddevs = this.variances().map((v) => Math.sqrt(v));
    }
    return this.data.stddevs;
  }

  // Full covariance matrix
  covarianceMatrix(): number[][] {
    if (!this.data.covarianceMatrix) {
      const pts = this.data.original;
      const dim = this.dimension;
      const n = pts.length;
      const means = this.centroid();

      const cov: number[][] = Array.from({ length: dim }, () =>
        new Array<number>(dim).fill(0),
      );

      if (n < 2) {
        this.data.covarianceMatrix = cov;
        return this.data.covarianceMatrix;
      }

      for (const pt of pts) {
        for (let i = 0; i < dim; i += 1) {
          const di = (pt[i] ?? 0) - means[i];
          for (let j = i; j < dim; j += 1) {
            const dj = (pt[j] ?? 0) - means[j];
            cov[i][j] += di * dj;
          }
        }
      }

      for (let i = 0; i < dim; i += 1) {
        for (let j = i; j < dim; j += 1) {
          cov[i][j] /= n - 1;
          cov[j][i] = cov[i][j];
        }
      }

      this.data.covarianceMatrix = cov;
    }
    return this.data.covarianceMatrix;
  }

  // Pearson correlation matrix
  correlationMatrix(): number[][] {
    if (!this.data.correlationMatrix) {
      const cov = this.covarianceMatrix();
      const dim = this.dimension;
      const stddevs = this.standardDeviations();

      const corr: number[][] = Array.from({ length: dim }, () =>
        new Array<number>(dim).fill(0),
      );

      for (let i = 0; i < dim; i += 1) {
        for (let j = 0; j < dim; j += 1) {
          const denom = stddevs[i] * stddevs[j];
          corr[i][j] = denom === 0 ? (i === j ? 1 : 0) : cov[i][j] / denom;
        }
      }

      this.data.correlationMatrix = corr;
    }
    return this.data.correlationMatrix;
  }

  // Mahalanobis distance of a single point from the distribution
  mahalanobis(point: number[]): number {
    const means = this.centroid();
    const vars = this.variances();
    const dim = Math.min(point.length, means.length, vars.length);
    if (dim === 0) return 0;

    let sum = 0;
    for (let i = 0; i < dim; i += 1) {
      const delta = (point[i] ?? 0) - means[i];
      const v = Math.max(vars[i], 1e-8);
      sum += (delta * delta) / v;
    }
    return Math.sqrt(sum);
  }

  // Mahalanobis distance for each stored point
  mahalanobisAll(): number[] {
    if (!this.data.mahalanobisDistances) {
      const means = this.centroid();
      const vars = this.variances();
      this.data.mahalanobisDistances = this.data.original.map((pt) => {
        const dim = Math.min(pt.length, means.length, vars.length);
        let sum = 0;
        for (let i = 0; i < dim; i += 1) {
          const delta = (pt[i] ?? 0) - means[i];
          const v = Math.max(vars[i], 1e-8);
          sum += (delta * delta) / v;
        }
        return Math.sqrt(sum);
      });
    }
    return this.data.mahalanobisDistances;
  }

  // Outlier detection: points with Mahalanobis distance > threshold
  outliersByMahalanobis(threshold: number = 3.0): number[][] {
    const distances = this.mahalanobisAll();
    const results: number[][] = [];
    for (let i = 0; i < distances.length; i += 1) {
      if (distances[i] > threshold) {
        results.push(this.data.original[i]);
      }
    }
    return results;
  }

  // L2-normalize all points (returns new Points)
  normalizeL2(): Points {
    const normalized = this.data.original.map((pt) => {
      let sumSq = 0;
      for (const v of pt) {
        sumSq += v * v;
      }
      const mag = Math.sqrt(sumSq);
      if (mag === 0) return pt.map(() => 0);
      return pt.map((v) => v / mag);
    });
    return new Points({ data: normalized });
  }

  // Z-score normalize per dimension (returns new Points)
  normalizeZscore(): Points {
    const means = this.centroid();
    const stddevs = this.standardDeviations();
    const dim = this.dimension;

    const normalized = this.data.original.map((pt) => {
      const result = new Array<number>(dim);
      for (let d = 0; d < dim; d += 1) {
        const s = stddevs[d];
        result[d] = s === 0 || isNaN(s) ? 0 : ((pt[d] ?? 0) - means[d]) / s;
      }
      return result;
    });
    return new Points({ data: normalized });
  }

  // Full description
  describe(): PointsDescription {
    const distances = this.mahalanobisAll();
    const outlierCount = distances.filter((d) => d > 3.0).length;

    // Build per-dimension Series summaries
    const dim = this.dimension;
    const dimensionSummaries: SeriesDescription[] = [];
    for (let d = 0; d < dim; d += 1) {
      const values = this.data.original.map((pt) => pt[d] ?? 0);
      const series = new Series({ data: values });
      dimensionSummaries.push(series.describe());
    }

    this.data.description = {
      original: this.data.original,
      centroid: this.centroid(),
      variances: this.variances(),
      correlationMatrix: this.correlationMatrix(),
      mahalanobisDistances: distances,
      outlierCount,
      dimensionSummaries,
    };
    return this.data.description;
  }
}

/**
 * Main Twokeys class - factory for Series and Points
 */
export class Twokeys {
  public smoothed: boolean = false;

  // Constants
  static readonly DEFAULT_MAX_RANDOM_INTEGER = DEFAULT_MAX_RANDOM_INTEGER;
  static readonly DEFAULT_MIN_RANDOM_INTEGER = DEFAULT_MIN_RANDOM_INTEGER;
  static readonly DEFAULT_RANDOM_SERIES_COUNT = DEFAULT_RANDOM_SERIES_COUNT;
  static readonly DEFAULT_OUTLIER_MULTIPLE = DEFAULT_OUTLIER_MULTIPLE;
  static readonly DEFAULT_JITTER_MULTIPLIER = DEFAULT_JITTER_MULTIPLIER;
  static readonly DEFAULT_SPLIT_PASSES = DEFAULT_SPLIT_PASSES;
  static readonly DEFAULT_MAX_RANDOM_DIMENSIONALITY = DEFAULT_MAX_RANDOM_DIMENSIONALITY;

  // Static factory methods
  static Series = Series;
  static Points = Points;

  // Utility methods
  static randomInteger = randomInteger;
  static randomSeries = randomSeries;
  static randomPoint = randomPoint;
  static randomPoints = randomPoints;
}

export * from './distance';
export * from './graph';
export * from './graph-eda';
export * from './gds';

// Default export
export default Twokeys;
