/**
 * @buley/twokeys-wasm — WASM-accelerated statistics, distance & analysis
 *
 * Automatically uses WebAssembly when available, falls back to TypeScript.
 * Covers the full v3 API surface: Series statistics, distance functions,
 * outlier detection, transforms, smoothing, and comprehensive analysis.
 */

import type {
  MedianResult,
  ModeResult,
  RankedResult,
  BinnedResult,
  SeriesDescription,
} from '@buley/twokeys-types';

// Re-export types consumers need
export type {
  MedianResult,
  ModeResult,
  RankedResult,
  BinnedResult,
  SeriesDescription,
} from '@buley/twokeys-types';

// =============================================================================
// Additional types
// =============================================================================

export interface LetterValue {
  letter: string;
  depth: number;
  lower: number;
  upper: number;
  mid: number;
  spread: number;
}

export interface StemLeafResult {
  stems: string[];
  leaves: Record<string, string[]>;
  display: string[];
}

export interface MidSummary {
  depth: number;
  mid: number;
  spread: number;
}

export interface AnalysisResult extends SeriesDescription {
  implementation: 'wasm' | 'typescript';
}

// =============================================================================
// TypeScript fallback implementations
// =============================================================================

// --- Sorting ----------------------------------------------------------------

function tsSorted(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

// --- Core Statistics --------------------------------------------------------

function tsMean(arr: number[]): number {
  if (!arr.length) return NaN;
  let sum = 0;
  for (const n of arr) sum += n;
  return sum / arr.length;
}

function tsMedian(sorted: number[]): number {
  const len = sorted.length;
  if (!len) return NaN;
  if (len === 1) return sorted[0];
  const mid = Math.floor(len / 2);
  return len % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function tsMedianDepth(length: number, offset: number = 0): number {
  if (!length) return NaN;
  return offset + (length + 1) / 2;
}

function tsMode(data: number[]): ModeResult {
  if (!data.length) return { count: 0, data: [] };
  const freq = new Map<number, number>();
  let maxCount = 0;
  for (const val of data) {
    const count = (freq.get(val) || 0) + 1;
    freq.set(val, count);
    if (count > maxCount) maxCount = count;
  }
  const modes: number[] = [];
  for (const [val, count] of freq) {
    if (count === maxCount) modes.push(val);
  }
  return { count: maxCount, data: modes.sort((a, b) => a - b) };
}

function tsExtremes(sorted: number[]): [number, number] {
  if (!sorted.length) return [NaN, NaN];
  return [sorted[0], sorted[sorted.length - 1]];
}

function tsVariance(data: number[]): number {
  if (data.length < 2) return NaN;
  const m = tsMean(data);
  let sum = 0;
  for (const val of data) {
    const delta = val - m;
    sum += delta * delta;
  }
  return sum / (data.length - 1);
}

function tsStddev(data: number[]): number {
  return Math.sqrt(tsVariance(data));
}

function tsSkewness(data: number[]): number {
  const n = data.length;
  if (n < 3) return NaN;
  const m = tsMean(data);
  const s = tsStddev(data);
  if (s === 0) return 0;
  let sum = 0;
  for (const val of data) {
    const z = (val - m) / s;
    sum += z * z * z;
  }
  return (n / ((n - 1) * (n - 2))) * sum;
}

function tsKurtosis(data: number[]): number {
  const n = data.length;
  if (n < 4) return NaN;
  const m = tsMean(data);
  const s = tsStddev(data);
  if (s === 0) return 0;
  let sum = 0;
  for (const val of data) {
    const z = (val - m) / s;
    sum += z * z * z * z;
  }
  const rawKurt = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * sum;
  const correction = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  return rawKurt - correction;
}

// --- Quartiles & Fences -----------------------------------------------------

function tsHinges(sorted: number[]): MedianResult[] {
  const len = sorted.length;
  if (len < 4) return [];
  const per = Math.floor(len / 2);
  const q1Slice = sorted.slice(0, per);
  const q3Slice = sorted.slice(per);
  return [
    { datum: tsMedian(q1Slice), depth: tsMedianDepth(per, 0) },
    { datum: tsMedian(q3Slice), depth: tsMedianDepth(q3Slice.length, per) },
  ];
}

function tsIqr(h: MedianResult[]): number {
  if (h.length < 2) return NaN;
  return Math.abs(h[1].datum - h[0].datum);
}

function tsFences(med: number, iqrVal: number, multiple: number = 1.5): [number, number] {
  if (isNaN(med) || isNaN(iqrVal)) return [NaN, NaN];
  const extra = iqrVal * multiple;
  return [med - extra, med + extra];
}

function tsOuterFences(med: number, iqrVal: number, multiple: number = 1.5): [number, number] {
  if (isNaN(med) || isNaN(iqrVal)) return [NaN, NaN];
  const extra = 2 * iqrVal * multiple;
  return [med - extra, med + extra];
}

function tsOutliers(sortedData: number[], f: [number, number]): number[] {
  if (isNaN(f[0]) || isNaN(f[1])) return [];
  return sortedData.filter((n) => n < f[0] || n > f[1]);
}

// --- Filtering --------------------------------------------------------------

function tsAdjacent(sortedData: number[], f: number[]): number[] {
  if (f.length === 0) return [];
  const low = f[0];
  const high = f[1];
  const lows: number[] = [];
  const highs: number[] = [];
  for (const val of sortedData) {
    if (val > low) lows.push(val);
    if (val < high) highs.push(val);
  }
  lows.sort((a, b) => a - b);
  highs.sort((a, b) => a - b);
  return [lows[0], highs[highs.length - 1]];
}

function tsInside(sortedData: number[], f: number[]): number[] {
  if (f.length === 0) return [];
  const lo = Math.min(...f);
  const hi = Math.max(...f);
  return sortedData.filter((n) => n > lo && n < hi);
}

function tsOutside(sortedData: number[], outer: number[]): number[] {
  if (outer.length === 0) return [];
  const lo = Math.min(...outer);
  const hi = Math.max(...outer);
  return sortedData.filter((n) => n < lo || n > hi);
}

// --- Ordering ---------------------------------------------------------------

function tsCounts(sortedData: number[]): [number, number][] {
  const freq = new Map<number, number>();
  for (const val of sortedData) {
    freq.set(val, (freq.get(val) || 0) + 1);
  }
  const result: [number, number][] = [];
  for (const [val, count] of freq) {
    result.push([val, count]);
  }
  return result.sort((a, b) => a[0] - b[0]);
}

function tsRanked(sortedData: number[]): RankedResult {
  const up: Record<number, { rank: number; peers: number }> = {};
  const down: Record<number, { rank: number; peers: number }> = {};
  const total = sortedData.length;
  const ranked: (number | number[])[] = [];

  let tiedRank = NaN;
  let tiedNumbers: number[] = [];

  const reset = (): void => {
    tiedRank = NaN;
    tiedNumbers = [];
  };

  for (let i = 0; i < sortedData.length; i++) {
    const num = sortedData[i];
    const incr = i + 1;
    const decr = i - 1;

    if (num === sortedData[decr]) {
      if (!isNaN(tiedRank) && tiedNumbers.length === 0) {
        tiedNumbers.push(num);
        ranked.push(tiedNumbers);
        reset();
      } else {
        tiedNumbers.push(num);
        tiedRank = decr;
      }
      if (num !== sortedData[incr]) {
        ranked.push(tiedNumbers);
        reset();
      }
    } else {
      if (num !== sortedData[incr]) {
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

function tsBinned(sortedData: number[], ext: number[]): BinnedResult {
  const binned: Record<number, { from: number; to: number; data: number[] }> = {};
  const total = sortedData.length;

  if (total === 0 || ext.length < 2) {
    return { bins: 0, width: NaN, binned: {} };
  }

  let width = (ext[1] - ext[0]) / (Math.log(sortedData.length) / Math.LN2);
  width = Math.floor(width);
  if (width < 1) width = 1;

  let binCount = Math.floor(ext[1] / width) + 1;
  if (!binCount || binCount < 1) binCount = 1;

  for (const val of sortedData) {
    const bin = Math.floor(val / width);
    if (!binned[bin]) {
      binned[bin] = {
        from: bin * width,
        to: (bin + 1) * width - 1,
        data: [],
      };
    }
    binned[bin].data.push(val);
  }

  return { bins: binCount, width, binned };
}

// --- Transforms -------------------------------------------------------------

function tsLogs(arr: number[]): number[] {
  return arr.map((n) => Math.log(n));
}

function tsRoots(arr: number[]): number[] {
  return arr.map((n) => Math.sqrt(n));
}

function tsInverse(arr: number[]): number[] {
  return arr.map((n) => 1 / n);
}

function tsZscore(data: number[]): number[] {
  const m = tsMean(data);
  const s = tsStddev(data);
  if (s === 0 || isNaN(s)) return data.map(() => 0);
  return data.map((val) => (val - m) / s);
}

// --- Smoothing --------------------------------------------------------------

function tsHanning(arr: number[]): number[] {
  if (arr.length < 2) return [...arr];
  const result: number[] = [arr[0]];
  for (let i = 1; i < arr.length - 1; i++) {
    result.push((arr[i] + arr[i + 1]) / 2);
  }
  result.push(arr[arr.length - 1]);
  return result;
}

function tsSmoothMedian(arr: number[]): number[] {
  if (arr.length <= 2) return [...arr];
  const result = new Array<number>(arr.length);
  result[0] = arr[0];
  result[arr.length - 1] = arr[arr.length - 1];
  for (let i = 1; i < arr.length - 1; i++) {
    result[i] = Math.min(Math.max(arr[i - 1], arr[i]), arr[i + 1]);
  }
  return result;
}

function tsSmoothExtremes(arr: number[]): number[] {
  if (arr.length <= 2) return [...arr];
  const result = [...arr];
  // Head
  const tmpHead = arr[1] - 2 * (arr[2] - arr[1]);
  const candidates = [arr[0], arr[1], tmpHead].sort((a, b) => a - b);
  result[0] = candidates[1];
  // Tail
  const tmpTail = arr[arr.length - 2] - 2 * (arr[arr.length - 3] - arr[arr.length - 2]);
  const tailCandidates = [arr[arr.length - 1], arr[arr.length - 2], tmpTail].sort((a, b) => a - b);
  result[arr.length - 1] = tailCandidates[1];
  return result;
}

function tsSmooth(arr: number[]): number[] {
  let result = [...arr];
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  result = tsSmoothExtremes(result);
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  result = tsSmoothExtremes(result);
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  return result;
}

function tsEma(data: number[], alpha: number): number[] {
  if (data.length === 0) return [];
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(result[i - 1] * (1 - alpha) + data[i] * alpha);
  }
  return result;
}

function tsRough(original: number[], smoothed: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < original.length; i++) {
    result.push(original[i] - (smoothed[i] ?? 0));
  }
  return result;
}

// --- Summaries --------------------------------------------------------------

function tsTrimean(q1: number, med: number, q3: number): number {
  return (q1 + 2 * med + q3) / 4;
}

function tsLetterValues(sortedData: number[], medResult: MedianResult): LetterValue[] {
  const n = sortedData.length;
  if (n < 2) return [];

  const letters = ['M', 'F', 'E', 'D', 'C', 'B', 'A', 'Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S'];
  const results: LetterValue[] = [];

  const medDepth = (n + 1) / 2;
  results.push({
    letter: 'M',
    depth: medDepth,
    lower: medResult.datum,
    upper: medResult.datum,
    mid: medResult.datum,
    spread: 0,
  });

  let depth = medDepth;
  let letterIdx = 1;

  while (depth > 1 && letterIdx < letters.length) {
    depth = Math.floor((Math.floor(depth) + 1) / 2);
    if (depth < 1) break;

    const lowerIdx = Math.ceil(depth) - 1;
    const upperIdx = n - Math.ceil(depth);
    if (lowerIdx < 0 || upperIdx >= n || lowerIdx >= upperIdx) break;

    const lower = sortedData[lowerIdx];
    const upper = sortedData[upperIdx];
    results.push({
      letter: letters[letterIdx],
      depth,
      lower,
      upper,
      mid: (lower + upper) / 2,
      spread: upper - lower,
    });
    letterIdx++;
  }

  return results;
}

function tsStemLeaf(sortedData: number[], leafDigits: number = 1): StemLeafResult {
  if (!sortedData.length) return { stems: [], leaves: {}, display: [] };

  const scale = Math.pow(10, leafDigits);
  const stemMap = new Map<number, number[]>();

  for (const val of sortedData) {
    const stem = Math.floor(val / scale);
    const leaf = Math.abs(Math.round(val % scale));
    if (!stemMap.has(stem)) stemMap.set(stem, []);
    stemMap.get(stem)!.push(leaf);
  }

  const stemKeys = Array.from(stemMap.keys()).sort((a, b) => a - b);
  const stems: string[] = [];
  const leaves: Record<string, string[]> = {};
  const display: string[] = [];

  for (const stem of stemKeys) {
    const stemStr = String(stem);
    stems.push(stemStr);
    const leafArr = stemMap.get(stem)!.sort((a, b) => a - b).map(String);
    leaves[stemStr] = leafArr;
    display.push(`${stemStr.padStart(4)} | ${leafArr.join(' ')}`);
  }

  return { stems, leaves, display };
}

// --- Distance (TS fallbacks) ------------------------------------------------

function tsCosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function tsSqEuclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const delta = (a[i] ?? 0) - (b[i] ?? 0);
    sum += delta * delta;
  }
  return sum;
}

function tsEuclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(tsSqEuclideanDistance(a, b));
}

function tsManhattanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
  }
  return sum;
}

