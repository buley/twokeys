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
interface SeriesOptions {
    data?: number[];
}
interface PointsOptions {
    data?: number[][];
    dimensionality?: number;
    count?: number;
}
interface MedianResult {
    datum: number;
    depth: number;
}
interface ModeResult {
    count: number;
    data: number[];
}
interface RankInfo {
    rank: number;
    peers: number;
}
interface RankedResult {
    up: Record<number, RankInfo>;
    down: Record<number, RankInfo>;
    groups: {
        up: (number | number[])[];
        down: (number | number[])[];
    };
}
interface BinnedResult {
    bins: number;
    width: number;
    binned: Record<number, {
        from: number;
        to: number;
        data: number[];
    }>;
}
interface SeriesDescription {
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
interface PointsDescription {
    original: number[][];
}
declare function randomInteger(max?: number): number;
declare function randomSeries(count?: number, max?: number): number[];
declare function randomPoint(dimension?: number, max?: number): number[];
declare function randomPoints(count?: number, dimension?: number, max?: number): number[][];
/**
 * Series class for 1D data exploration
 */
declare class Series {
    private data;
    constructor(options?: SeriesOptions);
    sorted(): number[];
    private getSorted;
    median(): MedianResult;
    private getMedianDepth;
    private getMedian;
    mean(): number;
    private getMean;
    mode(): ModeResult;
    private getMode;
    extremes(): number[];
    private getExtremes;
    counts(): [number, number][];
    private getCounts;
    hinges(): MedianResult[];
    private getHinges;
    iqr(): number;
    private getIQR;
    fences(): number[];
    private getFences;
    outer(): number[];
    private getOuter;
    outside(): number[];
    private getOutside;
    inside(): number[];
    private getInside;
    outliers(): number[];
    private getOutliers;
    ranked(): RankedResult;
    private getRanked;
    adjacent(): number[];
    private getAdjacent;
    binned(bins?: number): BinnedResult;
    private getBinned;
    logs(): number[];
    private getLogs;
    roots(): number[];
    private getRoots;
    inverse(): number[];
    private getInverse;
    hanning(): number[];
    private getSkipMeans;
    smooth(): number[];
    private getRough;
    private getSmooth;
    private smoothExtremes;
    private smoothSplit;
    private smoothMedian;
    private jitter;
    trimean(): number;
    letterValues(): Array<{
        letter: string;
        depth: number;
        lower: number;
        upper: number;
        mid: number;
        spread: number;
    }>;
    rough(): number[];
    stemLeaf(leafDigits?: number): {
        stems: string[];
        leaves: Record<string, string[]>;
        display: string[];
    };
    midSummaries(): Array<{
        depth: number;
        mid: number;
        spread: number;
    }>;
    describe(): SeriesDescription;
}
/**
 * Points class for n-dimensional data exploration
 */
declare class Points {
    private data;
    private dimension;
    private count;
    constructor(options?: PointsOptions | number);
    describe(): PointsDescription;
}
/**
 * Main Twokeys class - factory for Series and Points
 */
declare class Twokeys {
    smoothed: boolean;
    static readonly DEFAULT_MAX_RANDOM_INTEGER = 100;
    static readonly DEFAULT_MIN_RANDOM_INTEGER = 0;
    static readonly DEFAULT_RANDOM_SERIES_COUNT = 1000;
    static readonly DEFAULT_OUTLIER_MULTIPLE = 1.5;
    static readonly DEFAULT_JITTER_MULTIPLIER = 1;
    static readonly DEFAULT_SPLIT_PASSES = 2;
    static readonly DEFAULT_MAX_RANDOM_DIMENSIONALITY = 2;
    static Series: typeof Series;
    static Points: typeof Points;
    static randomInteger: typeof randomInteger;
    static randomSeries: typeof randomSeries;
    static randomPoint: typeof randomPoint;
    static randomPoints: typeof randomPoints;
}

export { type BinnedResult, type MedianResult, type ModeResult, Points, type PointsDescription, type PointsOptions, type RankInfo, type RankedResult, Series, type SeriesDescription, type SeriesOptions, Twokeys, Twokeys as default };
