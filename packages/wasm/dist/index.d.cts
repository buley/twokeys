import { SeriesDescription, BinnedResult, MedianResult, ModeResult, RankedResult } from '@buley/twokeys-types';
export { BinnedResult, MedianResult, ModeResult, RankedResult, SeriesDescription } from '@buley/twokeys-types';

/**
 * @buley/twokeys-wasm — WASM-accelerated statistics, distance & analysis
 *
 * Automatically uses WebAssembly when available, falls back to TypeScript.
 * Covers the full v3 API surface: Series statistics, distance functions,
 * outlier detection, transforms, smoothing, and comprehensive analysis.
 */

interface LetterValue {
    letter: string;
    depth: number;
    lower: number;
    upper: number;
    mid: number;
    spread: number;
}
interface StemLeafResult {
    stems: string[];
    leaves: Record<string, string[]>;
    display: string[];
}
interface MidSummary {
    depth: number;
    mid: number;
    spread: number;
}
interface AnalysisResult extends SeriesDescription {
    implementation: 'wasm' | 'typescript';
}
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
    variance: (data: Float64Array) => number;
    stddev: (data: Float64Array) => number;
    skewness: (data: Float64Array) => number;
    kurtosis: (data: Float64Array) => number;
    emaCalc: (data: Float64Array, alpha: number) => Float64Array;
    zscoreCalc: (data: Float64Array) => Float64Array;
    roughCalc: (original: Float64Array, smoothed: Float64Array) => Float64Array;
    cosineSim: (a: Float64Array, b: Float64Array) => number;
    sqEuclideanDist: (a: Float64Array, b: Float64Array) => number;
    euclideanDist: (a: Float64Array, b: Float64Array) => number;
    manhattanDist: (a: Float64Array, b: Float64Array) => number;
    mahalanobisDist: (point: Float64Array, means: Float64Array, variances: Float64Array) => number;
    normalizeL2Vec: (vector: Float64Array) => Float64Array;
}
/**
 * Load WASM module. Falls back to TypeScript if unavailable.
 */
declare function loadWasm(): Promise<WasmExports | null>;
/**
 * Check if WASM is loaded and available.
 */
declare function isWasmLoaded(): boolean;
/** Sort array ascending. */
declare function sorted(data: number[]): number[];
/** Arithmetic mean. */
declare function mean(data: number[]): number;
/** Median value and depth. */
declare function median(data: number[]): MedianResult;
/** Mode (most frequent values). */
declare function mode(data: number[]): ModeResult;
/** [min, max] values. */
declare function extremes(data: number[]): [number, number];
/** Sample variance: Σ(x - mean)² / (n - 1). */
declare function variance(data: number[]): number;
/** Standard deviation. */
declare function stddev(data: number[]): number;
/** Fisher-Pearson skewness. */
declare function skewness(data: number[]): number;
/** Excess kurtosis. */
declare function kurtosis(data: number[]): number;
/** Quartile boundaries (Q1, Q3). */
declare function hinges(data: number[]): MedianResult[];
/** Interquartile range. */
declare function iqr(data: number[]): number;
/** Inner fence boundaries (1.5 × IQR from median). */
declare function fences(data: number[], multiple?: number): [number, number];
/** Outer fence boundaries (3 × IQR from median). */
declare function outerFences(data: number[], multiple?: number): [number, number];
/** Values outside inner fences. */
declare function outliers(data: number[], multiple?: number): number[];
/** Most extreme non-outlier values. */
declare function adjacent(data: number[]): number[];
/** Values within inner fences. */
declare function inside(data: number[]): number[];
/** Values outside outer fences. */
declare function outside(data: number[]): number[];
/** Frequency of each value as [value, count] pairs. */
declare function counts(data: number[]): [number, number][];
/** Rank information with tie handling. */
declare function ranked(data: number[]): RankedResult;
/** Histogram-style binning. */
declare function binned(data: number[]): BinnedResult;
/** Natural logarithm of each value. */
declare function logs(data: number[]): number[];
/** Square root of each value. */
declare function roots(data: number[]): number[];
/** Reciprocal (1/x) of each value. */
declare function inverse(data: number[]): number[];
/** Z-score normalization: (x - mean) / stddev. */
declare function zscore(data: number[]): number[];
/** Hanning filter (running weighted average). */
declare function hanning(data: number[]): number[];
/** Tukey's 3RSSH smoothing. */
declare function smooth(data: number[]): number[];
/** Residuals (original - smooth). */
declare function rough(data: number[]): number[];
/** Exponential moving average. */
declare function ema(data: number[], alpha: number): number[];
/** Tukey's trimean: (Q1 + 2×median + Q3) / 4. */
declare function trimean(data: number[]): number;
/** Letter values (extended quartiles: M, F, E, D, C, B, A...). */
declare function letterValues(data: number[]): LetterValue[];
/** Stem-and-leaf text display. */
declare function stemLeaf(data: number[], leafDigits?: number): StemLeafResult;
/** Mid-summaries (averages of symmetric quantile pairs). */
declare function midSummaries(data: number[]): MidSummary[];
/** Cosine similarity between two dense vectors. Returns [-1, 1]. */
declare function cosineSimilarity(a: number[], b: number[]): number;
/** Squared Euclidean distance (avoids sqrt). */
declare function squaredEuclideanDistance(a: number[], b: number[]): number;
/** Euclidean (L2) distance. */
declare function euclideanDistance(a: number[], b: number[]): number;
/** Manhattan (L1) distance. */
declare function manhattanDistance(a: number[], b: number[]): number;
/** Mahalanobis distance (diagonal covariance). */
declare function mahalanobisDistance(point: number[], means: number[], variances: number[], epsilon?: number): number;
/** L2-normalize a vector to unit length. */
declare function normalizeL2(vector: number[]): number[];
/** Cosine similarity between two sparse vectors (Map<string, number>). */
declare function cosineSimilaritySparse(a: Map<string, number>, b: Map<string, number>): number;
/** Jaccard similarity: |A ∩ B| / |A ∪ B|. */
declare function jaccardSimilarity<T>(a: Set<T>, b: Set<T>): number;
/** Overlap coefficient: |A ∩ B| / min(|A|, |B|). */
declare function overlapCoefficient<T>(a: Set<T>, b: Set<T>): number;
/**
 * Complete statistical analysis of a dataset.
 * Returns a SeriesDescription-compatible result with implementation info.
 */
declare function analyze(data: number[]): AnalysisResult;

export { type AnalysisResult, type LetterValue, type MidSummary, type StemLeafResult, adjacent, analyze, binned, cosineSimilarity, cosineSimilaritySparse, counts, ema, euclideanDistance, extremes, fences, hanning, hinges, inside, inverse, iqr, isWasmLoaded, jaccardSimilarity, kurtosis, letterValues, loadWasm, logs, mahalanobisDistance, manhattanDistance, mean, median, midSummaries, mode, normalizeL2, outerFences, outliers, outside, overlapCoefficient, ranked, roots, rough, skewness, smooth, sorted, squaredEuclideanDistance, stddev, stemLeaf, trimean, variance, zscore };