function tsMahalanobisDistance(
  point: number[],
  means: number[],
  variances: number[],
  epsilon: number = 1e-8,
): number {
  const len = Math.min(point.length, means.length, variances.length);
  if (len === 0) return 0;
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const delta = (point[i] ?? 0) - (means[i] ?? 0);
    const v = Math.max(variances[i] ?? 0, epsilon);
    sum += (delta * delta) / v;
  }
  return Math.sqrt(sum);
}

function tsNormalizeL2(vector: number[]): number[] {
  let sumSq = 0;
  for (const v of vector) sumSq += v * v;
  const mag = Math.sqrt(sumSq);
  if (mag === 0) return vector.map(() => 0);
  return vector.map((v) => v / mag);
}

// =============================================================================
// WASM Loading
// =============================================================================

interface WasmExports {
  // v2 functions
  sort: (data: Float64Array) => Float64Array;
  mean: (data: Float64Array) => number;
  median: (data: Float64Array) => number;
  medianSorted: (sorted: Float64Array) => number;
  medianDepth: (length: number, offset?: number) => number;
  mode: (data: Float64Array) => Float64Array;
  extremes: (data: Float64Array) => Float64Array;
  extremesSorted: (sorted: Float64Array) => Float64Array;
  hingesSorted: (sorted: Float64Array) => Float64Array;
  iqrFromHinges: (hinges: Float64Array) => number;
  fences: (median: number, iqr: number, multiple?: number) => Float64Array;
  outerFences: (median: number, iqr: number, multiple?: number) => Float64Array;
  outliers: (sorted: Float64Array, fenceLow: number, fenceHigh: number) => Float64Array;
  logs: (data: Float64Array) => Float64Array;
  roots: (data: Float64Array) => Float64Array;
  inverse: (data: Float64Array) => Float64Array;
  hanning: (data: Float64Array) => Float64Array;
  smooth: (data: Float64Array) => Float64Array;
  // v3 statistics
  variance: (data: Float64Array) => number;
  stddev: (data: Float64Array) => number;
  skewness: (data: Float64Array) => number;
  kurtosis: (data: Float64Array) => number;
  emaCalc: (data: Float64Array, alpha: number) => Float64Array;
  zscoreCalc: (data: Float64Array) => Float64Array;
  roughCalc: (original: Float64Array, smoothed: Float64Array) => Float64Array;
  // v3 distance
  cosineSim: (a: Float64Array, b: Float64Array) => number;
  sqEuclideanDist: (a: Float64Array, b: Float64Array) => number;
  euclideanDist: (a: Float64Array, b: Float64Array) => number;
  manhattanDist: (a: Float64Array, b: Float64Array) => number;
  mahalanobisDist: (point: Float64Array, means: Float64Array, variances: Float64Array) => number;
  normalizeL2Vec: (vector: Float64Array) => Float64Array;
}

