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
/**
 * assembly/index/variance
 * @param data `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function variance(data: Float64Array): number;
/**
 * assembly/index/stddev
 * @param data `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function stddev(data: Float64Array): number;
/**
 * assembly/index/skewness
 * @param data `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function skewness(data: Float64Array): number;
/**
 * assembly/index/kurtosis
 * @param data `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function kurtosis(data: Float64Array): number;
/**
 * assembly/index/emaCalc
 * @param data `~lib/typedarray/Float64Array`
 * @param alpha `f64`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function emaCalc(data: Float64Array, alpha: number): Float64Array;
/**
 * assembly/index/zscoreCalc
 * @param data `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function zscoreCalc(data: Float64Array): Float64Array;
/**
 * assembly/index/roughCalc
 * @param original `~lib/typedarray/Float64Array`
 * @param smoothed `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function roughCalc(original: Float64Array, smoothed: Float64Array): Float64Array;
/**
 * assembly/index/cosineSim
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function cosineSim(a: Float64Array, b: Float64Array): number;
/**
 * assembly/index/sqEuclideanDist
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function sqEuclideanDist(a: Float64Array, b: Float64Array): number;
/**
 * assembly/index/euclideanDist
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function euclideanDist(a: Float64Array, b: Float64Array): number;
/**
 * assembly/index/manhattanDist
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function manhattanDist(a: Float64Array, b: Float64Array): number;
/**
 * assembly/index/mahalanobisDist
 * @param point `~lib/typedarray/Float64Array`
 * @param means `~lib/typedarray/Float64Array`
 * @param variances `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function mahalanobisDist(point: Float64Array, means: Float64Array, variances: Float64Array): number;
/**
 * assembly/index/normalizeL2Vec
 * @param vector `~lib/typedarray/Float64Array`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function normalizeL2Vec(vector: Float64Array): Float64Array;
