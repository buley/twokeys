/**
 * @twokeys/wasm - WASM implementation with TypeScript fallback
 *
 * Automatically uses WASM when available, falls back to TypeScript implementation.
 */

// Import types
import type {
  MedianResult,
  ModeResult,
  RankedResult,
  BinnedResult,
} from '@buley/twokeys-types';

// TypeScript fallback implementations
// These are inlined for zero-dependency fallback

function tsSorted(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

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

function tsIqr(hinges: MedianResult[]): number {
  if (hinges.length < 2) return NaN;
  return Math.abs(hinges[1].datum - hinges[0].datum);
}

function tsFences(median: number, iqr: number, multiple: number = 1.5): [number, number] {
  if (isNaN(median) || isNaN(iqr)) return [NaN, NaN];
  const extra = iqr * multiple;
  return [median - extra, median + extra];
}

function tsOuterFences(median: number, iqr: number, multiple: number = 1.5): [number, number] {
  if (isNaN(median) || isNaN(iqr)) return [NaN, NaN];
  const extra = 2 * iqr * multiple;
  return [median - extra, median + extra];
}

function tsOutliers(sorted: number[], fences: [number, number]): number[] {
  if (isNaN(fences[0]) || isNaN(fences[1])) return [];
  return sorted.filter((n) => n < fences[0] || n > fences[1]);
}

function tsLogs(arr: number[]): number[] {
  return arr.map((n) => Math.log(n));
}

function tsRoots(arr: number[]): number[] {
  return arr.map((n) => Math.sqrt(n));
}

function tsInverse(arr: number[]): number[] {
  return arr.map((n) => 1 / n);
}

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
  // 3 median passes
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  result = tsSmoothExtremes(result);
  // 3 more median passes
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  result = tsSmoothExtremes(result);
  // Final median passes
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  return result;
}

// =============================================================================
// WASM Loading
// =============================================================================

interface WasmExports {
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
}

let wasmInstance: WasmExports | null = null;
let wasmLoadPromise: Promise<WasmExports | null> | null = null;

/**
 * Load WASM module
 * @returns Promise that resolves to WASM exports or null if failed
 */
export async function loadWasm(): Promise<WasmExports | null> {
  if (wasmInstance) return wasmInstance;
  if (wasmLoadPromise) return wasmLoadPromise;

  wasmLoadPromise = (async () => {
    try {
      // Try to load the WASM module
      const wasmUrl = new URL('../build/release.wasm', import.meta.url);
      const response = await fetch(wasmUrl);
      const wasmBuffer = await response.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(wasmBuffer);
      wasmInstance = wasmModule.instance.exports as unknown as WasmExports;
      return wasmInstance;
    } catch (e) {
      console.warn('@buley/twokeys-wasm: WASM not available, using TypeScript fallback');
      return null;
    }
  })();

  return wasmLoadPromise;
}

/**
 * Check if WASM is loaded and available
 */
export function isWasmLoaded(): boolean {
  return wasmInstance !== null;
}

// =============================================================================
// Hybrid API (WASM with TS fallback)
// =============================================================================

/**
 * Sort array (ascending)
 */
export function sorted(data: number[]): number[] {
  if (wasmInstance) {
    const input = new Float64Array(data);
    const result = wasmInstance.sort(input);
    return Array.from(result);
  }
  return tsSorted(data);
}

/**
 * Calculate arithmetic mean
 */
export function mean(data: number[]): number {
  if (wasmInstance) {
    return wasmInstance.mean(new Float64Array(data));
  }
  return tsMean(data);
}

/**
 * Calculate median
 */
export function median(data: number[]): MedianResult {
  const sortedData = sorted(data);
  const datum = wasmInstance
    ? wasmInstance.medianSorted(new Float64Array(sortedData))
    : tsMedian(sortedData);
  const depth = wasmInstance
    ? wasmInstance.medianDepth(data.length)
    : tsMedianDepth(data.length);
  return { datum, depth };
}

/**
 * Calculate mode
 */
export function mode(data: number[]): ModeResult {
  if (wasmInstance) {
    const result = wasmInstance.mode(new Float64Array(data));
    const count = result[0];
    const modes = Array.from(result.slice(1));
    return { count, data: modes };
  }
  return tsMode(data);
}

/**
 * Get extremes [min, max]
 */
export function extremes(data: number[]): [number, number] {
  if (wasmInstance) {
    const result = wasmInstance.extremes(new Float64Array(data));
    return [result[0], result[1]];
  }
  const sortedData = tsSorted(data);
  return tsExtremes(sortedData);
}

