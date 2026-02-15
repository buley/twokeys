/**
 * Vector Distance & Similarity Functions
 *
 * Standalone functions for vector math — zero dependencies.
 * These are the workhorses that Points, graph algorithms, and consumers all use.
 */
/**
 * Cosine similarity between two dense vectors.
 * Returns a value in [-1, 1] where 1 means identical direction.
 */
declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * Squared Euclidean distance between two dense vectors.
 * Avoids the sqrt for performance-sensitive comparisons.
 */
declare function squaredEuclideanDistance(a: number[], b: number[]): number;
/**
 * Euclidean (L2) distance between two dense vectors.
 */
declare function euclideanDistance(a: number[], b: number[]): number;
/**
 * Manhattan (L1) distance between two dense vectors.
 */
declare function manhattanDistance(a: number[], b: number[]): number;
/**
 * Mahalanobis distance of a point from a distribution described by
 * per-dimension means and variances.
 *
 * This is the diagonal-covariance special case (dimensions are independent),
 * which is what most embedding-space consumers need.
 *
 * d = sqrt( Σ (x_i - μ_i)² / max(σ²_i, ε) )
 */
declare function mahalanobisDistance(point: number[], means: number[], variances: number[], epsilon?: number): number;
/**
 * L2-normalize a dense vector (unit vector in same direction).
 * Returns the zero vector if the input has zero magnitude.
 */
declare function normalizeL2(vector: number[]): number[];
/**
 * Cosine similarity between two sparse vectors represented as Map<string, number>.
 */
declare function cosineSimilaritySparse(a: Map<string, number>, b: Map<string, number>): number;
/**
 * Jaccard similarity between two sets: |A ∩ B| / |A ∪ B|.
 * Returns 0 for empty sets.
 */
declare function jaccardSimilarity<T>(a: Set<T>, b: Set<T>): number;
/**
 * Overlap coefficient: |A ∩ B| / min(|A|, |B|).
 * Returns 0 for empty sets.
 */
declare function overlapCoefficient<T>(a: Set<T>, b: Set<T>): number;