let wasmInstance: WasmExports | null = null;
let wasmLoadPromise: Promise<WasmExports | null> | null = null;

/**
 * Load WASM module. Falls back to TypeScript if unavailable.
 */
export async function loadWasm(): Promise<WasmExports | null> {
  if (wasmInstance) return wasmInstance;
  if (wasmLoadPromise) return wasmLoadPromise;

  wasmLoadPromise = (async () => {
    try {
      const wasmUrl = new URL('../build/release.wasm', import.meta.url);
      const response = await fetch(wasmUrl);
      const wasmBuffer = await response.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(wasmBuffer);
      wasmInstance = wasmModule.instance.exports as unknown as WasmExports;
      return wasmInstance;
    } catch {
      console.warn('@buley/twokeys-wasm: WASM not available, using TypeScript fallback');
      return null;
    }
  })();

  return wasmLoadPromise;
}

/**
 * Check if WASM is loaded and available.
 */
export function isWasmLoaded(): boolean {
  return wasmInstance !== null;
}

// =============================================================================
// Hybrid API — Sorting
// =============================================================================

/** Sort array ascending. */
export function sorted(data: number[]): number[] {
  if (wasmInstance) {
    return Array.from(wasmInstance.sort(new Float64Array(data)));
  }
  return tsSorted(data);
}

