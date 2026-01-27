/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/index/allocateF64Array
 * @param length `i32`
 * @returns `usize`
 */
export declare function allocateF64Array(length: number): number;
/**
 * assembly/index/freeMemory
 * @param ptr `usize`
 */
export declare function freeMemory(ptr: number): void;
/**
 * assembly/index/sort
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function sort(data: Float64Array): Float64Array;
/**
 * assembly/index/mean
 * @param data `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function mean(data: Float64Array): number;
/**
 * assembly/index/medianSorted
 * @param sorted `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function medianSorted(sorted: Float64Array): number;
/**
 * assembly/index/median
 * @param data `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function median(data: Float64Array): number;
/**
 * assembly/index/medianDepth
 * @param length `i32`
 * @param offset `i32`
 * @returns `f64`
 */
export declare function medianDepth(length: number, offset?: number): number;
/**
 * assembly/index/mode
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function mode(data: Float64Array): Float64Array;
/**
 * assembly/index/extremesSorted
 * @param sorted `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function extremesSorted(sorted: Float64Array): Float64Array;
/**
 * assembly/index/extremes
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function extremes(data: Float64Array): Float64Array;
/**
 * assembly/index/hingesSorted
 * @param sorted `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function hingesSorted(sorted: Float64Array): Float64Array;
/**
 * assembly/index/iqrFromHinges
 * @param hinges `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function iqrFromHinges(hinges: Float64Array): number;
/**
 * assembly/index/fences
 * @param median `f64`
 * @param iqr `f64`
 * @param multiple `f64`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function fences(median: number, iqr: number, multiple?: number): Float64Array;
/**
 * assembly/index/outerFences
 * @param median `f64`
 * @param iqr `f64`
 * @param multiple `f64`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function outerFences(median: number, iqr: number, multiple?: number): Float64Array;
/**
 * assembly/index/outliers
 * @param sorted `~lib/typedarray/Float64Array`
 * @param fenceLow `f64`
 * @param fenceHigh `f64`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function outliers(sorted: Float64Array, fenceLow: number, fenceHigh: number): Float64Array;
/**
 * assembly/index/logs
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function logs(data: Float64Array): Float64Array;
/**
 * assembly/index/roots
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function roots(data: Float64Array): Float64Array;
/**
 * assembly/index/inverse
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function inverse(data: Float64Array): Float64Array;
/**
 * assembly/index/hanning
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function hanning(data: Float64Array): Float64Array;
/**
 * assembly/index/smooth
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function smooth(data: Float64Array): Float64Array;