type GraphNodeInput<NodeId extends string = string> = NodeId | {
    id: NodeId;
};
interface GraphEdge<NodeId extends string = string> {
    from: NodeId;
    to: NodeId;
    weight?: number;
}
interface GraphBuildOptions {
    directed?: boolean;
}
interface GraphNeighbor<NodeId extends string = string> {
    id: NodeId;
    weight: number;
}
interface GraphAdjacency<NodeId extends string = string> {
    nodes: NodeId[];
    neighborsByNode: Map<NodeId, GraphNeighbor<NodeId>[]>;
    incomingByNode: Map<NodeId, GraphNeighbor<NodeId>[]>;
    edges: Array<Required<GraphEdge<NodeId>>>;
    directed: boolean;
}
type GraphAlgorithmErrorCode = 'NEGATIVE_WEIGHT' | 'NEGATIVE_CYCLE' | 'INVALID_ARGUMENT';
declare class GraphAlgorithmError extends Error {
    readonly code: GraphAlgorithmErrorCode;
    constructor(code: GraphAlgorithmErrorCode, message: string);
}
interface TopologicalSortOptions<NodeId extends string = string> {
    tieBreaker?: (left: NodeId, right: NodeId) => number;
    priority?: (nodeId: NodeId) => number;
    priorityByNode?: Map<NodeId, number> | Partial<Record<NodeId, number>>;
}
interface TopologicalSortResult<NodeId extends string = string> {
    order: NodeId[];
    cycleNodes: NodeId[];
    isDag: boolean;
}
interface StronglyConnectedComponentsOptions extends GraphBuildOptions {
}
interface StronglyConnectedComponentsResult<NodeId extends string = string> {
    components: NodeId[][];
    componentByNode: Map<NodeId, number>;
}
interface WeaklyConnectedComponentsResult<NodeId extends string = string> {
    components: NodeId[][];
    componentByNode: Map<NodeId, number>;
}
interface DegreeCentralityRecord {
    inDegree: number;
    outDegree: number;
    degree: number;
    normalized: number;
}
type ClosenessCentralityMode = 'classic' | 'harmonic';
interface ClosenessCentralityRecord {
    reachableCount: number;
    distanceSum: number;
    score: number;
    normalized: number;
    mode: ClosenessCentralityMode;
    negativeCycle: boolean;
}
interface BetweennessCentralityRecord {
    raw: number;
    normalized: number;
}
interface PageRankOptions extends GraphBuildOptions {
    dampingFactor?: number;
    tolerance?: number;
    maxIterations?: number;
}
interface PageRankRecord {
    score: number;
    normalized: number;
    rank: number;
}
interface PageRankResult<NodeId extends string = string> {
    byNode: Map<NodeId, PageRankRecord>;
    order: NodeId[];
    iterations: number;
    converged: boolean;
    dampingFactor: number;
}
interface MinimumSpanningTreeOptions<NodeId extends string = string> {
    tieBreaker?: (left: NodeId, right: NodeId) => number;
}
interface MinimumSpanningTreeResult<NodeId extends string = string> {
    edges: Array<Required<GraphEdge<NodeId>>>;
    totalWeight: number;
    componentCount: number;
    spanning: boolean;
}
interface ArticulationBridgeResult<NodeId extends string = string> {
    articulationPoints: NodeId[];
    bridges: Array<Required<GraphEdge<NodeId>>>;
}
interface GraphAnalysisResult<NodeId extends string = string> {
    degree: Map<NodeId, DegreeCentralityRecord>;
    closeness: Map<NodeId, ClosenessCentralityRecord>;
    betweenness: Map<NodeId, BetweennessCentralityRecord>;
    pageRank: Map<NodeId, PageRankRecord>;
    stronglyConnectedComponents: NodeId[][];
    weaklyConnectedComponents: NodeId[][];
    articulationPoints: NodeId[];
    bridges: Array<Required<GraphEdge<NodeId>>>;
}
interface GraphAnalysisOptions extends GraphBuildOptions {
    closenessMode?: ClosenessCentralityMode;
    shortestPathAlgorithm?: ShortestPathAlgorithm;
    pageRankOptions?: Omit<PageRankOptions, 'directed'>;
}
type ShortestPathAlgorithm = 'auto' | 'dijkstra' | 'bellman-ford';
interface ShortestPathOptions extends GraphBuildOptions {
    algorithm?: ShortestPathAlgorithm;
    failOnNegativeCycle?: boolean;
}
interface ShortestPathResult<NodeId extends string = string> {
    source: NodeId;
    target: NodeId;
    path: NodeId[];
    distance: number;
    reachable: boolean;
    explored: number;
    algorithm: ShortestPathAlgorithm;
    hasNegativeWeights: boolean;
    negativeCycle: boolean;
}
interface LabelPropagationOptions<NodeId extends string = string> extends GraphBuildOptions {
    maxIterations?: number;
    tieBreaker?: (left: NodeId, right: NodeId) => number;
}
interface LouvainOptions<NodeId extends string = string> extends GraphBuildOptions {
    maxPasses?: number;
    tolerance?: number;
    tieBreaker?: (left: NodeId, right: NodeId) => number;
}
interface CommunityDetectionResult<NodeId extends string = string> {
    communities: NodeId[][];
    communityByNode: Map<NodeId, number>;
    iterations: number;
    converged: boolean;
    algorithm: 'label-propagation' | 'louvain';
    modularity: number;
}
type SimilarityMetric = 'common-neighbors' | 'jaccard' | 'cosine' | 'overlap' | 'adamic-adar' | 'resource-allocation' | 'preferential-attachment';
interface SimilarityOptions extends GraphBuildOptions {
    metric?: SimilarityMetric;
    minScore?: number;
}
interface NodeSimilarityRecord<NodeId extends string = string> {
    left: NodeId;
    right: NodeId;
    score: number;
    metric: SimilarityMetric;
    rank: number;
}
interface NodeSimilarityResult<NodeId extends string = string> {
    metric: SimilarityMetric;
    pairs: NodeSimilarityRecord<NodeId>[];
}
interface KNearestNeighborsOptions extends GraphBuildOptions {
    metric?: SimilarityMetric;
    k?: number;
    minScore?: number;
}
interface KNearestNeighbor<NodeId extends string = string> {
    nodeId: NodeId;
    score: number;
}
interface KNearestNeighborsResult<NodeId extends string = string> {
    metric: SimilarityMetric;
    k: number;
    neighborsByNode: Map<NodeId, KNearestNeighbor<NodeId>[]>;
}
interface LinkPredictionOptions<NodeId extends string = string> extends GraphBuildOptions {
    metric?: SimilarityMetric;
    limit?: number;
    minScore?: number;
    allowExistingEdges?: boolean;
    sourceFilter?: NodeId[];
    targetFilter?: NodeId[];
}
interface LinkPredictionRecord<NodeId extends string = string> {
    from: NodeId;
    to: NodeId;
    score: number;
    metric: SimilarityMetric;
    rank: number;
}
interface LinkPredictionResult<NodeId extends string = string> {
    metric: SimilarityMetric;
    predictions: LinkPredictionRecord<NodeId>[];
}
interface AStarOptions<NodeId extends string = string> extends GraphBuildOptions {
    heuristic?: (nodeId: NodeId, targetId: NodeId) => number;
}
interface AStarResult<NodeId extends string = string> {
    source: NodeId;
    target: NodeId;
    path: NodeId[];
    distance: number;
    reachable: boolean;
    explored: number;
    estimatedDistance: number;
}
interface PathRecord<NodeId extends string = string> {
    path: NodeId[];
    distance: number;
}
interface YenKShortestPathsOptions extends GraphBuildOptions {
    k?: number;
    shortestPathAlgorithm?: ShortestPathAlgorithm;
}
interface YenKShortestPathsResult<NodeId extends string = string> {
    source: NodeId;
    target: NodeId;
    paths: PathRecord<NodeId>[];
    complete: boolean;
}
interface AllPairsShortestPathsOptions extends GraphBuildOptions {
    algorithm?: ShortestPathAlgorithm;
    failOnNegativeCycle?: boolean;
}
interface AllPairsShortestPathsResult<NodeId extends string = string> {
    nodes: NodeId[];
    distanceBySource: Map<NodeId, Map<NodeId, number>>;
    previousBySource: Map<NodeId, Map<NodeId, NodeId>>;
    algorithm: ShortestPathAlgorithm;
    hasNegativeWeights: boolean;
    negativeCycle: boolean;
}
interface FlowEdge<NodeId extends string = string> {
    from: NodeId;
    to: NodeId;
    capacity: number;
    cost?: number;
}
interface FlowEdgeResult<NodeId extends string = string> {
    from: NodeId;
    to: NodeId;
    flow: number;
    capacity: number;
}
interface MaximumFlowOptions extends GraphBuildOptions {
}
interface MaximumFlowResult<NodeId extends string = string> {
    source: NodeId;
    sink: NodeId;
    maxFlow: number;
    augmentations: number;
    flowByEdge: FlowEdgeResult<NodeId>[];
    sourcePartition: NodeId[];
    sinkPartition: NodeId[];
    cutEdges: Array<Required<GraphEdge<NodeId>>>;
}
interface MinCostMaxFlowOptions extends GraphBuildOptions {
    targetFlow?: number;
}
interface MinCostFlowEdgeResult<NodeId extends string = string> extends FlowEdgeResult<NodeId> {
    cost: number;
}
interface MinCostMaxFlowResult<NodeId extends string = string> {
    source: NodeId;
    sink: NodeId;
    flow: number;
    cost: number;
    complete: boolean;
    augmentations: number;
    flowByEdge: MinCostFlowEdgeResult<NodeId>[];
}
type KMeansNormalization = 'none' | 'zscore' | 'minmax';
interface KMeansOptions {
    maxIterations?: number;
    tolerance?: number;
    seed?: number;
    nInit?: number;
    normalization?: KMeansNormalization;
    useKMeansPlusPlus?: boolean;
}
interface KMeansCluster {
    centroid: number[];
    indices: number[];
}
interface KMeansResult {
    assignments: number[];
    clusters: KMeansCluster[];
    iterations: number;
    inertia: number;
    converged: boolean;
    silhouette: number | null;
    selectedSeed: number;
}
interface KMeansAutoOptions extends KMeansOptions {
    kMin?: number;
    kMax?: number;
}
interface KMeansAutoCandidate {
    k: number;
    silhouette: number | null;
    inertia: number;
}
interface KMeansAutoResult extends KMeansResult {
    selectedK: number;
    candidates: KMeansAutoCandidate[];
}
interface TravelingSalesmanOptions<NodeId extends string = string> extends GraphBuildOptions {
    start?: NodeId;
    returnToStart?: boolean;
    twoOptPasses?: number;
    multiStartCount?: number;
    startCandidates?: NodeId[];
    seed?: number;
    shortestPathAlgorithm?: ShortestPathAlgorithm;
}
interface TravelingSalesmanSegment<NodeId extends string = string> {
    from: NodeId;
    to: NodeId;
    distance: number;
    path: NodeId[];
}
interface TravelingSalesmanResult<NodeId extends string = string> {
    order: NodeId[];
    distance: number;
    segments: TravelingSalesmanSegment<NodeId>[];
    visitedCount: number;
    complete: boolean;
    unreachableNodes: NodeId[];
    lowerBound: number;
    optimalityGap: number | null;
}
declare function buildGraphAdjacency<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: GraphBuildOptions): GraphAdjacency<NodeId>;
declare function stronglyConnectedComponents<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: StronglyConnectedComponentsOptions): StronglyConnectedComponentsResult<NodeId>;
declare function weaklyConnectedComponents<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[]): WeaklyConnectedComponentsResult<NodeId>;
declare function topologicalSort<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: TopologicalSortOptions<NodeId>): TopologicalSortResult<NodeId>;
declare function degreeCentrality<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: GraphBuildOptions): Map<NodeId, DegreeCentralityRecord>;
interface ClosenessCentralityOptions extends GraphBuildOptions {
    mode?: ClosenessCentralityMode;
    shortestPathAlgorithm?: ShortestPathAlgorithm;
}
declare function closenessCentrality<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: ClosenessCentralityOptions): Map<NodeId, ClosenessCentralityRecord>;
declare function betweennessCentrality<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: GraphBuildOptions): Map<NodeId, BetweennessCentralityRecord>;
declare function pageRank<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: PageRankOptions): PageRankResult<NodeId>;
declare function minimumSpanningTree<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: MinimumSpanningTreeOptions<NodeId>): MinimumSpanningTreeResult<NodeId>;
declare function articulationPointsAndBridges<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[]): ArticulationBridgeResult<NodeId>;
declare function analyzeGraph<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: GraphAnalysisOptions): GraphAnalysisResult<NodeId>;
declare function shortestPath<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], source: NodeId, target: NodeId, options?: ShortestPathOptions): ShortestPathResult<NodeId>;
declare function labelPropagationCommunities<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: LabelPropagationOptions<NodeId>): CommunityDetectionResult<NodeId>;
declare function louvainCommunities<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: LouvainOptions<NodeId>): CommunityDetectionResult<NodeId>;
declare function nodeSimilarity<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: SimilarityOptions): NodeSimilarityResult<NodeId>;
declare function kNearestNeighbors<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: KNearestNeighborsOptions): KNearestNeighborsResult<NodeId>;
declare function predictLinks<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: LinkPredictionOptions<NodeId>): LinkPredictionResult<NodeId>;
declare function linkPrediction<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: LinkPredictionOptions<NodeId>): LinkPredictionResult<NodeId>;
declare function aStarShortestPath<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], source: NodeId, target: NodeId, options?: AStarOptions<NodeId>): AStarResult<NodeId>;
declare function allPairsShortestPaths<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: AllPairsShortestPathsOptions): AllPairsShortestPathsResult<NodeId>;
declare function yenKShortestPaths<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], source: NodeId, target: NodeId, options?: YenKShortestPathsOptions): YenKShortestPathsResult<NodeId>;
declare function maximumFlow<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], source: NodeId, sink: NodeId, options?: MaximumFlowOptions): MaximumFlowResult<NodeId>;
declare function minCostMaxFlow<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: FlowEdge<NodeId>[], source: NodeId, sink: NodeId, options?: MinCostMaxFlowOptions): MinCostMaxFlowResult<NodeId>;
declare function kMeansClustering(points: number[][], k: number, options?: KMeansOptions): KMeansResult;
declare function kMeansAuto(points: number[][], options?: KMeansAutoOptions): KMeansAutoResult;
declare function travelingSalesmanApprox<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: TravelingSalesmanOptions<NodeId>): TravelingSalesmanResult<NodeId>;
type LinkageMethod = 'single' | 'complete' | 'average' | 'ward';
interface DendrogramNode {
    left: number;
    right: number;
    distance: number;
    size: number;
}
interface HierarchicalClusterResult {
    clusters: number[][];
    assignments: number[];
    dendrogram: DendrogramNode[];
    silhouette: number | null;
}
declare function hierarchicalClustering(points: number[][], k: number, options?: {
    linkage?: LinkageMethod;
    distanceMetric?: 'euclidean' | 'cosine' | 'manhattan';
}): HierarchicalClusterResult;
interface DbscanResult {
    clusters: number[][];
    assignments: number[];
    noise: number[];
    clusterCount: number;
}
declare function dbscan(points: number[][], epsilon: number, minPoints: number, options?: {
    distanceMetric?: 'euclidean' | 'cosine' | 'manhattan';
}): DbscanResult;