// =============================================================================
// Hybrid API — Core Statistics
// =============================================================================

/** Arithmetic mean. */
export function mean(data: number[]): number {
  if (wasmInstance) return wasmInstance.mean(new Float64Array(data));
  return tsMean(data);
}

/** Median value and depth. */
export function median(data: number[]): MedianResult {
  const s = sorted(data);
  const datum = wasmInstance
    ? wasmInstance.medianSorted(new Float64Array(s))
    : tsMedian(s);
  const depth = wasmInstance
    ? wasmInstance.medianDepth(data.length)
    : tsMedianDepth(data.length);
  return { datum, depth };
}

/** Mode (most frequent values). */
export function mode(data: number[]): ModeResult {
  if (wasmInstance) {
    const result = wasmInstance.mode(new Float64Array(data));
    return { count: result[0], data: Array.from(result.slice(1)) };
  }
  return tsMode(data);
}

/** [min, max] values. */
export function extremes(data: number[]): [number, number] {
  if (wasmInstance) {
    const result = wasmInstance.extremes(new Float64Array(data));
    return [result[0], result[1]];
  }
  return tsExtremes(tsSorted(data));
}

/** Sample variance: Σ(x - mean)² / (n - 1). */
export function variance(data: number[]): number {
  if (wasmInstance) return wasmInstance.variance(new Float64Array(data));
  return tsVariance(data);
}