/**
 * Calculate hinges (quartiles)
 */
export function hinges(data: number[]): MedianResult[] {
  const sortedData = sorted(data);
  if (wasmInstance) {
    const result = wasmInstance.hingesSorted(new Float64Array(sortedData));
    if (isNaN(result[0])) return [];
    return [
      { datum: result[0], depth: result[1] },
      { datum: result[2], depth: result[3] },
    ];
  }
  return tsHinges(sortedData);
}

/**
 * Calculate IQR
 */
export function iqr(data: number[]): number {
  const h = hinges(data);
  return tsIqr(h);
}

/**
 * Calculate fences (inner: 1.5 * IQR)
 */
export function fences(data: number[], multiple: number = 1.5): [number, number] {
  const sortedData = sorted(data);
  const med = wasmInstance
    ? wasmInstance.medianSorted(new Float64Array(sortedData))
    : tsMedian(sortedData);
  const h = hinges(data);
  const iqrVal = tsIqr(h);
  if (wasmInstance) {
    const result = wasmInstance.fences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsFences(med, iqrVal, multiple);
}

/**
 * Calculate outer fences (3 * IQR)
 */
export function outerFences(data: number[], multiple: number = 1.5): [number, number] {
  const sortedData = sorted(data);
  const med = wasmInstance
    ? wasmInstance.medianSorted(new Float64Array(sortedData))
    : tsMedian(sortedData);
  const h = hinges(data);
  const iqrVal = tsIqr(h);
  if (wasmInstance) {
    const result = wasmInstance.outerFences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsOuterFences(med, iqrVal, multiple);
}

/**
 * Find outliers
 */
export function outliers(data: number[], multiple: number = 1.5): number[] {
  const sortedData = sorted(data);
  const f = fences(data, multiple);
  if (wasmInstance) {
    const result = wasmInstance.outliers(new Float64Array(sortedData), f[0], f[1]);
    return Array.from(result);
  }
  return tsOutliers(sortedData, f);
}

/**
 * Natural logarithm transform
 */
export function logs(data: number[]): number[] {
  if (wasmInstance) {
    const result = wasmInstance.logs(new Float64Array(data));
    return Array.from(result);
  }
  return tsLogs(data);
}

/**
 * Square root transform
 */
export function roots(data: number[]): number[] {
  if (wasmInstance) {
    const result = wasmInstance.roots(new Float64Array(data));
    return Array.from(result);
  }
  return tsRoots(data);
}

/**
 * Inverse (1/x) transform
 */
export function inverse(data: number[]): number[] {
  if (wasmInstance) {
    const result = wasmInstance.inverse(new Float64Array(data));
    return Array.from(result);
  }
  return tsInverse(data);
}

/**
 * Hanning filter
 */
export function hanning(data: number[]): number[] {
  if (wasmInstance) {
    const result = wasmInstance.hanning(new Float64Array(data));
    return Array.from(result);
  }
  return tsHanning(data);
}

/**
 * Tukey's 3RSSH smoothing
 */
export function smooth(data: number[]): number[] {
  if (wasmInstance) {
    const result = wasmInstance.smooth(new Float64Array(data));
    return Array.from(result);
  }
  return tsSmooth(data);
}

// =============================================================================
// Full Analysis (like Series.describe())
// =============================================================================

export interface AnalysisResult {
  sorted: number[];
  summary: {
    median: MedianResult;
    mean: number;
    mode: ModeResult;
    extremes: [number, number];
    hinges: MedianResult[];
    iqr: number;
    fences: [number, number];
    outliers: number[];
  };
  transforms: {
    logs: number[];
    roots: number[];
    inverse: number[];
  };
  smooths: {
    hanning: number[];
    smooth: number[];
  };
  implementation: 'wasm' | 'typescript';
}

/**
 * Full statistical analysis
 */
export function analyze(data: number[]): AnalysisResult {
  const sortedData = sorted(data);
  const med = median(data);
  const m = mean(data);
  const mo = mode(data);
  const ext = extremes(data);
  const h = hinges(data);
  const iqrVal = iqr(data);
  const f = fences(data);
  const out = outliers(data);

  return {
    sorted: sortedData,
    summary: {
      median: med,
      mean: m,
      mode: mo,
      extremes: ext,
      hinges: h,
      iqr: iqrVal,
      fences: f,
      outliers: out,
    },
    transforms: {
      logs: logs(data),
      roots: roots(data),
      inverse: inverse(data),
    },
    smooths: {
      hanning: hanning(data),
      smooth: smooth(data),
    },
    implementation: wasmInstance ? 'wasm' : 'typescript',
  };
}