/**
 * Graph EDA — What Tukey Would Have Done With Graphs
 *
 * Treats graph structural properties as data series that deserve
 * full exploratory data analysis treatment.
 */

interface GraphEdaSummary<NodeId extends string = string> {
    nodeCount: number;
    edgeCount: number;
    density: number;
    degreeDistribution: SeriesDescription;
    inDegreeDistribution: SeriesDescription;
    outDegreeDistribution: SeriesDescription;
    clusteringCoefficients: Map<NodeId, number>;
    globalClusteringCoefficient: number;
    clusteringDistribution: SeriesDescription;
    averagePathLength: number;
    diameter: number;
    reciprocity: number;
    degreeAssortativity: number;
}
interface GraphOutlierResult<NodeId extends string = string> {
    nodeId: NodeId;
    score: number;
    reason: string;
}
/**
 * Compute the local clustering coefficient for each node.
 * For undirected graphs: the fraction of pairs of neighbors that are connected.
 * For directed graphs: uses the total number of directed triangles.
 */
declare function clusteringCoefficient<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: {
    directed?: boolean;
}): Map<NodeId, number>;
/**
 * Full exploratory data analysis of a graph's structural properties.
 * Returns distributions as Series descriptions for full Tukey-style EDA.
 */
declare function graphEda<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: {
    directed?: boolean;
    samplePathLength?: number;
}): GraphEdaSummary<NodeId>;
/**
 * Graph-based outlier detection: nodes with unusual structural signatures.
 */