/** Standard deviation. */
export function stddev(data: number[]): number {
  if (wasmInstance) return wasmInstance.stddev(new Float64Array(data));
  return tsStddev(data);
}

/** Fisher-Pearson skewness. */
export function skewness(data: number[]): number {
  if (wasmInstance) return wasmInstance.skewness(new Float64Array(data));
  return tsSkewness(data);
}

/** Excess kurtosis. */
export function kurtosis(data: number[]): number {
  if (wasmInstance) return wasmInstance.kurtosis(new Float64Array(data));
  return tsKurtosis(data);
}

// =============================================================================
// Hybrid API — Quartiles & Outlier Detection
// =============================================================================

/** Quartile boundaries (Q1, Q3). */
export function hinges(data: number[]): MedianResult[] {
  const s = sorted(data);
  if (wasmInstance) {
    const result = wasmInstance.hingesSorted(new Float64Array(s));
    if (isNaN(result[0])) return [];
    return [
      { datum: result[0], depth: result[1] },
      { datum: result[2], depth: result[3] },
    ];
  }
  return tsHinges(s);
}

/** Interquartile range. */
export function iqr(data: number[]): number {
  return tsIqr(hinges(data));
}

/** Inner fence boundaries (1.5 × IQR from median). */
export function fences(data: number[], multiple: number = 1.5): [number, number] {
  const s = sorted(data);
  const med = wasmInstance
    ? wasmInstance.medianSorted(new Float64Array(s))
    : tsMedian(s);
  const iqrVal = tsIqr(hinges(data));
  if (wasmInstance) {
    const result = wasmInstance.fences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsFences(med, iqrVal, multiple);
}

/** Outer fence boundaries (3 × IQR from median). */
export function outerFences(data: number[], multiple: number = 1.5): [number, number] {
  const s = sorted(data);
  const med = wasmInstance
    ? wasmInstance.medianSorted(new Float64Array(s))
    : tsMedian(s);
  const iqrVal = tsIqr(hinges(data));
  if (wasmInstance) {
    const result = wasmInstance.outerFences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsOuterFences(med, iqrVal, multiple);
}

/** Values outside inner fences. */
export function outliers(data: number[], multiple: number = 1.5): number[] {
  const s = sorted(data);
  const f = fences(data, multiple);
  if (wasmInstance) {
    return Array.from(wasmInstance.outliers(new Float64Array(s), f[0], f[1]));
  }
  return tsOutliers(s, f);
}

/** Most extreme non-outlier values. */
export function adjacent(data: number[]): number[] {
  const s = sorted(data);
  const f = fences(data);
  return tsAdjacent(s, f);
}

/** Values within inner fences. */
export function inside(data: number[]): number[] {
  const s = sorted(data);
  const f = fences(data);
  return tsInside(s, f);
}

/** Values outside outer fences. */
export function outside(data: number[]): number[] {
  const s = sorted(data);
  const outer = outerFences(data);
  return tsOutside(s, outer);
}

// =============================================================================
// Hybrid API — Ordering
// =============================================================================

/** Frequency of each value as [value, count] pairs. */
export function counts(data: number[]): [number, number][] {
  return tsCounts(sorted(data));
}

/** Rank information with tie handling. */
export function ranked(data: number[]): RankedResult {
  return tsRanked(sorted(data));
}

/** Histogram-style binning. */
export function binned(data: number[]): BinnedResult {
  const s = sorted(data);
  const ext = s.length ? [s[0], s[s.length - 1]] : [];
  return tsBinned(s, ext);
}

// =============================================================================
// Hybrid API — Transforms
// =============================================================================

/** Natural logarithm of each value. */
export function logs(data: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.logs(new Float64Array(data)));
  return tsLogs(data);
}

/** Square root of each value. */
export function roots(data: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.roots(new Float64Array(data)));
  return tsRoots(data);
}

