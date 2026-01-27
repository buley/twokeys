import { MedianResult, ModeResult } from '@buley/twokeys-types';

/**
 * @twokeys/wasm - WASM implementation with TypeScript fallback
 *
 * Automatically uses WASM when available, falls back to TypeScript implementation.
 */

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
/**
 * Load WASM module
 * @returns Promise that resolves to WASM exports or null if failed
 */
declare function loadWasm(): Promise<WasmExports | null>;
/**
 * Check if WASM is loaded and available
 */
declare function isWasmLoaded(): boolean;
/**
 * Sort array (ascending)
 */
declare function sorted(data: number[]): number[];
/**
 * Calculate arithmetic mean
 */
declare function mean(data: number[]): number;
/**
 * Calculate median
 */
declare function median(data: number[]): MedianResult;
/**
 * Calculate mode
 */
declare function mode(data: number[]): ModeResult;
/**
 * Get extremes [min, max]
 */
declare function extremes(data: number[]): [number, number];
/**
 * Calculate hinges (quartiles)
 */
declare function hinges(data: number[]): MedianResult[];
/**
 * Calculate IQR
 */
declare function iqr(data: number[]): number;
/**
 * Calculate fences (inner: 1.5 * IQR)
 */
declare function fences(data: number[], multiple?: number): [number, number];
/**
 * Calculate outer fences (3 * IQR)
 */
declare function outerFences(data: number[], multiple?: number): [number, number];
/**
 * Find outliers
 */
declare function outliers(data: number[], multiple?: number): number[];
/**
 * Natural logarithm transform
 */
declare function logs(data: number[]): number[];
/**
 * Square root transform
 */
declare function roots(data: number[]): number[];
/**
 * Inverse (1/x) transform
 */
declare function inverse(data: number[]): number[];
/**
 * Hanning filter
 */
declare function hanning(data: number[]): number[];
/**
 * Tukey's 3RSSH smoothing
 */
declare function smooth(data: number[]): number[];
interface AnalysisResult {
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
declare function analyze(data: number[]): AnalysisResult;

export { type AnalysisResult, analyze, extremes, fences, hanning, hinges, inverse, iqr, isWasmLoaded, loadWasm, logs, mean, median, mode, outerFences, outliers, roots, smooth, sorted };