declare function graphOutliers<NodeId extends string>(nodes: GraphNodeInput<NodeId>[], edges: GraphEdge<NodeId>[], options?: {
    method?: 'degree' | 'clustering' | 'combined';
    threshold?: number;
}): GraphOutlierResult<NodeId>[];

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
    centroid: number[];
    variances: number[];
    correlationMatrix: number[][];
    mahalanobisDistances: number[];
    outlierCount: number;
    dimensionSummaries: SeriesDescription[];
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
    variance(): number;
    stddev(): number;
    ema(alpha: number): number[];
    zscore(): number[];
    skewness(): number;
    kurtosis(): number;
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
    centroid(): number[];
    variances(): number[];
    standardDeviations(): number[];
    covarianceMatrix(): number[][];
    correlationMatrix(): number[][];
    mahalanobis(point: number[]): number;
    mahalanobisAll(): number[];
    outliersByMahalanobis(threshold?: number): number[][];
    normalizeL2(): Points;
    normalizeZscore(): Points;
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

export { type AStarOptions, type AStarResult, type AllPairsShortestPathsOptions, type AllPairsShortestPathsResult, type ArticulationBridgeResult, type BetweennessCentralityRecord, type BinnedResult, type ClosenessCentralityMode, type ClosenessCentralityOptions, type ClosenessCentralityRecord, type CommunityDetectionResult, type DbscanResult, type DegreeCentralityRecord, type DendrogramNode, type FlowEdge, type FlowEdgeResult, type GraphAdjacency, GraphAlgorithmError, type GraphAlgorithmErrorCode, type GraphAnalysisOptions, type GraphAnalysisResult, type GraphBuildOptions, type GraphEdaSummary, type GraphEdge, type GraphNeighbor, type GraphNodeInput, type GraphOutlierResult, type HierarchicalClusterResult, type KMeansAutoCandidate, type KMeansAutoOptions, type KMeansAutoResult, type KMeansCluster, type KMeansNormalization, type KMeansOptions, type KMeansResult, type KNearestNeighbor, type KNearestNeighborsOptions, type KNearestNeighborsResult, type LabelPropagationOptions, type LinkPredictionOptions, type LinkPredictionRecord, type LinkPredictionResult, type LinkageMethod, type LouvainOptions, type MaximumFlowOptions, type MaximumFlowResult, type MedianResult, type MinCostFlowEdgeResult, type MinCostMaxFlowOptions, type MinCostMaxFlowResult, type MinimumSpanningTreeOptions, type MinimumSpanningTreeResult, type ModeResult, type NodeSimilarityRecord, type NodeSimilarityResult, type PageRankOptions, type PageRankRecord, type PageRankResult, type PathRecord, Points, type PointsDescription, type PointsOptions, type RankInfo, type RankedResult, Series, type SeriesDescription, type SeriesOptions, type ShortestPathAlgorithm, type ShortestPathOptions, type ShortestPathResult, type SimilarityMetric, type SimilarityOptions, type StronglyConnectedComponentsOptions, type StronglyConnectedComponentsResult, type TopologicalSortOptions, type TopologicalSortResult, type TravelingSalesmanOptions, type TravelingSalesmanResult, type TravelingSalesmanSegment, Twokeys, type WeaklyConnectedComponentsResult, type YenKShortestPathsOptions, type YenKShortestPathsResult, aStarShortestPath, allPairsShortestPaths, analyzeGraph, articulationPointsAndBridges, betweennessCentrality, buildGraphAdjacency, closenessCentrality, clusteringCoefficient, cosineSimilarity, cosineSimilaritySparse, dbscan, Twokeys as default, degreeCentrality, euclideanDistance, graphEda, graphOutliers, hierarchicalClustering, jaccardSimilarity, kMeansAuto, kMeansClustering, kNearestNeighbors, labelPropagationCommunities, linkPrediction, louvainCommunities, mahalanobisDistance, manhattanDistance, maximumFlow, minCostMaxFlow, minimumSpanningTree, nodeSimilarity, normalizeL2, overlapCoefficient, pageRank, predictLinks, shortestPath, squaredEuclideanDistance, stronglyConnectedComponents, topologicalSort, travelingSalesmanApprox, weaklyConnectedComponents, yenKShortestPaths };