/** Reciprocal (1/x) of each value. */
export function inverse(data: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.inverse(new Float64Array(data)));
  return tsInverse(data);
}

/** Z-score normalization: (x - mean) / stddev. */
export function zscore(data: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.zscoreCalc(new Float64Array(data)));
  return tsZscore(data);
}

// =============================================================================
// Hybrid API — Smoothing
// =============================================================================

/** Hanning filter (running weighted average). */
export function hanning(data: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.hanning(new Float64Array(data)));
  return tsHanning(data);
}

/** Tukey's 3RSSH smoothing. */
export function smooth(data: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.smooth(new Float64Array(data)));
  return tsSmooth(data);
}

/** Residuals (original - smooth). */
export function rough(data: number[]): number[] {
  const smoothed = smooth(data);
  if (wasmInstance) {
    return Array.from(
      wasmInstance.roughCalc(new Float64Array(data), new Float64Array(smoothed)),
    );
  }
  return tsRough(data, smoothed);
}

/** Exponential moving average. */
export function ema(data: number[], alpha: number): number[] {
  if (wasmInstance) return Array.from(wasmInstance.emaCalc(new Float64Array(data), alpha));
  return tsEma(data, alpha);
}

// =============================================================================
// Hybrid API — Summaries
// =============================================================================

/** Tukey's trimean: (Q1 + 2×median + Q3) / 4. */
export function trimean(data: number[]): number {
  const med = median(data);
  const h = hinges(data);
  if (h.length < 2) return med.datum;
  return tsTrimean(h[0].datum, med.datum, h[1].datum);
}

/** Letter values (extended quartiles: M, F, E, D, C, B, A...). */
export function letterValues(data: number[]): LetterValue[] {
  const s = sorted(data);
  const med = median(data);
  return tsLetterValues(s, med);
}

/** Stem-and-leaf text display. */
export function stemLeaf(data: number[], leafDigits: number = 1): StemLeafResult {
  return tsStemLeaf(sorted(data), leafDigits);
}

/** Mid-summaries (averages of symmetric quantile pairs). */
export function midSummaries(data: number[]): MidSummary[] {
  return letterValues(data).map(({ depth, mid, spread }) => ({ depth, mid, spread }));
}

// =============================================================================
// Hybrid API — Distance Functions
// =============================================================================

/** Cosine similarity between two dense vectors. Returns [-1, 1]. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (wasmInstance) return wasmInstance.cosineSim(new Float64Array(a), new Float64Array(b));
  return tsCosineSimilarity(a, b);
}

/** Squared Euclidean distance (avoids sqrt). */
export function squaredEuclideanDistance(a: number[], b: number[]): number {
  if (wasmInstance) return wasmInstance.sqEuclideanDist(new Float64Array(a), new Float64Array(b));
  return tsSqEuclideanDistance(a, b);
}

/** Euclidean (L2) distance. */
export function euclideanDistance(a: number[], b: number[]): number {
  if (wasmInstance) return wasmInstance.euclideanDist(new Float64Array(a), new Float64Array(b));
  return tsEuclideanDistance(a, b);
}

/** Manhattan (L1) distance. */
export function manhattanDistance(a: number[], b: number[]): number {
  if (wasmInstance) return wasmInstance.manhattanDist(new Float64Array(a), new Float64Array(b));
  return tsManhattanDistance(a, b);
}

/** Mahalanobis distance (diagonal covariance). */
export function mahalanobisDistance(
  point: number[],
  means: number[],
  variances: number[],
  epsilon: number = 1e-8,
): number {
  if (wasmInstance) {
    return wasmInstance.mahalanobisDist(
      new Float64Array(point),
      new Float64Array(means),
      new Float64Array(variances),
    );
  }
  return tsMahalanobisDistance(point, means, variances, epsilon);
}

/** L2-normalize a vector to unit length. */
export function normalizeL2(vector: number[]): number[] {
  if (wasmInstance) return Array.from(wasmInstance.normalizeL2Vec(new Float64Array(vector)));
  return tsNormalizeL2(vector);
}

/** Cosine similarity between two sparse vectors (Map<string, number>). */
export function cosineSimilaritySparse(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0, magA = 0, magB = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];

  for (const [key, val] of small) {
    const other = large.get(key);
    if (other !== undefined) dot += val * other;
    magA += val * val;
  }
  for (const val of large.values()) magB += val * val;

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/** Jaccard similarity: |A ∩ B| / |A ∪ B|. */
export function jaccardSimilarity<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union <= 0 ? 0 : intersection / union;
}

/** Overlap coefficient: |A ∩ B| / min(|A|, |B|). */
export function overlapCoefficient<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) intersection++;
  }
  const minSize = Math.min(a.size, b.size);
  return minSize <= 0 ? 0 : intersection / minSize;
}

// =============================================================================
// Full Analysis
// =============================================================================

/**
 * Complete statistical analysis of a dataset.
 * Returns a SeriesDescription-compatible result with implementation info.
 */
export function analyze(data: number[]): AnalysisResult {
  const s = sorted(data);
  const ext: [number, number] = s.length ? [s[0], s[s.length - 1]] : [NaN, NaN];
  const med = median(data);
  const h = hinges(data);
  const iqrVal = tsIqr(h);
  const f = fences(data);
  const of = outerFences(data);

  return {
    original: data,
    summary: {
      median: med,
      mean: mean(data),
      mode: mode(data),
      hinges: h,
      adjacent: tsAdjacent(s, f),
      outliers: tsOutliers(s, f),
      outer: of,
      outside: tsOutside(s, of),
      inside: tsInside(s, f),
      extremes: ext,
      iqr: iqrVal,
      fences: f,
    },
    smooths: {
      smooth: smooth(data),
      hanning: hanning(data),
    },
    transforms: {
      logs: logs(data),
      roots: roots(data),
      inverse: inverse(data),
    },
    counts: counts(data),
    sorted: s,
    ranked: ranked(data),
    binned: binned(data),
    implementation: wasmInstance ? 'wasm' : 'typescript',
  };
}
