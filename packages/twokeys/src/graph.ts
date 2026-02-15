import {
  squaredEuclideanDistance as squaredDistance,
  euclideanDistance,
  cosineSimilarity as distanceCosineSimilarity,
  manhattanDistance,
} from './distance';

export type GraphNodeInput<NodeId extends string = string> =
  | NodeId
  | { id: NodeId };

export interface GraphEdge<NodeId extends string = string> {
  from: NodeId;
  to: NodeId;
  weight?: number;
}

export interface GraphBuildOptions {
  directed?: boolean;
}

export interface GraphNeighbor<NodeId extends string = string> {
  id: NodeId;
  weight: number;
}

export interface GraphAdjacency<NodeId extends string = string> {
  nodes: NodeId[];
  neighborsByNode: Map<NodeId, GraphNeighbor<NodeId>[]>;
  incomingByNode: Map<NodeId, GraphNeighbor<NodeId>[]>;
  edges: Array<Required<GraphEdge<NodeId>>>;
  directed: boolean;
}

export type GraphAlgorithmErrorCode =
  | 'NEGATIVE_WEIGHT'
  | 'NEGATIVE_CYCLE'
  | 'INVALID_ARGUMENT';

export class GraphAlgorithmError extends Error {
  readonly code: GraphAlgorithmErrorCode;

  constructor(code: GraphAlgorithmErrorCode, message: string) {
    super(message);
    this.name = 'GraphAlgorithmError';
    this.code = code;
  }
}

export interface TopologicalSortOptions<NodeId extends string = string> {
  tieBreaker?: (left: NodeId, right: NodeId) => number;
  priority?: (nodeId: NodeId) => number;
  priorityByNode?: Map<NodeId, number> | Partial<Record<NodeId, number>>;
}

export interface TopologicalSortResult<NodeId extends string = string> {
  order: NodeId[];
  cycleNodes: NodeId[];
  isDag: boolean;
}

export interface StronglyConnectedComponentsOptions extends GraphBuildOptions {}

export interface StronglyConnectedComponentsResult<NodeId extends string = string> {
  components: NodeId[][];
  componentByNode: Map<NodeId, number>;
}

export interface WeaklyConnectedComponentsResult<NodeId extends string = string> {
  components: NodeId[][];
  componentByNode: Map<NodeId, number>;
}

export interface DegreeCentralityRecord {
  inDegree: number;
  outDegree: number;
  degree: number;
  normalized: number;
}

export type ClosenessCentralityMode = 'classic' | 'harmonic';

export interface ClosenessCentralityRecord {
  reachableCount: number;
  distanceSum: number;
  score: number;
  normalized: number;
  mode: ClosenessCentralityMode;
  negativeCycle: boolean;
}

export interface BetweennessCentralityRecord {
  raw: number;
  normalized: number;
}

export interface PageRankOptions extends GraphBuildOptions {
  dampingFactor?: number;
  tolerance?: number;
  maxIterations?: number;
}

export interface PageRankRecord {
  score: number;
  normalized: number;
  rank: number;
}

export interface PageRankResult<NodeId extends string = string> {
  byNode: Map<NodeId, PageRankRecord>;
  order: NodeId[];
  iterations: number;
  converged: boolean;
  dampingFactor: number;
}

export interface MinimumSpanningTreeOptions<NodeId extends string = string> {
  tieBreaker?: (left: NodeId, right: NodeId) => number;
}

export interface MinimumSpanningTreeResult<NodeId extends string = string> {
  edges: Array<Required<GraphEdge<NodeId>>>;
  totalWeight: number;
  componentCount: number;
  spanning: boolean;
}

export interface ArticulationBridgeResult<NodeId extends string = string> {
  articulationPoints: NodeId[];
  bridges: Array<Required<GraphEdge<NodeId>>>;
}

export interface GraphAnalysisResult<NodeId extends string = string> {
  degree: Map<NodeId, DegreeCentralityRecord>;
  closeness: Map<NodeId, ClosenessCentralityRecord>;
  betweenness: Map<NodeId, BetweennessCentralityRecord>;
  pageRank: Map<NodeId, PageRankRecord>;
  stronglyConnectedComponents: NodeId[][];
  weaklyConnectedComponents: NodeId[][];
  articulationPoints: NodeId[];
  bridges: Array<Required<GraphEdge<NodeId>>>;
}

export interface GraphAnalysisOptions extends GraphBuildOptions {
  closenessMode?: ClosenessCentralityMode;
  shortestPathAlgorithm?: ShortestPathAlgorithm;
  pageRankOptions?: Omit<PageRankOptions, 'directed'>;
}

export type ShortestPathAlgorithm = 'auto' | 'dijkstra' | 'bellman-ford';

export interface ShortestPathOptions extends GraphBuildOptions {
  algorithm?: ShortestPathAlgorithm;
  failOnNegativeCycle?: boolean;
}

export interface ShortestPathResult<NodeId extends string = string> {
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

export interface LabelPropagationOptions<NodeId extends string = string>
  extends GraphBuildOptions {
  maxIterations?: number;
  tieBreaker?: (left: NodeId, right: NodeId) => number;
}

export interface LouvainOptions<NodeId extends string = string>
  extends GraphBuildOptions {
  maxPasses?: number;
  tolerance?: number;
  tieBreaker?: (left: NodeId, right: NodeId) => number;
}

export interface CommunityDetectionResult<NodeId extends string = string> {
  communities: NodeId[][];
  communityByNode: Map<NodeId, number>;
  iterations: number;
  converged: boolean;
  algorithm: 'label-propagation' | 'louvain';
  modularity: number;
}

export type SimilarityMetric =
  | 'common-neighbors'
  | 'jaccard'
  | 'cosine'
  | 'overlap'
  | 'adamic-adar'
  | 'resource-allocation'
  | 'preferential-attachment';

export interface SimilarityOptions extends GraphBuildOptions {
  metric?: SimilarityMetric;
  minScore?: number;
}

export interface NodeSimilarityRecord<NodeId extends string = string> {
  left: NodeId;
  right: NodeId;
  score: number;
  metric: SimilarityMetric;
  rank: number;
}

export interface NodeSimilarityResult<NodeId extends string = string> {
  metric: SimilarityMetric;
  pairs: NodeSimilarityRecord<NodeId>[];
}

export interface KNearestNeighborsOptions extends GraphBuildOptions {
  metric?: SimilarityMetric;
  k?: number;
  minScore?: number;
}

export interface KNearestNeighbor<NodeId extends string = string> {
  nodeId: NodeId;
  score: number;
}

export interface KNearestNeighborsResult<NodeId extends string = string> {
  metric: SimilarityMetric;
  k: number;
  neighborsByNode: Map<NodeId, KNearestNeighbor<NodeId>[]>;
}

export interface LinkPredictionOptions<NodeId extends string = string>
  extends GraphBuildOptions {
  metric?: SimilarityMetric;
  limit?: number;
  minScore?: number;
  allowExistingEdges?: boolean;
  sourceFilter?: NodeId[];
  targetFilter?: NodeId[];
}

export interface LinkPredictionRecord<NodeId extends string = string> {
  from: NodeId;
  to: NodeId;
  score: number;
  metric: SimilarityMetric;
  rank: number;
}

export interface LinkPredictionResult<NodeId extends string = string> {
  metric: SimilarityMetric;
  predictions: LinkPredictionRecord<NodeId>[];
}

export interface AStarOptions<NodeId extends string = string>
  extends GraphBuildOptions {
  heuristic?: (nodeId: NodeId, targetId: NodeId) => number;
}

export interface AStarResult<NodeId extends string = string> {
  source: NodeId;
  target: NodeId;
  path: NodeId[];
  distance: number;
  reachable: boolean;
  explored: number;
  estimatedDistance: number;
}

export interface PathRecord<NodeId extends string = string> {
  path: NodeId[];
  distance: number;
}

export interface YenKShortestPathsOptions extends GraphBuildOptions {
  k?: number;
  shortestPathAlgorithm?: ShortestPathAlgorithm;
}

export interface YenKShortestPathsResult<NodeId extends string = string> {
  source: NodeId;
  target: NodeId;
  paths: PathRecord<NodeId>[];
  complete: boolean;
}

export interface AllPairsShortestPathsOptions extends GraphBuildOptions {
  algorithm?: ShortestPathAlgorithm;
  failOnNegativeCycle?: boolean;
}

export interface AllPairsShortestPathsResult<NodeId extends string = string> {
  nodes: NodeId[];
  distanceBySource: Map<NodeId, Map<NodeId, number>>;
  previousBySource: Map<NodeId, Map<NodeId, NodeId>>;
  algorithm: ShortestPathAlgorithm;
  hasNegativeWeights: boolean;
  negativeCycle: boolean;
}

export interface FlowEdge<NodeId extends string = string> {
  from: NodeId;
  to: NodeId;
  capacity: number;
  cost?: number;
}

export interface FlowEdgeResult<NodeId extends string = string> {
  from: NodeId;
  to: NodeId;
  flow: number;
  capacity: number;
}

export interface MaximumFlowOptions extends GraphBuildOptions {}

export interface MaximumFlowResult<NodeId extends string = string> {
  source: NodeId;
  sink: NodeId;
  maxFlow: number;
  augmentations: number;
  flowByEdge: FlowEdgeResult<NodeId>[];
  sourcePartition: NodeId[];
  sinkPartition: NodeId[];
  cutEdges: Array<Required<GraphEdge<NodeId>>>;
}

export interface MinCostMaxFlowOptions extends GraphBuildOptions {
  targetFlow?: number;
}

export interface MinCostFlowEdgeResult<NodeId extends string = string>
  extends FlowEdgeResult<NodeId> {
  cost: number;
}

export interface MinCostMaxFlowResult<NodeId extends string = string> {
  source: NodeId;
  sink: NodeId;
  flow: number;
  cost: number;
  complete: boolean;
  augmentations: number;
  flowByEdge: MinCostFlowEdgeResult<NodeId>[];
}

export type KMeansNormalization = 'none' | 'zscore' | 'minmax';

export interface KMeansOptions {
  maxIterations?: number;
  tolerance?: number;
  seed?: number;
  nInit?: number;
  normalization?: KMeansNormalization;
  useKMeansPlusPlus?: boolean;
}

export interface KMeansCluster {
  centroid: number[];
  indices: number[];
}

export interface KMeansResult {
  assignments: number[];
  clusters: KMeansCluster[];
  iterations: number;
  inertia: number;
  converged: boolean;
  silhouette: number | null;
  selectedSeed: number;
}

export interface KMeansAutoOptions extends KMeansOptions {
  kMin?: number;
  kMax?: number;
}

export interface KMeansAutoCandidate {
  k: number;
  silhouette: number | null;
  inertia: number;
}

export interface KMeansAutoResult extends KMeansResult {
  selectedK: number;
  candidates: KMeansAutoCandidate[];
}

export interface TravelingSalesmanOptions<NodeId extends string = string>
  extends GraphBuildOptions {
  start?: NodeId;
  returnToStart?: boolean;
  twoOptPasses?: number;
  multiStartCount?: number;
  startCandidates?: NodeId[];
  seed?: number;
  shortestPathAlgorithm?: ShortestPathAlgorithm;
}

export interface TravelingSalesmanSegment<NodeId extends string = string> {
  from: NodeId;
  to: NodeId;
  distance: number;
  path: NodeId[];
}

export interface TravelingSalesmanResult<NodeId extends string = string> {
  order: NodeId[];
  distance: number;
  segments: TravelingSalesmanSegment<NodeId>[];
  visitedCount: number;
  complete: boolean;
  unreachableNodes: NodeId[];
  lowerBound: number;
  optimalityGap: number | null;
}

interface SingleSourceShortestResult<NodeId extends string = string> {
  distanceByNode: Map<NodeId, number>;
  previousByNode: Map<NodeId, NodeId>;
  explored: number;
  negativeCycleNodes: Set<NodeId>;
}

interface ShortestPathEngineResult<NodeId extends string = string> {
  algorithm: ShortestPathAlgorithm;
  result: SingleSourceShortestResult<NodeId>;
  hasNegativeWeights: boolean;
}

interface PointNormalizationTransform {
  normalize: (point: number[]) => number[];
  denormalize: (point: number[]) => number[];
}

interface KMeansRunResult {
  assignments: number[];
  centroidsNormalized: number[][];
  iterations: number;
  inertia: number;
  converged: boolean;
}

class MinPriorityQueue<Value> {
  private heap: Array<{ priority: number; value: Value }> = [];

  get size(): number {
    return this.heap.length;
  }

  push(value: Value, priority: number): void {
    this.heap.push({ priority, value });
    this.siftUp(this.heap.length - 1);
  }

  pop(): { priority: number; value: Value } | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.siftDown(0);
    }

    return top;
  }

  private siftUp(index: number): void {
    let cursor = index;

    while (cursor > 0) {
      const parent = Math.floor((cursor - 1) / 2);
      const current = this.heap[cursor];
      const parentItem = this.heap[parent];

      if (!current || !parentItem) {
        return;
      }
      if (parentItem.priority <= current.priority) {
        return;
      }

      this.heap[parent] = current;
      this.heap[cursor] = parentItem;
      cursor = parent;
    }
  }

  private siftDown(index: number): void {
    let cursor = index;

    while (true) {
      const left = cursor * 2 + 1;
      const right = cursor * 2 + 2;
      let smallest = cursor;

      const current = this.heap[smallest];
      const leftItem = this.heap[left];
      const rightItem = this.heap[right];

      if (current && leftItem && leftItem.priority < current.priority) {
        smallest = left;
      }

      const currentSmallest = this.heap[smallest];
      if (
        currentSmallest &&
        rightItem &&
        rightItem.priority < currentSmallest.priority
      ) {
        smallest = right;
      }

      if (smallest === cursor) {
        return;
      }

      const cursorItem = this.heap[cursor];
      const smallestItem = this.heap[smallest];
      if (!cursorItem || !smallestItem) {
        return;
      }

      this.heap[cursor] = smallestItem;
      this.heap[smallest] = cursorItem;
      cursor = smallest;
    }
  }
}

function defaultTieBreaker(left: string, right: string): number {
  return left.localeCompare(right);
}

function canonicalUndirectedEdge<NodeId extends string>(
  left: NodeId,
  right: NodeId,
): { from: NodeId; to: NodeId } {
  return defaultTieBreaker(left, right) <= 0
    ? { from: left, to: right }
    : { from: right, to: left };
}

function undirectedEdgeKey<NodeId extends string>(left: NodeId, right: NodeId): string {
  const edge = canonicalUndirectedEdge(left, right);
  return `${edge.from}\u0000${edge.to}`;
}

function asNodeId<NodeId extends string>(input: GraphNodeInput<NodeId>): NodeId {
  return typeof input === 'string' ? input : input.id;
}

class DisjointSet<NodeId extends string> {
  private parent = new Map<NodeId, NodeId>();

  private rank = new Map<NodeId, number>();

  constructor(nodes: NodeId[]) {
    for (const nodeId of nodes) {
      this.parent.set(nodeId, nodeId);
      this.rank.set(nodeId, 0);
    }
  }

  find(nodeId: NodeId): NodeId {
    const parent = this.parent.get(nodeId);
    if (!parent || parent === nodeId) {
      return nodeId;
    }

    const root = this.find(parent);
    this.parent.set(nodeId, root);
    return root;
  }

  union(left: NodeId, right: NodeId): boolean {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot === rightRoot) {
      return false;
    }

    const leftRank = this.rank.get(leftRoot) ?? 0;
    const rightRank = this.rank.get(rightRoot) ?? 0;

    if (leftRank < rightRank) {
      this.parent.set(leftRoot, rightRoot);
      return true;
    }

    if (leftRank > rightRank) {
      this.parent.set(rightRoot, leftRoot);
      return true;
    }

    this.parent.set(rightRoot, leftRoot);
    this.rank.set(leftRoot, leftRank + 1);
    return true;
  }
}

function dedupeNodeList<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
): NodeId[] {
  const seen = new Set<NodeId>();
  const ordered: NodeId[] = [];

  for (const node of nodes) {
    const nodeId = asNodeId(node);
    if (!seen.has(nodeId)) {
      seen.add(nodeId);
      ordered.push(nodeId);
    }
  }

  for (const edge of edges) {
    if (!seen.has(edge.from)) {
      seen.add(edge.from);
      ordered.push(edge.from);
    }
    if (!seen.has(edge.to)) {
      seen.add(edge.to);
      ordered.push(edge.to);
    }
  }

  return ordered;
}

function normalizeWeight(weight: number | undefined): number {
  if (weight === undefined) {
    return 1;
  }

  if (!Number.isFinite(weight)) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      `Graph edge weight must be finite, received ${weight}`,
    );
  }

  return weight;
}

function initializeNeighborMap<NodeId extends string>(
  nodeIds: NodeId[],
): Map<NodeId, Map<NodeId, number>> {
  const map = new Map<NodeId, Map<NodeId, number>>();
  for (const nodeId of nodeIds) {
    map.set(nodeId, new Map<NodeId, number>());
  }
  return map;
}

function maybeUpdateEdge<NodeId extends string>(
  map: Map<NodeId, Map<NodeId, number>>,
  from: NodeId,
  to: NodeId,
  weight: number,
): void {
  const outgoing = map.get(from);
  if (!outgoing) {
    return;
  }

  const existing = outgoing.get(to);
  if (existing === undefined || weight < existing) {
    outgoing.set(to, weight);
  }
}

function buildNormalizedEdgeMap<NodeId extends string>(
  nodeIds: NodeId[],
  edges: GraphEdge<NodeId>[],
  directed: boolean,
): Map<NodeId, Map<NodeId, number>> {
  const neighbors = initializeNeighborMap(nodeIds);

  for (const edge of edges) {
    if (edge.from === edge.to) {
      continue;
    }

    const weight = normalizeWeight(edge.weight);
    if (!neighbors.has(edge.from) || !neighbors.has(edge.to)) {
      continue;
    }

    maybeUpdateEdge(neighbors, edge.from, edge.to, weight);
    if (!directed) {
      maybeUpdateEdge(neighbors, edge.to, edge.from, weight);
    }
  }

  return neighbors;
}

function toNeighborList<NodeId extends string>(
  edgeMap: Map<NodeId, Map<NodeId, number>>,
): Map<NodeId, GraphNeighbor<NodeId>[]> {
  const neighborsByNode = new Map<NodeId, GraphNeighbor<NodeId>[]>();

  for (const [nodeId, outgoing] of edgeMap.entries()) {
    const neighbors: GraphNeighbor<NodeId>[] = [];
    for (const [targetId, weight] of outgoing.entries()) {
      neighbors.push({ id: targetId, weight });
    }
    neighborsByNode.set(nodeId, neighbors);
  }

  return neighborsByNode;
}

function createIncomingByNode<NodeId extends string>(
  nodeIds: NodeId[],
  neighborsByNode: Map<NodeId, GraphNeighbor<NodeId>[]>,
): Map<NodeId, GraphNeighbor<NodeId>[]> {
  const incomingByNode = new Map<NodeId, GraphNeighbor<NodeId>[]>();
  for (const nodeId of nodeIds) {
    incomingByNode.set(nodeId, []);
  }

  for (const [fromId, neighbors] of neighborsByNode.entries()) {
    for (const neighbor of neighbors) {
      const incoming = incomingByNode.get(neighbor.id);
      if (!incoming) {
        continue;
      }
      incoming.push({ id: fromId, weight: neighbor.weight });
    }
  }

  return incomingByNode;
}

function toEdgeList<NodeId extends string>(
  neighborsByNode: Map<NodeId, GraphNeighbor<NodeId>[]>,
): Array<Required<GraphEdge<NodeId>>> {
  const edges: Array<Required<GraphEdge<NodeId>>> = [];
  for (const [fromId, neighbors] of neighborsByNode.entries()) {
    for (const neighbor of neighbors) {
      edges.push({
        from: fromId,
        to: neighbor.id,
        weight: neighbor.weight,
      });
    }
  }
  return edges;
}

function hasNegativeWeights<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
): boolean {
  for (const edge of adjacency.edges) {
    if (edge.weight < 0) {
      return true;
    }
  }
  return false;
}

function reconstructPath<NodeId extends string>(
  source: NodeId,
  target: NodeId,
  previousByNode: Map<NodeId, NodeId>,
): NodeId[] {
  if (source === target) {
    return [source];
  }

  const reversed: NodeId[] = [target];
  let cursor: NodeId | undefined = target;

  while (cursor && cursor !== source) {
    const previous = previousByNode.get(cursor);
    if (!previous) {
      return [];
    }
    reversed.push(previous);
    cursor = previous;
  }

  reversed.reverse();
  return reversed[0] === source ? reversed : [];
}

function sumNeighborWeights<NodeId extends string>(
  neighbors: GraphNeighbor<NodeId>[],
): number {
  return neighbors.reduce((sum, neighbor) => sum + neighbor.weight, 0);
}

function collectUniqueUndirectedEdges<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
): Array<Required<GraphEdge<NodeId>>> {
  const byKey = new Map<string, Required<GraphEdge<NodeId>>>();

  for (const edge of adjacency.edges) {
    const canonical = canonicalUndirectedEdge(edge.from, edge.to);
    const key = undirectedEdgeKey(canonical.from, canonical.to);
    const existing = byKey.get(key);
    if (!existing || edge.weight < existing.weight - 1e-12) {
      byKey.set(key, {
        from: canonical.from,
        to: canonical.to,
        weight: edge.weight,
      });
    }
  }

  return Array.from(byKey.values());
}

function computeModularity<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
  communityByNode: Map<NodeId, number>,
): number {
  const uniqueEdges = collectUniqueUndirectedEdges(adjacency);
  let totalEdgeWeight = 0;
  for (const edge of uniqueEdges) {
    totalEdgeWeight += edge.weight;
  }

  if (!Number.isFinite(totalEdgeWeight) || totalEdgeWeight <= 0) {
    return 0;
  }

  const degreeByNode = new Map<NodeId, number>();
  for (const nodeId of adjacency.nodes) {
    degreeByNode.set(
      nodeId,
      sumNeighborWeights(adjacency.neighborsByNode.get(nodeId) ?? []),
    );
  }

  const totalWeightByCommunity = new Map<number, number>();
  const internalWeightByCommunity = new Map<number, number>();

  for (const nodeId of adjacency.nodes) {
    const community = communityByNode.get(nodeId);
    if (community === undefined) {
      continue;
    }
    const degree = degreeByNode.get(nodeId) ?? 0;
    totalWeightByCommunity.set(
      community,
      (totalWeightByCommunity.get(community) ?? 0) + degree,
    );
  }

  for (const edge of uniqueEdges) {
    const fromCommunity = communityByNode.get(edge.from);
    const toCommunity = communityByNode.get(edge.to);
    if (fromCommunity === undefined || toCommunity === undefined) {
      continue;
    }
    if (fromCommunity !== toCommunity) {
      continue;
    }

    internalWeightByCommunity.set(
      fromCommunity,
      (internalWeightByCommunity.get(fromCommunity) ?? 0) + edge.weight,
    );
  }

  let modularity = 0;
  for (const [community, totalWeight] of totalWeightByCommunity.entries()) {
    const internal = internalWeightByCommunity.get(community) ?? 0;
    modularity +=
      internal / totalEdgeWeight -
      Math.pow(totalWeight / (2 * totalEdgeWeight), 2);
  }

  return modularity;
}

function buildCommunityResult<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
  labelsByNode: Map<NodeId, number>,
  iterations: number,
  converged: boolean,
  algorithm: CommunityDetectionResult<NodeId>['algorithm'],
): CommunityDetectionResult<NodeId> {
  const communitiesRaw = new Map<number, NodeId[]>();
  for (const nodeId of adjacency.nodes) {
    const label = labelsByNode.get(nodeId);
    if (label === undefined) {
      continue;
    }
    const members = communitiesRaw.get(label) ?? [];
    members.push(nodeId);
    communitiesRaw.set(label, members);
  }

  const communities = Array.from(communitiesRaw.values()).map((members) =>
    [...members].sort(defaultTieBreaker),
  );
  communities.sort((left, right) =>
    defaultTieBreaker(left[0] ?? '', right[0] ?? ''),
  );

  const communityByNode = new Map<NodeId, number>();
  for (let index = 0; index < communities.length; index += 1) {
    for (const nodeId of communities[index] ?? []) {
      communityByNode.set(nodeId, index);
    }
  }

  return {
    communities,
    communityByNode,
    iterations,
    converged,
    algorithm,
    modularity: computeModularity(adjacency, communityByNode),
  };
}

function buildNeighborIdSetMap<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
): Map<NodeId, Set<NodeId>> {
  const output = new Map<NodeId, Set<NodeId>>();

  for (const nodeId of adjacency.nodes) {
    output.set(nodeId, new Set<NodeId>());
  }

  for (const [nodeId, neighbors] of adjacency.neighborsByNode.entries()) {
    const set = output.get(nodeId);
    if (!set) {
      continue;
    }
    for (const neighbor of neighbors) {
      set.add(neighbor.id);
    }
  }

  return output;
}

function computeSimilarityScore<NodeId extends string>(
  leftId: NodeId,
  rightId: NodeId,
  neighborSets: Map<NodeId, Set<NodeId>>,
  metric: SimilarityMetric,
): number {
  const left = neighborSets.get(leftId) ?? new Set<NodeId>();
  const right = neighborSets.get(rightId) ?? new Set<NodeId>();
  const leftSize = left.size;
  const rightSize = right.size;

  const iterate = leftSize <= rightSize ? left : right;
  const lookup = iterate === left ? right : left;
  let common = 0;
  let adamicAdar = 0;
  let resourceAllocation = 0;

  for (const neighbor of iterate) {
    if (!lookup.has(neighbor)) {
      continue;
    }

    common += 1;
    const degree = neighborSets.get(neighbor)?.size ?? 0;
    if (degree > 1) {
      adamicAdar += 1 / Math.log(degree);
    }
    if (degree > 0) {
      resourceAllocation += 1 / degree;
    }
  }

  if (metric === 'common-neighbors') {
    return common;
  }
  if (metric === 'preferential-attachment') {
    return leftSize * rightSize;
  }
  if (metric === 'adamic-adar') {
    return adamicAdar;
  }
  if (metric === 'resource-allocation') {
    return resourceAllocation;
  }
  if (metric === 'jaccard') {
    const union = leftSize + rightSize - common;
    return union > 0 ? common / union : 0;
  }
  if (metric === 'cosine') {
    return leftSize > 0 && rightSize > 0
      ? common / Math.sqrt(leftSize * rightSize)
      : 0;
  }

  const overlapDenominator = Math.min(leftSize, rightSize);
  return overlapDenominator > 0 ? common / overlapDenominator : 0;
}

function routeDistanceForPath<NodeId extends string>(
  path: NodeId[],
  adjacency: GraphAdjacency<NodeId>,
): number {
  if (path.length <= 1) {
    return 0;
  }

  let total = 0;
  for (let index = 1; index < path.length; index += 1) {
    const fromId = path[index - 1];
    const toId = path[index];
    if (!fromId || !toId) {
      return Number.POSITIVE_INFINITY;
    }

    const weight = adjacency.neighborsByNode
      .get(fromId)
      ?.find((neighbor) => neighbor.id === toId)?.weight;
    if (weight === undefined || !Number.isFinite(weight)) {
      return Number.POSITIVE_INFINITY;
    }
    total += weight;
  }

  return total;
}

function pathKey<NodeId extends string>(path: NodeId[]): string {
  return path.join('\u0000');
}

function hasSamePrefix<NodeId extends string>(
  path: NodeId[],
  prefix: NodeId[],
): boolean {
  if (prefix.length > path.length) {
    return false;
  }
  for (let index = 0; index < prefix.length; index += 1) {
    if (path[index] !== prefix[index]) {
      return false;
    }
  }
  return true;
}

function chooseShortestPathAlgorithm(
  requested: ShortestPathAlgorithm,
  hasNegative: boolean,
): ShortestPathAlgorithm {
  if (requested === 'auto') {
    return hasNegative ? 'bellman-ford' : 'dijkstra';
  }
  return requested;
}

function runDijkstra<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
  source: NodeId,
): SingleSourceShortestResult<NodeId> {
  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'Dijkstra cannot run on negative graph weights.',
    );
  }

  const distanceByNode = new Map<NodeId, number>();
  const previousByNode = new Map<NodeId, NodeId>();
  const settled = new Set<NodeId>();
  const queue = new MinPriorityQueue<NodeId>();

  for (const nodeId of adjacency.nodes) {
    distanceByNode.set(nodeId, Number.POSITIVE_INFINITY);
  }

  distanceByNode.set(source, 0);
  queue.push(source, 0);

  while (queue.size > 0) {
    const item = queue.pop();
    if (!item) {
      break;
    }

    const nodeId = item.value;
    if (settled.has(nodeId)) {
      continue;
    }
    settled.add(nodeId);

    const currentDistance = distanceByNode.get(nodeId);
    if (currentDistance === undefined || !Number.isFinite(currentDistance)) {
      continue;
    }

    const neighbors = adjacency.neighborsByNode.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const nextDistance = currentDistance + neighbor.weight;
      const existingDistance = distanceByNode.get(neighbor.id);

      if (
        existingDistance === undefined ||
        nextDistance < existingDistance - 1e-12
      ) {
        distanceByNode.set(neighbor.id, nextDistance);
        previousByNode.set(neighbor.id, nodeId);
        queue.push(neighbor.id, nextDistance);
      }
    }
  }

  return {
    distanceByNode,
    previousByNode,
    explored: settled.size,
    negativeCycleNodes: new Set<NodeId>(),
  };
}

function runBellmanFord<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
  source: NodeId,
): SingleSourceShortestResult<NodeId> {
  const distanceByNode = new Map<NodeId, number>();
  const previousByNode = new Map<NodeId, NodeId>();

  for (const nodeId of adjacency.nodes) {
    distanceByNode.set(nodeId, Number.POSITIVE_INFINITY);
  }
  distanceByNode.set(source, 0);

  const totalNodes = adjacency.nodes.length;

  for (let iteration = 0; iteration < totalNodes - 1; iteration += 1) {
    let changed = false;

    for (const edge of adjacency.edges) {
      const fromDistance = distanceByNode.get(edge.from);
      if (fromDistance === undefined || !Number.isFinite(fromDistance)) {
        continue;
      }

      const candidate = fromDistance + edge.weight;
      const current = distanceByNode.get(edge.to);
      if (current === undefined || candidate < current - 1e-12) {
        distanceByNode.set(edge.to, candidate);
        previousByNode.set(edge.to, edge.from);
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  const negativeCycleNodes = new Set<NodeId>();
  const queue: NodeId[] = [];

  for (const edge of adjacency.edges) {
    const fromDistance = distanceByNode.get(edge.from);
    const toDistance = distanceByNode.get(edge.to);

    if (
      fromDistance !== undefined &&
      Number.isFinite(fromDistance) &&
      toDistance !== undefined &&
      fromDistance + edge.weight < toDistance - 1e-12
    ) {
      if (!negativeCycleNodes.has(edge.to)) {
        negativeCycleNodes.add(edge.to);
        queue.push(edge.to);
      }
      if (!negativeCycleNodes.has(edge.from)) {
        negativeCycleNodes.add(edge.from);
        queue.push(edge.from);
      }
    }
  }

  let cursor = 0;
  while (cursor < queue.length) {
    const nodeId = queue[cursor];
    cursor += 1;
    if (!nodeId) {
      continue;
    }

    for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
      if (!negativeCycleNodes.has(neighbor.id)) {
        negativeCycleNodes.add(neighbor.id);
        queue.push(neighbor.id);
      }
    }
  }

  if (negativeCycleNodes.size > 0) {
    for (const nodeId of negativeCycleNodes) {
      distanceByNode.set(nodeId, Number.NEGATIVE_INFINITY);
      previousByNode.delete(nodeId);
    }
  }

  let explored = 0;
  for (const nodeId of adjacency.nodes) {
    const distance = distanceByNode.get(nodeId);
    if (distance !== undefined && Number.isFinite(distance)) {
      explored += 1;
    }
  }

  return {
    distanceByNode,
    previousByNode,
    explored,
    negativeCycleNodes,
  };
}

function runShortestPathEngine<NodeId extends string>(
  adjacency: GraphAdjacency<NodeId>,
  source: NodeId,
  requestedAlgorithm: ShortestPathAlgorithm,
): ShortestPathEngineResult<NodeId> {
  const hasNegative = hasNegativeWeights(adjacency);
  const algorithm = chooseShortestPathAlgorithm(requestedAlgorithm, hasNegative);

  if (algorithm === 'dijkstra') {
    return {
      algorithm,
      result: runDijkstra(adjacency, source),
      hasNegativeWeights: hasNegative,
    };
  }

  return {
    algorithm,
    result: runBellmanFord(adjacency, source),
    hasNegativeWeights: hasNegative,
  };
}

function createRandom(seed: number | undefined): () => number {
  if (seed === undefined || !Number.isFinite(seed)) {
    return Math.random;
  }

  let state = (Math.floor(seed) >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// squaredDistance and euclideanDistance are now imported from './distance'

function normalizePoints(
  points: number[][],
  mode: KMeansNormalization,
): PointNormalizationTransform {
  const dimensionality = points[0]?.length ?? 0;

  if (mode === 'none') {
    return {
      normalize: (point) => [...point],
      denormalize: (point) => [...point],
    };
  }

  const means = new Array<number>(dimensionality).fill(0);
  const mins = new Array<number>(dimensionality).fill(Number.POSITIVE_INFINITY);
  const maxs = new Array<number>(dimensionality).fill(Number.NEGATIVE_INFINITY);

  for (const point of points) {
    for (let axis = 0; axis < dimensionality; axis += 1) {
      const value = point[axis] ?? 0;
      means[axis] = (means[axis] ?? 0) + value;
      mins[axis] = Math.min(mins[axis] ?? value, value);
      maxs[axis] = Math.max(maxs[axis] ?? value, value);
    }
  }

  for (let axis = 0; axis < dimensionality; axis += 1) {
    means[axis] = (means[axis] ?? 0) / points.length;
  }

  if (mode === 'minmax') {
    const ranges = maxs.map((max, axis) => {
      const min = mins[axis] ?? 0;
      return max - min;
    });

    return {
      normalize: (point) =>
        point.map((value, axis) => {
          const min = mins[axis] ?? 0;
          const range = ranges[axis] ?? 0;
          if (Math.abs(range) < 1e-12) {
            return 0;
          }
          return (value - min) / range;
        }),
      denormalize: (point) =>
        point.map((value, axis) => {
          const min = mins[axis] ?? 0;
          const range = ranges[axis] ?? 0;
          return value * range + min;
        }),
    };
  }

  const variances = new Array<number>(dimensionality).fill(0);
  for (const point of points) {
    for (let axis = 0; axis < dimensionality; axis += 1) {
      const delta = (point[axis] ?? 0) - (means[axis] ?? 0);
      variances[axis] = (variances[axis] ?? 0) + delta * delta;
    }
  }

  const stdDevs = variances.map((variance) => Math.sqrt(variance / points.length));

  return {
    normalize: (point) =>
      point.map((value, axis) => {
        const stdDev = stdDevs[axis] ?? 0;
        if (stdDev < 1e-12) {
          return 0;
        }
        return (value - (means[axis] ?? 0)) / stdDev;
      }),
    denormalize: (point) =>
      point.map((value, axis) => {
        const stdDev = stdDevs[axis] ?? 0;
        return value * stdDev + (means[axis] ?? 0);
      }),
  };
}

function initializeCentroids(
  points: number[][],
  k: number,
  random: () => number,
  useKMeansPlusPlus: boolean,
): number[][] {
  if (points.length === 0) {
    return [];
  }

  if (!useKMeansPlusPlus) {
    const centroids: number[][] = [];
    const selected = new Set<number>();
    while (centroids.length < k) {
      const index = Math.floor(random() * points.length);
      if (selected.has(index)) {
        continue;
      }
      selected.add(index);
      centroids.push([...(points[index] ?? points[0] ?? [])]);
    }
    return centroids;
  }

  const centroids: number[][] = [];
  const selected = new Set<number>();

  const first = Math.floor(random() * points.length);
  selected.add(first);
  centroids.push([...(points[first] ?? points[0] ?? [])]);

  while (centroids.length < k) {
    const distanceWeights = new Array<number>(points.length).fill(0);
    let totalWeight = 0;

    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      if (selected.has(pointIndex)) {
        continue;
      }

      const point = points[pointIndex];
      if (!point) {
        continue;
      }

      let bestDistance = Number.POSITIVE_INFINITY;
      for (const centroid of centroids) {
        bestDistance = Math.min(bestDistance, squaredDistance(point, centroid));
      }

      distanceWeights[pointIndex] = bestDistance;
      totalWeight += bestDistance;
    }

    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
      for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
        if (!selected.has(pointIndex)) {
          selected.add(pointIndex);
          centroids.push([...(points[pointIndex] ?? points[0] ?? [])]);
          break;
        }
      }
      continue;
    }

    const threshold = random() * totalWeight;
    let running = 0;
    let pickedIndex = -1;

    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      if (selected.has(pointIndex)) {
        continue;
      }
      running += distanceWeights[pointIndex] ?? 0;
      if (running >= threshold) {
        pickedIndex = pointIndex;
        break;
      }
    }

    if (pickedIndex < 0) {
      for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
        if (!selected.has(pointIndex)) {
          pickedIndex = pointIndex;
          break;
        }
      }
    }

    if (pickedIndex < 0) {
      break;
    }

    selected.add(pickedIndex);
    centroids.push([...(points[pickedIndex] ?? points[0] ?? [])]);
  }

  return centroids;
}

function runSingleKMeans(
  points: number[][],
  k: number,
  random: () => number,
  maxIterations: number,
  tolerance: number,
  useKMeansPlusPlus: boolean,
): KMeansRunResult {
  const dimensionality = points[0]?.length ?? 0;
  let centroids = initializeCentroids(points, k, random, useKMeansPlusPlus);

  if (centroids.length !== k) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'Unable to initialize centroids for k-means.',
    );
  }

  const assignments = new Array<number>(points.length).fill(-1);
  let iterations = 0;
  let converged = false;
  let inertia = Number.POSITIVE_INFINITY;

  while (iterations < maxIterations) {
    iterations += 1;
    let changed = false;
    inertia = 0;

    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      const point = points[pointIndex];
      if (!point) {
        continue;
      }

      let bestCluster = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let clusterIndex = 0; clusterIndex < centroids.length; clusterIndex += 1) {
        const centroid = centroids[clusterIndex];
        if (!centroid) {
          continue;
        }
        const distance = squaredDistance(point, centroid);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestCluster = clusterIndex;
        }
      }

      inertia += bestDistance;
      if (assignments[pointIndex] !== bestCluster) {
        assignments[pointIndex] = bestCluster;
        changed = true;
      }
    }

    const nextCentroids = new Array<number[]>(k);
    const counts = new Array<number>(k).fill(0);

    for (let clusterIndex = 0; clusterIndex < k; clusterIndex += 1) {
      nextCentroids[clusterIndex] = new Array<number>(dimensionality).fill(0);
    }

    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      const clusterIndex = assignments[pointIndex];
      if (clusterIndex < 0) {
        continue;
      }

      const point = points[pointIndex];
      const centroid = nextCentroids[clusterIndex];
      if (!point || !centroid) {
        continue;
      }

      counts[clusterIndex] = (counts[clusterIndex] ?? 0) + 1;
      for (let axis = 0; axis < dimensionality; axis += 1) {
        centroid[axis] = (centroid[axis] ?? 0) + (point[axis] ?? 0);
      }
    }

    for (let clusterIndex = 0; clusterIndex < k; clusterIndex += 1) {
      const count = counts[clusterIndex] ?? 0;
      if (count > 0) {
        const centroid = nextCentroids[clusterIndex];
        if (!centroid) {
          continue;
        }
        for (let axis = 0; axis < dimensionality; axis += 1) {
          centroid[axis] = (centroid[axis] ?? 0) / count;
        }
      } else {
        let farthestIndex = 0;
        let farthestDistance = -1;

        for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
          const assigned = assignments[pointIndex];
          const centroid = centroids[assigned];
          const point = points[pointIndex];
          if (!centroid || !point) {
            continue;
          }

          const distance = squaredDistance(point, centroid);
          if (distance > farthestDistance) {
            farthestDistance = distance;
            farthestIndex = pointIndex;
          }
        }

        nextCentroids[clusterIndex] = [...(points[farthestIndex] ?? points[0] ?? [])];
      }
    }

    let maxShift = 0;
    for (let clusterIndex = 0; clusterIndex < k; clusterIndex += 1) {
      const previous = centroids[clusterIndex];
      const next = nextCentroids[clusterIndex];
      if (!previous || !next) {
        continue;
      }
      maxShift = Math.max(maxShift, Math.sqrt(squaredDistance(previous, next)));
    }

    centroids = nextCentroids;

    if (!changed || maxShift <= tolerance) {
      converged = true;
      break;
    }
  }

  return {
    assignments,
    centroidsNormalized: centroids,
    iterations,
    inertia,
    converged,
  };
}

function computeSilhouette(points: number[][], assignments: number[], k: number): number | null {
  if (points.length <= 1 || k <= 1) {
    return null;
  }

  const clusters: number[][] = Array.from({ length: k }, (): number[] => []);
  for (let index = 0; index < assignments.length; index += 1) {
    const cluster = assignments[index] ?? -1;
    if (cluster >= 0 && cluster < k) {
      const clusterMembers = clusters[cluster];
      if (clusterMembers) {
        clusterMembers.push(index);
      }
    }
  }

  let total = 0;
  let counted = 0;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const ownCluster = assignments[index] ?? -1;

    if (!point || ownCluster < 0 || ownCluster >= k) {
      continue;
    }

    const ownMembers = clusters[ownCluster] ?? [];
    if (ownMembers.length <= 1) {
      continue;
    }

    let a = 0;
    for (const neighborIndex of ownMembers) {
      if (neighborIndex === index) {
        continue;
      }
      const neighbor = points[neighborIndex];
      if (!neighbor) {
        continue;
      }
      a += euclideanDistance(point, neighbor);
    }
    a /= ownMembers.length - 1;

    let b = Number.POSITIVE_INFINITY;

    for (let cluster = 0; cluster < k; cluster += 1) {
      if (cluster === ownCluster) {
        continue;
      }

      const members = clusters[cluster] ?? [];
      if (members.length === 0) {
        continue;
      }

      let distanceToCluster = 0;
      for (const neighborIndex of members) {
        const neighbor = points[neighborIndex];
        if (!neighbor) {
          continue;
        }
        distanceToCluster += euclideanDistance(point, neighbor);
      }
      distanceToCluster /= members.length;
      b = Math.min(b, distanceToCluster);
    }

    if (!Number.isFinite(b)) {
      continue;
    }

    const denominator = Math.max(a, b);
    if (denominator <= 0) {
      continue;
    }

    total += (b - a) / denominator;
    counted += 1;
  }

  if (counted === 0) {
    return null;
  }

  return total / counted;
}

function routeDistanceFromMatrix<NodeId extends string>(
  route: NodeId[],
  distanceMatrix: Map<NodeId, Map<NodeId, number>>,
): number {
  let total = 0;

  for (let index = 1; index < route.length; index += 1) {
    const fromId = route[index - 1];
    const toId = route[index];
    if (!fromId || !toId) {
      return Number.POSITIVE_INFINITY;
    }

    const distance = distanceMatrix.get(fromId)?.get(toId);
    if (distance === undefined || !Number.isFinite(distance)) {
      return Number.POSITIVE_INFINITY;
    }

    total += distance;
  }

  return total;
}

function optimizeRouteTwoOpt<NodeId extends string>(
  route: NodeId[],
  distanceMatrix: Map<NodeId, Map<NodeId, number>>,
  passes: number,
): NodeId[] {
  if (route.length < 4 || passes <= 0) {
    return route;
  }

  let best = [...route];
  let bestDistance = routeDistanceFromMatrix(best, distanceMatrix);

  if (!Number.isFinite(bestDistance)) {
    return best;
  }

  for (let pass = 0; pass < passes; pass += 1) {
    let improved = false;

    for (let start = 1; start < best.length - 2; start += 1) {
      for (let end = start + 1; end < best.length - 1; end += 1) {
        const head = best.slice(0, start);
        const middle = best.slice(start, end + 1).reverse();
        const tail = best.slice(end + 1);
        const candidate = head.concat(middle, tail);
        const candidateDistance = routeDistanceFromMatrix(
          candidate,
          distanceMatrix,
        );

        if (candidateDistance + 1e-9 < bestDistance) {
          best = candidate;
          bestDistance = candidateDistance;
          improved = true;
        }
      }
    }

    if (!improved) {
      break;
    }
  }

  return best;
}

function createDeterministicStartList<NodeId extends string>(
  nodes: NodeId[],
  options: TravelingSalesmanOptions<NodeId>,
): NodeId[] {
  const starts: NodeId[] = [];
  const used = new Set<NodeId>();

  if (options.start && nodes.includes(options.start)) {
    starts.push(options.start);
    used.add(options.start);
  }

  for (const candidate of options.startCandidates ?? []) {
    if (nodes.includes(candidate) && !used.has(candidate)) {
      starts.push(candidate);
      used.add(candidate);
    }
  }

  const random = createRandom(options.seed);
  const pool = nodes.filter((nodeId) => !used.has(nodeId));

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const left = pool[index];
    const right = pool[swapIndex];
    if (left !== undefined && right !== undefined) {
      pool[index] = right;
      pool[swapIndex] = left;
    }
  }

  const desiredCount = Math.max(
    1,
    Math.min(nodes.length, options.multiStartCount ?? Math.min(8, nodes.length)),
  );

  for (const nodeId of pool) {
    if (starts.length >= desiredCount) {
      break;
    }
    starts.push(nodeId);
  }

  if (starts.length === 0 && nodes.length > 0) {
    starts.push(nodes[0]!);
  }

  return starts;
}

function buildGreedyRoute<NodeId extends string>(
  start: NodeId,
  nodes: NodeId[],
  distanceMatrix: Map<NodeId, Map<NodeId, number>>,
  returnToStart: boolean,
): NodeId[] {
  const route: NodeId[] = [start];
  const unvisited = new Set(nodes.filter((nodeId) => nodeId !== start));
  let cursor = start;

  while (unvisited.size > 0) {
    let nextNode: NodeId | null = null;
    let nextDistance = Number.POSITIVE_INFINITY;

    const distances = distanceMatrix.get(cursor);
    for (const candidate of unvisited) {
      const candidateDistance = distances?.get(candidate) ?? Number.POSITIVE_INFINITY;
      if (candidateDistance < nextDistance) {
        nextDistance = candidateDistance;
        nextNode = candidate;
      }
    }

    if (!nextNode || !Number.isFinite(nextDistance)) {
      break;
    }

    route.push(nextNode);
    unvisited.delete(nextNode);
    cursor = nextNode;
  }

  if (returnToStart && route.length > 1) {
    route.push(start);
  }

  return route;
}

function computeMstLowerBound<NodeId extends string>(
  nodes: NodeId[],
  distanceMatrix: Map<NodeId, Map<NodeId, number>>,
): number {
  if (nodes.length <= 1) {
    return 0;
  }

  const visited = new Set<NodeId>();
  visited.add(nodes[0]!);
  let total = 0;

  while (visited.size < nodes.length) {
    let bestDistance = Number.POSITIVE_INFINITY;
    let nextNode: NodeId | null = null;

    for (const fromId of visited) {
      const distances = distanceMatrix.get(fromId);
      for (const toId of nodes) {
        if (visited.has(toId)) {
          continue;
        }

        const distance = distances?.get(toId) ?? Number.POSITIVE_INFINITY;
        if (distance < bestDistance) {
          bestDistance = distance;
          nextNode = toId;
        }
      }
    }

    if (!nextNode || !Number.isFinite(bestDistance)) {
      return Number.POSITIVE_INFINITY;
    }

    visited.add(nextNode);
    total += bestDistance;
  }

  return total;
}

export function buildGraphAdjacency<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: GraphBuildOptions = {},
): GraphAdjacency<NodeId> {
  const directed = options.directed ?? true;
  const nodeIds = dedupeNodeList(nodes, edges);
  const edgeMap = buildNormalizedEdgeMap(nodeIds, edges, directed);
  const neighborsByNode = toNeighborList(edgeMap);
  const incomingByNode = createIncomingByNode(nodeIds, neighborsByNode);

  return {
    nodes: nodeIds,
    neighborsByNode,
    incomingByNode,
    edges: toEdgeList(neighborsByNode),
    directed,
  };
}

export function stronglyConnectedComponents<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: StronglyConnectedComponentsOptions = {},
): StronglyConnectedComponentsResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  const components: NodeId[][] = [];

  if (!adjacency.directed) {
    const visited = new Set<NodeId>();

    for (const source of adjacency.nodes) {
      if (visited.has(source)) {
        continue;
      }

      const queue: NodeId[] = [source];
      visited.add(source);
      const component: NodeId[] = [];

      let cursor = 0;
      while (cursor < queue.length) {
        const nodeId = queue[cursor];
        cursor += 1;
        if (!nodeId) {
          continue;
        }

        component.push(nodeId);
        for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
          if (!visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            queue.push(neighbor.id);
          }
        }
      }

      component.sort(defaultTieBreaker);
      components.push(component);
    }
  } else {
    let index = 0;
    const indexByNode = new Map<NodeId, number>();
    const lowLinkByNode = new Map<NodeId, number>();
    const stack: NodeId[] = [];
    const inStack = new Set<NodeId>();

    const strongConnect = (nodeId: NodeId): void => {
      indexByNode.set(nodeId, index);
      lowLinkByNode.set(nodeId, index);
      index += 1;
      stack.push(nodeId);
      inStack.add(nodeId);

      for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
        if (!indexByNode.has(neighbor.id)) {
          strongConnect(neighbor.id);
          const currentLow = lowLinkByNode.get(nodeId) ?? 0;
          const neighborLow = lowLinkByNode.get(neighbor.id) ?? 0;
          lowLinkByNode.set(nodeId, Math.min(currentLow, neighborLow));
        } else if (inStack.has(neighbor.id)) {
          const currentLow = lowLinkByNode.get(nodeId) ?? 0;
          const neighborIndex = indexByNode.get(neighbor.id) ?? 0;
          lowLinkByNode.set(nodeId, Math.min(currentLow, neighborIndex));
        }
      }

      if ((lowLinkByNode.get(nodeId) ?? -1) === (indexByNode.get(nodeId) ?? -2)) {
        const component: NodeId[] = [];

        while (stack.length > 0) {
          const member = stack.pop();
          if (!member) {
            break;
          }
          inStack.delete(member);
          component.push(member);
          if (member === nodeId) {
            break;
          }
        }

        component.sort(defaultTieBreaker);
        components.push(component);
      }
    };

    for (const nodeId of adjacency.nodes) {
      if (!indexByNode.has(nodeId)) {
        strongConnect(nodeId);
      }
    }
  }

  components.sort((left, right) => {
    const firstLeft = left[0] ?? '';
    const firstRight = right[0] ?? '';
    return defaultTieBreaker(firstLeft, firstRight);
  });

  const componentByNode = new Map<NodeId, number>();
  for (let componentIndex = 0; componentIndex < components.length; componentIndex += 1) {
    for (const nodeId of components[componentIndex] ?? []) {
      componentByNode.set(nodeId, componentIndex);
    }
  }

  return {
    components,
    componentByNode,
  };
}

export function weaklyConnectedComponents<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
): WeaklyConnectedComponentsResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, { directed: false });
  const components: NodeId[][] = [];
  const componentByNode = new Map<NodeId, number>();
  const visited = new Set<NodeId>();

  for (const source of adjacency.nodes) {
    if (visited.has(source)) {
      continue;
    }

    const queue: NodeId[] = [source];
    visited.add(source);
    const component: NodeId[] = [];

    let cursor = 0;
    while (cursor < queue.length) {
      const nodeId = queue[cursor];
      cursor += 1;
      if (!nodeId) {
        continue;
      }

      component.push(nodeId);
      for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push(neighbor.id);
        }
      }
    }

    component.sort(defaultTieBreaker);
    const componentIndex = components.length;
    components.push(component);
    for (const nodeId of component) {
      componentByNode.set(nodeId, componentIndex);
    }
  }

  components.sort((left, right) => {
    const firstLeft = left[0] ?? '';
    const firstRight = right[0] ?? '';
    return defaultTieBreaker(firstLeft, firstRight);
  });

  componentByNode.clear();
  for (let componentIndex = 0; componentIndex < components.length; componentIndex += 1) {
    const component = components[componentIndex] ?? [];
    for (const nodeId of component) {
      componentByNode.set(nodeId, componentIndex);
    }
  }

  return {
    components,
    componentByNode,
  };
}

export function topologicalSort<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: TopologicalSortOptions<NodeId> = {},
): TopologicalSortResult<NodeId> {
  const nodeIds = dedupeNodeList(nodes, edges);
  const tieBreaker =
    options.tieBreaker ??
    ((left: NodeId, right: NodeId) => defaultTieBreaker(left, right));
  const priorityByNode = options.priorityByNode;
  const priorityAccessor =
    options.priority ??
    ((nodeId: NodeId) => {
      if (priorityByNode instanceof Map) {
        return priorityByNode.get(nodeId) ?? 0;
      }
      if (priorityByNode) {
        return priorityByNode[nodeId] ?? 0;
      }
      return 0;
    });
  const compareNodes = (left: NodeId, right: NodeId): number => {
    const priorityDelta = priorityAccessor(right) - priorityAccessor(left);
    if (Math.abs(priorityDelta) > 1e-12) {
      return priorityDelta;
    }
    return tieBreaker(left, right);
  };

  const outgoing = new Map<NodeId, Set<NodeId>>();
  const indegree = new Map<NodeId, number>();

  for (const nodeId of nodeIds) {
    outgoing.set(nodeId, new Set<NodeId>());
    indegree.set(nodeId, 0);
  }

  for (const edge of edges) {
    if (edge.from === edge.to) {
      continue;
    }
    if (!outgoing.has(edge.from) || !outgoing.has(edge.to)) {
      continue;
    }

    const targets = outgoing.get(edge.from);
    if (!targets || targets.has(edge.to)) {
      continue;
    }

    targets.add(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue = nodeIds
    .filter((nodeId) => (indegree.get(nodeId) ?? 0) === 0)
    .sort(compareNodes);

  const order: NodeId[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) {
      continue;
    }

    order.push(nodeId);
    const targets = Array.from(outgoing.get(nodeId) ?? []).sort(compareNodes);

    for (const targetId of targets) {
      const next = (indegree.get(targetId) ?? 0) - 1;
      indegree.set(targetId, next);
      if (next === 0) {
        queue.push(targetId);
      }
    }

    queue.sort(compareNodes);
  }

  const orderSet = new Set(order);
  const leftovers = nodeIds.filter((nodeId) => !orderSet.has(nodeId));
  leftovers.sort(compareNodes);

  const directedScc = stronglyConnectedComponents(nodeIds, edges, { directed: true });
  const selfLoopNodes = new Set<NodeId>(
    edges.filter((edge) => edge.from === edge.to).map((edge) => edge.from),
  );

  const cycleNodes = new Set<NodeId>();
  for (const component of directedScc.components) {
    if (component.length > 1) {
      for (const nodeId of component) {
        cycleNodes.add(nodeId);
      }
    } else if (component.length === 1) {
      const nodeId = component[0];
      if (nodeId && selfLoopNodes.has(nodeId)) {
        cycleNodes.add(nodeId);
      }
    }
  }

  for (const nodeId of leftovers) {
    cycleNodes.add(nodeId);
  }

  for (const nodeId of leftovers) {
    if (!orderSet.has(nodeId)) {
      order.push(nodeId);
      orderSet.add(nodeId);
    }
  }

  return {
    order,
    cycleNodes: Array.from(cycleNodes).sort(compareNodes),
    isDag: cycleNodes.size === 0,
  };
}

export function degreeCentrality<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: GraphBuildOptions = {},
): Map<NodeId, DegreeCentralityRecord> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  const total = adjacency.nodes.length;
  const denominator =
    total <= 1
      ? 1
      : adjacency.directed
        ? 2 * (total - 1)
        : Math.max(1, total - 1);

  const output = new Map<NodeId, DegreeCentralityRecord>();

  for (const nodeId of adjacency.nodes) {
    const outDegree = adjacency.neighborsByNode.get(nodeId)?.length ?? 0;
    const inDegree = adjacency.incomingByNode.get(nodeId)?.length ?? 0;
    const degree = adjacency.directed ? inDegree + outDegree : outDegree;

    output.set(nodeId, {
      inDegree,
      outDegree,
      degree,
      normalized: degree / denominator,
    });
  }

  return output;
}

export interface ClosenessCentralityOptions extends GraphBuildOptions {
  mode?: ClosenessCentralityMode;
  shortestPathAlgorithm?: ShortestPathAlgorithm;
}

export function closenessCentrality<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: ClosenessCentralityOptions = {},
): Map<NodeId, ClosenessCentralityRecord> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  const total = adjacency.nodes.length;
  const totalOthers = Math.max(0, total - 1);
  const mode: ClosenessCentralityMode = options.mode ?? 'harmonic';
  const output = new Map<NodeId, ClosenessCentralityRecord>();

  for (const source of adjacency.nodes) {
    const engine = runShortestPathEngine(
      adjacency,
      source,
      options.shortestPathAlgorithm ?? 'auto',
    );

    const distances = engine.result.distanceByNode;
    const negativeCycle = engine.result.negativeCycleNodes.size > 0;
    let reachableCount = 0;
    let distanceSum = 0;
    let harmonicSum = 0;

    for (const target of adjacency.nodes) {
      if (target === source) {
        continue;
      }

      const distance = distances.get(target);
      if (distance === undefined || !Number.isFinite(distance) || distance <= 0) {
        continue;
      }

      reachableCount += 1;
      distanceSum += distance;
      harmonicSum += 1 / distance;
    }

    let score = 0;
    let normalized = 0;

    if (!negativeCycle) {
      if (mode === 'classic') {
        score =
          reachableCount > 0 && distanceSum > 0
            ? reachableCount / distanceSum
            : 0;
        normalized = totalOthers > 0 ? score * (reachableCount / totalOthers) : 0;
      } else {
        score = harmonicSum;
        normalized = totalOthers > 0 ? harmonicSum / totalOthers : 0;
      }
    }

    output.set(source, {
      reachableCount,
      distanceSum,
      score,
      normalized,
      mode,
      negativeCycle,
    });
  }

  return output;
}

export function betweennessCentrality<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: GraphBuildOptions = {},
): Map<NodeId, BetweennessCentralityRecord> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'Betweenness centrality requires non-negative graph weights.',
    );
  }

  const output = new Map<NodeId, number>();
  for (const nodeId of adjacency.nodes) {
    output.set(nodeId, 0);
  }

  for (const source of adjacency.nodes) {
    const stack: NodeId[] = [];
    const predecessors = new Map<NodeId, NodeId[]>();
    const sigma = new Map<NodeId, number>();
    const distance = new Map<NodeId, number>();
    const queue = new MinPriorityQueue<NodeId>();
    const settled = new Set<NodeId>();

    for (const nodeId of adjacency.nodes) {
      predecessors.set(nodeId, []);
      sigma.set(nodeId, 0);
      distance.set(nodeId, Number.POSITIVE_INFINITY);
    }

    sigma.set(source, 1);
    distance.set(source, 0);
    queue.push(source, 0);

    while (queue.size > 0) {
      const item = queue.pop();
      if (!item) {
        break;
      }

      const nodeId = item.value;
      if (settled.has(nodeId)) {
        continue;
      }

      settled.add(nodeId);
      stack.push(nodeId);

      const distanceToNode = distance.get(nodeId);
      if (distanceToNode === undefined || !Number.isFinite(distanceToNode)) {
        continue;
      }

      const sigmaToNode = sigma.get(nodeId) ?? 0;

      for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
        const candidateDistance = distanceToNode + neighbor.weight;
        const knownDistance = distance.get(neighbor.id);

        if (
          knownDistance === undefined ||
          candidateDistance < knownDistance - 1e-12
        ) {
          distance.set(neighbor.id, candidateDistance);
          queue.push(neighbor.id, candidateDistance);
          sigma.set(neighbor.id, sigmaToNode);
          predecessors.set(neighbor.id, [nodeId]);
        } else if (
          knownDistance !== undefined &&
          Math.abs(candidateDistance - knownDistance) <= 1e-12
        ) {
          sigma.set(neighbor.id, (sigma.get(neighbor.id) ?? 0) + sigmaToNode);
          predecessors.get(neighbor.id)?.push(nodeId);
        }
      }
    }

    const dependency = new Map<NodeId, number>();
    for (const nodeId of adjacency.nodes) {
      dependency.set(nodeId, 0);
    }

    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (!nodeId) {
        continue;
      }

      const sigmaNode = sigma.get(nodeId) ?? 0;
      const dependencyNode = dependency.get(nodeId) ?? 0;

      for (const predecessor of predecessors.get(nodeId) ?? []) {
        const sigmaPredecessor = sigma.get(predecessor) ?? 0;
        if (sigmaNode <= 0) {
          continue;
        }

        const contribution =
          (sigmaPredecessor / sigmaNode) * (1 + dependencyNode);
        dependency.set(
          predecessor,
          (dependency.get(predecessor) ?? 0) + contribution,
        );
      }

      if (nodeId !== source) {
        output.set(nodeId, (output.get(nodeId) ?? 0) + dependencyNode);
      }
    }
  }

  if (!adjacency.directed) {
    for (const nodeId of adjacency.nodes) {
      output.set(nodeId, (output.get(nodeId) ?? 0) / 2);
    }
  }

  const total = adjacency.nodes.length;
  const normalization =
    total <= 2
      ? Number.POSITIVE_INFINITY
      : adjacency.directed
        ? (total - 1) * (total - 2)
        : ((total - 1) * (total - 2)) / 2;

  const records = new Map<NodeId, BetweennessCentralityRecord>();
  for (const nodeId of adjacency.nodes) {
    const raw = output.get(nodeId) ?? 0;
    records.set(nodeId, {
      raw,
      normalized:
        Number.isFinite(normalization) && normalization > 0
          ? raw / normalization
          : 0,
    });
  }

  return records;
}

export function pageRank<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: PageRankOptions = {},
): PageRankResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);

  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'PageRank requires non-negative graph weights.',
    );
  }

  const totalNodes = adjacency.nodes.length;
  if (totalNodes === 0) {
    return {
      byNode: new Map<NodeId, PageRankRecord>(),
      order: [],
      iterations: 0,
      converged: true,
      dampingFactor: options.dampingFactor ?? 0.85,
    };
  }

  const dampingFactor = options.dampingFactor ?? 0.85;
  if (
    !Number.isFinite(dampingFactor) ||
    dampingFactor < 0 ||
    dampingFactor >= 1
  ) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      `PageRank dampingFactor must be in [0, 1), received ${dampingFactor}.`,
    );
  }

  const tolerance = Math.max(0, options.tolerance ?? 1e-9);
  const maxIterations = Math.max(1, Math.floor(options.maxIterations ?? 200));
  const initialScore = 1 / totalNodes;

  const outgoingWeightSum = new Map<NodeId, number>();
  for (const nodeId of adjacency.nodes) {
    const totalWeight = (adjacency.neighborsByNode.get(nodeId) ?? []).reduce(
      (sum, neighbor) => sum + neighbor.weight,
      0,
    );
    outgoingWeightSum.set(nodeId, totalWeight);
  }

  let scores = new Map<NodeId, number>();
  for (const nodeId of adjacency.nodes) {
    scores.set(nodeId, initialScore);
  }

  let iterations = 0;
  let converged = false;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    iterations = iteration + 1;
    const next = new Map<NodeId, number>();
    const teleportMass = (1 - dampingFactor) / totalNodes;

    let sinkMass = 0;
    for (const nodeId of adjacency.nodes) {
      const outgoingWeight = outgoingWeightSum.get(nodeId) ?? 0;
      if (outgoingWeight <= 1e-12) {
        sinkMass += scores.get(nodeId) ?? 0;
      }
      next.set(nodeId, teleportMass);
    }

    const sinkContribution = (dampingFactor * sinkMass) / totalNodes;
    if (sinkContribution > 0) {
      for (const nodeId of adjacency.nodes) {
        next.set(nodeId, (next.get(nodeId) ?? 0) + sinkContribution);
      }
    }

    for (const nodeId of adjacency.nodes) {
      const outgoingWeight = outgoingWeightSum.get(nodeId) ?? 0;
      if (outgoingWeight <= 1e-12) {
        continue;
      }

      const score = scores.get(nodeId) ?? 0;
      for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
        const transfer = (dampingFactor * score * neighbor.weight) / outgoingWeight;
        next.set(neighbor.id, (next.get(neighbor.id) ?? 0) + transfer);
      }
    }

    let delta = 0;
    for (const nodeId of adjacency.nodes) {
      const previous = scores.get(nodeId) ?? 0;
      const current = next.get(nodeId) ?? 0;
      delta += Math.abs(previous - current);
    }

    scores = next;
    if (delta <= tolerance) {
      converged = true;
      break;
    }
  }

  let scoreSum = 0;
  for (const nodeId of adjacency.nodes) {
    scoreSum += scores.get(nodeId) ?? 0;
  }

  if (!Number.isFinite(scoreSum) || scoreSum <= 0) {
    scores = new Map<NodeId, number>();
    for (const nodeId of adjacency.nodes) {
      scores.set(nodeId, initialScore);
    }
    scoreSum = 1;
  } else if (Math.abs(scoreSum - 1) > 1e-12) {
    for (const nodeId of adjacency.nodes) {
      scores.set(nodeId, (scores.get(nodeId) ?? 0) / scoreSum);
    }
  }

  const order = [...adjacency.nodes].sort((left, right) => {
    const scoreDelta = (scores.get(right) ?? 0) - (scores.get(left) ?? 0);
    if (Math.abs(scoreDelta) > 1e-12) {
      return scoreDelta;
    }
    return defaultTieBreaker(left, right);
  });

  const maxScore = order.length > 0 ? (scores.get(order[0]!) ?? 0) : 0;
  const byNode = new Map<NodeId, PageRankRecord>();
  for (let index = 0; index < order.length; index += 1) {
    const nodeId = order[index];
    if (!nodeId) {
      continue;
    }
    const score = scores.get(nodeId) ?? 0;
    byNode.set(nodeId, {
      score,
      normalized: maxScore > 0 ? score / maxScore : 0,
      rank: index + 1,
    });
  }

  return {
    byNode,
    order,
    iterations,
    converged,
    dampingFactor,
  };
}

export function minimumSpanningTree<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: MinimumSpanningTreeOptions<NodeId> = {},
): MinimumSpanningTreeResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, { directed: false });
  const tieBreaker =
    options.tieBreaker ??
    ((left: NodeId, right: NodeId) => defaultTieBreaker(left, right));
  const candidateByKey = new Map<string, Required<GraphEdge<NodeId>>>();

  for (const edge of adjacency.edges) {
    if (edge.from === edge.to) {
      continue;
    }
    const canonical = canonicalUndirectedEdge(edge.from, edge.to);
    const key = undirectedEdgeKey(canonical.from, canonical.to);
    const existing = candidateByKey.get(key);
    if (!existing || edge.weight < existing.weight - 1e-12) {
      candidateByKey.set(key, {
        from: canonical.from,
        to: canonical.to,
        weight: edge.weight,
      });
    }
  }

  const candidates = Array.from(candidateByKey.values());
  candidates.sort((left, right) => {
    const weightDelta = left.weight - right.weight;
    if (Math.abs(weightDelta) > 1e-12) {
      return weightDelta;
    }

    const fromDelta = tieBreaker(left.from, right.from);
    if (fromDelta !== 0) {
      return fromDelta;
    }
    return tieBreaker(left.to, right.to);
  });

  const disjointSet = new DisjointSet(adjacency.nodes);
  const selected: Array<Required<GraphEdge<NodeId>>> = [];
  let totalWeight = 0;

  for (const edge of candidates) {
    if (disjointSet.union(edge.from, edge.to)) {
      selected.push(edge);
      totalWeight += edge.weight;
    }
  }

  const roots = new Set<NodeId>();
  for (const nodeId of adjacency.nodes) {
    roots.add(disjointSet.find(nodeId));
  }
  const componentCount = roots.size;

  return {
    edges: selected,
    totalWeight,
    componentCount,
    spanning:
      adjacency.nodes.length <= 1 ||
      (componentCount === 1 && selected.length === adjacency.nodes.length - 1),
  };
}

export function articulationPointsAndBridges<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
): ArticulationBridgeResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, { directed: false });
  const discoveredAt = new Map<NodeId, number>();
  const lowLink = new Map<NodeId, number>();
  const parentByNode = new Map<NodeId, NodeId | null>();
  const articulationPoints = new Set<NodeId>();
  const bridgeByKey = new Map<string, Required<GraphEdge<NodeId>>>();

  let discoveryCounter = 0;

  const visit = (nodeId: NodeId): void => {
    discoveredAt.set(nodeId, discoveryCounter);
    lowLink.set(nodeId, discoveryCounter);
    discoveryCounter += 1;

    let childCount = 0;
    const parent = parentByNode.get(nodeId) ?? null;

    for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
      const discoveredNeighbor = discoveredAt.get(neighbor.id);
      if (discoveredNeighbor === undefined) {
        parentByNode.set(neighbor.id, nodeId);
        childCount += 1;
        visit(neighbor.id);

        const lowNode = lowLink.get(nodeId) ?? 0;
        const lowNeighbor = lowLink.get(neighbor.id) ?? 0;
        lowLink.set(nodeId, Math.min(lowNode, lowNeighbor));

        const discoveredNode = discoveredAt.get(nodeId) ?? 0;
        if (parent === null && childCount > 1) {
          articulationPoints.add(nodeId);
        }
        if (parent !== null && lowNeighbor >= discoveredNode) {
          articulationPoints.add(nodeId);
        }
        if (lowNeighbor > discoveredNode) {
          const canonical = canonicalUndirectedEdge(nodeId, neighbor.id);
          const key = undirectedEdgeKey(canonical.from, canonical.to);
          const existing = bridgeByKey.get(key);
          if (!existing || neighbor.weight < existing.weight - 1e-12) {
            bridgeByKey.set(key, {
              from: canonical.from,
              to: canonical.to,
              weight: neighbor.weight,
            });
          }
        }
      } else if (neighbor.id !== parent) {
        const lowNode = lowLink.get(nodeId) ?? 0;
        lowLink.set(nodeId, Math.min(lowNode, discoveredNeighbor));
      }
    }
  };

  for (const nodeId of adjacency.nodes) {
    if (!discoveredAt.has(nodeId)) {
      parentByNode.set(nodeId, null);
      visit(nodeId);
    }
  }

  const bridges = Array.from(bridgeByKey.values());
  bridges.sort((left, right) => {
    const fromDelta = defaultTieBreaker(left.from, right.from);
    if (fromDelta !== 0) {
      return fromDelta;
    }

    const toDelta = defaultTieBreaker(left.to, right.to);
    if (toDelta !== 0) {
      return toDelta;
    }

    return left.weight - right.weight;
  });

  return {
    articulationPoints: Array.from(articulationPoints).sort(defaultTieBreaker),
    bridges,
  };
}

export function analyzeGraph<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: GraphAnalysisOptions = {},
): GraphAnalysisResult<NodeId> {
  const scc = stronglyConnectedComponents(nodes, edges, options);
  const weak = weaklyConnectedComponents(nodes, edges);
  const articulation = articulationPointsAndBridges(nodes, edges);
  const dedupedNodes = dedupeNodeList(nodes, edges);
  const orderedNodeIds = [...dedupedNodes].sort(defaultTieBreaker);
  let betweennessByNode = new Map<NodeId, BetweennessCentralityRecord>();
  let pageRankByNode = new Map<NodeId, PageRankRecord>();

  try {
    betweennessByNode = betweennessCentrality(nodes, edges, options);
  } catch (error) {
    if (
      !(error instanceof GraphAlgorithmError) ||
      error.code !== 'NEGATIVE_WEIGHT'
    ) {
      throw error;
    }

    betweennessByNode = new Map<NodeId, BetweennessCentralityRecord>();
    for (const nodeId of orderedNodeIds) {
      betweennessByNode.set(nodeId, {
        raw: 0,
        normalized: 0,
      });
    }
  }

  try {
    const pageRankResult = pageRank(nodes, edges, {
      directed: options.directed ?? true,
      ...(options.pageRankOptions ?? {}),
    });
    pageRankByNode = pageRankResult.byNode;
  } catch (error) {
    if (
      !(error instanceof GraphAlgorithmError) ||
      error.code !== 'NEGATIVE_WEIGHT'
    ) {
      throw error;
    }

    const defaultScore = dedupedNodes.length > 0 ? 1 / dedupedNodes.length : 0;
    pageRankByNode = new Map<NodeId, PageRankRecord>();
    for (let index = 0; index < orderedNodeIds.length; index += 1) {
      const nodeId = orderedNodeIds[index];
      if (!nodeId) {
        continue;
      }
      pageRankByNode.set(nodeId, {
        score: defaultScore,
        normalized: 1,
        rank: index + 1,
      });
    }
  }

  return {
    degree: degreeCentrality(nodes, edges, options),
    closeness: closenessCentrality(nodes, edges, {
      ...options,
      mode: options.closenessMode ?? 'harmonic',
      shortestPathAlgorithm: options.shortestPathAlgorithm,
    }),
    betweenness: betweennessByNode,
    pageRank: pageRankByNode,
    stronglyConnectedComponents: scc.components,
    weaklyConnectedComponents: weak.components,
    articulationPoints: articulation.articulationPoints,
    bridges: articulation.bridges,
  };
}

export function shortestPath<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  source: NodeId,
  target: NodeId,
  options: ShortestPathOptions = {},
): ShortestPathResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  if (
    !adjacency.neighborsByNode.has(source) ||
    !adjacency.neighborsByNode.has(target)
  ) {
    return {
      source,
      target,
      path: [],
      distance: Number.POSITIVE_INFINITY,
      reachable: false,
      explored: 0,
      algorithm: options.algorithm ?? 'auto',
      hasNegativeWeights: hasNegativeWeights(adjacency),
      negativeCycle: false,
    };
  }

  const engine = runShortestPathEngine(
    adjacency,
    source,
    options.algorithm ?? 'auto',
  );

  if (engine.result.negativeCycleNodes.has(target)) {
    if (options.failOnNegativeCycle ?? false) {
      throw new GraphAlgorithmError(
        'NEGATIVE_CYCLE',
        `Negative cycle reaches target node "${target}".`,
      );
    }

    return {
      source,
      target,
      path: [],
      distance: Number.NEGATIVE_INFINITY,
      reachable: false,
      explored: engine.result.explored,
      algorithm: engine.algorithm,
      hasNegativeWeights: engine.hasNegativeWeights,
      negativeCycle: true,
    };
  }

  const distance =
    engine.result.distanceByNode.get(target) ?? Number.POSITIVE_INFINITY;
  const reachable = Number.isFinite(distance);

  const path = reachable
    ? reconstructPath(source, target, engine.result.previousByNode)
    : [];

  return {
    source,
    target,
    path,
    distance,
    reachable: reachable && path.length > 0,
    explored: engine.result.explored,
    algorithm: engine.algorithm,
    hasNegativeWeights: engine.hasNegativeWeights,
    negativeCycle: engine.result.negativeCycleNodes.size > 0,
  };
}

export function labelPropagationCommunities<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: LabelPropagationOptions<NodeId> = {},
): CommunityDetectionResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, {
    directed: options.directed ?? false,
  });
  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'Label propagation requires non-negative graph weights.',
    );
  }

  const tieBreaker =
    options.tieBreaker ??
    ((left: NodeId, right: NodeId) => defaultTieBreaker(left, right));
  const nodeOrder = [...adjacency.nodes].sort(tieBreaker);
  const labelByNode = new Map<NodeId, number>();
  for (let index = 0; index < nodeOrder.length; index += 1) {
    const nodeId = nodeOrder[index];
    if (nodeId) {
      labelByNode.set(nodeId, index);
    }
  }

  const maxIterations = Math.max(1, options.maxIterations ?? 100);
  let iterations = 0;
  let converged = false;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    iterations = iteration + 1;
    let changed = false;

    for (const nodeId of nodeOrder) {
      const neighbors = adjacency.neighborsByNode.get(nodeId) ?? [];
      if (neighbors.length === 0) {
        continue;
      }

      const scoreByLabel = new Map<number, number>();
      for (const neighbor of neighbors) {
        const neighborLabel = labelByNode.get(neighbor.id);
        if (neighborLabel === undefined) {
          continue;
        }
        scoreByLabel.set(
          neighborLabel,
          (scoreByLabel.get(neighborLabel) ?? 0) + neighbor.weight,
        );
      }

      const currentLabel = labelByNode.get(nodeId);
      if (currentLabel === undefined || scoreByLabel.size === 0) {
        continue;
      }

      let bestLabel = currentLabel;
      let bestScore = Number.NEGATIVE_INFINITY;

      for (const [candidateLabel, score] of scoreByLabel.entries()) {
        if (score > bestScore + 1e-12) {
          bestScore = score;
          bestLabel = candidateLabel;
          continue;
        }
        if (Math.abs(score - bestScore) <= 1e-12 && candidateLabel < bestLabel) {
          bestLabel = candidateLabel;
        }
      }

      if (bestLabel !== currentLabel) {
        labelByNode.set(nodeId, bestLabel);
        changed = true;
      }
    }

    if (!changed) {
      converged = true;
      break;
    }
  }

  return buildCommunityResult(
    adjacency,
    labelByNode,
    iterations,
    converged,
    'label-propagation',
  );
}

export function louvainCommunities<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: LouvainOptions<NodeId> = {},
): CommunityDetectionResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, {
    directed: options.directed ?? false,
  });

  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'Louvain requires non-negative graph weights.',
    );
  }

  const tieBreaker =
    options.tieBreaker ??
    ((left: NodeId, right: NodeId) => defaultTieBreaker(left, right));
  const nodeOrder = [...adjacency.nodes].sort(tieBreaker);
  const maxPasses = Math.max(1, options.maxPasses ?? 32);
  const tolerance = Math.max(0, options.tolerance ?? 1e-9);

  const degreeByNode = new Map<NodeId, number>();
  for (const nodeId of adjacency.nodes) {
    degreeByNode.set(
      nodeId,
      sumNeighborWeights(adjacency.neighborsByNode.get(nodeId) ?? []),
    );
  }

  let totalDegree = 0;
  for (const degree of degreeByNode.values()) {
    totalDegree += degree;
  }

  const labelByNode = new Map<NodeId, number>();
  const communityWeight = new Map<number, number>();
  for (let index = 0; index < nodeOrder.length; index += 1) {
    const nodeId = nodeOrder[index];
    if (!nodeId) {
      continue;
    }
    labelByNode.set(nodeId, index);
    const degree = degreeByNode.get(nodeId) ?? 0;
    communityWeight.set(index, degree);
  }

  if (totalDegree <= 1e-12) {
    return buildCommunityResult(adjacency, labelByNode, 0, true, 'louvain');
  }

  let iterations = 0;
  let converged = false;

  for (let pass = 0; pass < maxPasses; pass += 1) {
    iterations = pass + 1;
    let changed = false;

    for (const nodeId of nodeOrder) {
      const currentLabel = labelByNode.get(nodeId);
      if (currentLabel === undefined) {
        continue;
      }

      const nodeDegree = degreeByNode.get(nodeId) ?? 0;
      communityWeight.set(
        currentLabel,
        (communityWeight.get(currentLabel) ?? 0) - nodeDegree,
      );

      const edgeWeightByCommunity = new Map<number, number>();
      for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
        const candidateLabel = labelByNode.get(neighbor.id);
        if (candidateLabel === undefined) {
          continue;
        }

        edgeWeightByCommunity.set(
          candidateLabel,
          (edgeWeightByCommunity.get(candidateLabel) ?? 0) + neighbor.weight,
        );
      }

      let bestLabel = currentLabel;
      let bestGain = 0;

      for (const [candidateLabel, edgeWeight] of edgeWeightByCommunity.entries()) {
        const candidateWeight = communityWeight.get(candidateLabel) ?? 0;
        const gain = edgeWeight - (candidateWeight * nodeDegree) / totalDegree;

        if (gain > bestGain + tolerance) {
          bestGain = gain;
          bestLabel = candidateLabel;
          continue;
        }

        if (
          Math.abs(gain - bestGain) <= tolerance &&
          candidateLabel < bestLabel
        ) {
          bestLabel = candidateLabel;
        }
      }

      if (bestLabel !== currentLabel && bestGain > tolerance) {
        labelByNode.set(nodeId, bestLabel);
        communityWeight.set(
          bestLabel,
          (communityWeight.get(bestLabel) ?? 0) + nodeDegree,
        );
        changed = true;
      } else {
        communityWeight.set(
          currentLabel,
          (communityWeight.get(currentLabel) ?? 0) + nodeDegree,
        );
      }
    }

    if (!changed) {
      converged = true;
      break;
    }
  }

  return buildCommunityResult(
    adjacency,
    labelByNode,
    iterations,
    converged,
    'louvain',
  );
}

export function nodeSimilarity<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: SimilarityOptions = {},
): NodeSimilarityResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, {
    directed: options.directed ?? false,
  });
  const metric = options.metric ?? 'jaccard';
  const minScore = options.minScore ?? 0;
  const neighborSets = buildNeighborIdSetMap(adjacency);
  const orderedNodes = [...adjacency.nodes].sort(defaultTieBreaker);
  const pairs: Array<Omit<NodeSimilarityRecord<NodeId>, 'rank'>> = [];

  for (let leftIndex = 0; leftIndex < orderedNodes.length; leftIndex += 1) {
    const leftId = orderedNodes[leftIndex];
    if (!leftId) {
      continue;
    }
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < orderedNodes.length;
      rightIndex += 1
    ) {
      const rightId = orderedNodes[rightIndex];
      if (!rightId) {
        continue;
      }
      const score = computeSimilarityScore(leftId, rightId, neighborSets, metric);
      if (score < minScore - 1e-12) {
        continue;
      }
      pairs.push({
        left: leftId,
        right: rightId,
        score,
        metric,
      });
    }
  }

  pairs.sort((left, right) => {
    const scoreDelta = right.score - left.score;
    if (Math.abs(scoreDelta) > 1e-12) {
      return scoreDelta;
    }
    const leftDelta = defaultTieBreaker(left.left, right.left);
    if (leftDelta !== 0) {
      return leftDelta;
    }
    return defaultTieBreaker(left.right, right.right);
  });

  return {
    metric,
    pairs: pairs.map((pair, index) => ({
      ...pair,
      rank: index + 1,
    })),
  };
}

export function kNearestNeighbors<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: KNearestNeighborsOptions = {},
): KNearestNeighborsResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, {
    directed: options.directed ?? false,
  });
  const metric = options.metric ?? 'jaccard';
  const minScore = options.minScore ?? 0;
  const k = Math.max(1, Math.floor(options.k ?? 5));
  const neighborSets = buildNeighborIdSetMap(adjacency);
  const orderedNodes = [...adjacency.nodes].sort(defaultTieBreaker);
  const neighborsByNode = new Map<NodeId, KNearestNeighbor<NodeId>[]>();

  for (const nodeId of orderedNodes) {
    const candidates: KNearestNeighbor<NodeId>[] = [];
    for (const otherId of orderedNodes) {
      if (nodeId === otherId) {
        continue;
      }
      const score = computeSimilarityScore(nodeId, otherId, neighborSets, metric);
      if (score < minScore - 1e-12) {
        continue;
      }
      candidates.push({
        nodeId: otherId,
        score,
      });
    }

    candidates.sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (Math.abs(scoreDelta) > 1e-12) {
        return scoreDelta;
      }
      return defaultTieBreaker(left.nodeId, right.nodeId);
    });

    neighborsByNode.set(nodeId, candidates.slice(0, k));
  }

  return {
    metric,
    k,
    neighborsByNode,
  };
}

export function predictLinks<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: LinkPredictionOptions<NodeId> = {},
): LinkPredictionResult<NodeId> {
  const directed = options.directed ?? false;
  const adjacency = buildGraphAdjacency(nodes, edges, { directed });
  const metric = options.metric ?? 'jaccard';
  const minScore = options.minScore ?? 0;
  const limit = Math.max(1, Math.floor(options.limit ?? 20));
  const allowExistingEdges = options.allowExistingEdges ?? false;
  const neighborSets = buildNeighborIdSetMap(adjacency);
  const orderedNodes = [...adjacency.nodes].sort(defaultTieBreaker);
  const sourceFilterSet = options.sourceFilter
    ? new Set(options.sourceFilter)
    : null;
  const targetFilterSet = options.targetFilter
    ? new Set(options.targetFilter)
    : null;
  const existingEdgeKeys = new Set<string>();

  for (const edge of adjacency.edges) {
    if (directed) {
      existingEdgeKeys.add(`${edge.from}\u0000${edge.to}`);
    } else {
      existingEdgeKeys.add(undirectedEdgeKey(edge.from, edge.to));
    }
  }

  const predictions: Array<Omit<LinkPredictionRecord<NodeId>, 'rank'>> = [];

  if (directed) {
    for (const fromId of orderedNodes) {
      if (sourceFilterSet && !sourceFilterSet.has(fromId)) {
        continue;
      }
      for (const toId of orderedNodes) {
        if (fromId === toId) {
          continue;
        }
        if (targetFilterSet && !targetFilterSet.has(toId)) {
          continue;
        }
        if (
          !allowExistingEdges &&
          existingEdgeKeys.has(`${fromId}\u0000${toId}`)
        ) {
          continue;
        }

        const score = computeSimilarityScore(fromId, toId, neighborSets, metric);
        if (score < minScore - 1e-12) {
          continue;
        }
        predictions.push({
          from: fromId,
          to: toId,
          score,
          metric,
        });
      }
    }
  } else {
    for (let leftIndex = 0; leftIndex < orderedNodes.length; leftIndex += 1) {
      const fromId = orderedNodes[leftIndex];
      if (!fromId) {
        continue;
      }
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < orderedNodes.length;
        rightIndex += 1
      ) {
        const toId = orderedNodes[rightIndex];
        if (!toId) {
          continue;
        }

        if (
          sourceFilterSet &&
          !sourceFilterSet.has(fromId) &&
          !sourceFilterSet.has(toId)
        ) {
          continue;
        }
        if (
          targetFilterSet &&
          !targetFilterSet.has(fromId) &&
          !targetFilterSet.has(toId)
        ) {
          continue;
        }
        if (
          !allowExistingEdges &&
          existingEdgeKeys.has(undirectedEdgeKey(fromId, toId))
        ) {
          continue;
        }

        const score = computeSimilarityScore(fromId, toId, neighborSets, metric);
        if (score < minScore - 1e-12) {
          continue;
        }
        predictions.push({
          from: fromId,
          to: toId,
          score,
          metric,
        });
      }
    }
  }

  predictions.sort((left, right) => {
    const scoreDelta = right.score - left.score;
    if (Math.abs(scoreDelta) > 1e-12) {
      return scoreDelta;
    }
    const fromDelta = defaultTieBreaker(left.from, right.from);
    if (fromDelta !== 0) {
      return fromDelta;
    }
    return defaultTieBreaker(left.to, right.to);
  });

  return {
    metric,
    predictions: predictions.slice(0, limit).map((prediction, index) => ({
      ...prediction,
      rank: index + 1,
    })),
  };
}

export function linkPrediction<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: LinkPredictionOptions<NodeId> = {},
): LinkPredictionResult<NodeId> {
  return predictLinks(nodes, edges, options);
}

export function aStarShortestPath<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  source: NodeId,
  target: NodeId,
  options: AStarOptions<NodeId> = {},
): AStarResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'A* requires non-negative graph weights.',
    );
  }

  if (
    !adjacency.neighborsByNode.has(source) ||
    !adjacency.neighborsByNode.has(target)
  ) {
    return {
      source,
      target,
      path: [],
      distance: Number.POSITIVE_INFINITY,
      reachable: false,
      explored: 0,
      estimatedDistance: Number.POSITIVE_INFINITY,
    };
  }

  const heuristic =
    options.heuristic ??
    ((_nodeId: NodeId, _targetId: NodeId): number => 0);

  const queue = new MinPriorityQueue<NodeId>();
  const gScore = new Map<NodeId, number>();
  const previousByNode = new Map<NodeId, NodeId>();
  const closedSet = new Set<NodeId>();

  for (const nodeId of adjacency.nodes) {
    gScore.set(nodeId, Number.POSITIVE_INFINITY);
  }

  gScore.set(source, 0);
  const startHeuristic = heuristic(source, target);
  if (!Number.isFinite(startHeuristic)) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'A* heuristic must return finite values.',
    );
  }
  queue.push(source, startHeuristic);

  let explored = 0;

  while (queue.size > 0) {
    const item = queue.pop();
    if (!item) {
      break;
    }

    const nodeId = item.value;
    if (closedSet.has(nodeId)) {
      continue;
    }
    closedSet.add(nodeId);
    explored += 1;

    if (nodeId === target) {
      break;
    }

    const currentDistance = gScore.get(nodeId);
    if (currentDistance === undefined || !Number.isFinite(currentDistance)) {
      continue;
    }

    for (const neighbor of adjacency.neighborsByNode.get(nodeId) ?? []) {
      const candidate = currentDistance + neighbor.weight;
      const known = gScore.get(neighbor.id) ?? Number.POSITIVE_INFINITY;
      if (candidate >= known - 1e-12) {
        continue;
      }

      const estimate = heuristic(neighbor.id, target);
      if (!Number.isFinite(estimate)) {
        throw new GraphAlgorithmError(
          'INVALID_ARGUMENT',
          'A* heuristic must return finite values.',
        );
      }

      gScore.set(neighbor.id, candidate);
      previousByNode.set(neighbor.id, nodeId);
      queue.push(neighbor.id, candidate + estimate);
    }
  }

  const distance = gScore.get(target) ?? Number.POSITIVE_INFINITY;
  const reachable = Number.isFinite(distance);
  const path = reachable ? reconstructPath(source, target, previousByNode) : [];

  return {
    source,
    target,
    path,
    distance,
    reachable: reachable && path.length > 0,
    explored,
    estimatedDistance: distance,
  };
}

export function allPairsShortestPaths<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: AllPairsShortestPathsOptions = {},
): AllPairsShortestPathsResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  const requestedAlgorithm = options.algorithm ?? 'auto';
  const chosenAlgorithm = chooseShortestPathAlgorithm(
    requestedAlgorithm,
    hasNegativeWeights(adjacency),
  );

  const distanceBySource = new Map<NodeId, Map<NodeId, number>>();
  const previousBySource = new Map<NodeId, Map<NodeId, NodeId>>();
  let negativeCycle = false;

  for (const source of adjacency.nodes) {
    const engine = runShortestPathEngine(adjacency, source, chosenAlgorithm);
    if (engine.result.negativeCycleNodes.size > 0) {
      negativeCycle = true;
      if (options.failOnNegativeCycle ?? false) {
        throw new GraphAlgorithmError(
          'NEGATIVE_CYCLE',
          `Negative cycle reaches source node "${source}".`,
        );
      }
    }

    const distance = new Map<NodeId, number>();
    const previous = new Map<NodeId, NodeId>();
    for (const nodeId of adjacency.nodes) {
      distance.set(
        nodeId,
        engine.result.distanceByNode.get(nodeId) ?? Number.POSITIVE_INFINITY,
      );
      const prev = engine.result.previousByNode.get(nodeId);
      if (prev) {
        previous.set(nodeId, prev);
      }
    }

    distanceBySource.set(source, distance);
    previousBySource.set(source, previous);
  }

  return {
    nodes: adjacency.nodes,
    distanceBySource,
    previousBySource,
    algorithm: chosenAlgorithm,
    hasNegativeWeights: hasNegativeWeights(adjacency),
    negativeCycle,
  };
}

export function yenKShortestPaths<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  source: NodeId,
  target: NodeId,
  options: YenKShortestPathsOptions = {},
): YenKShortestPathsResult<NodeId> {
  const directed = options.directed ?? true;
  const k = Math.max(1, Math.floor(options.k ?? 3));
  const shortestPathAlgorithm = options.shortestPathAlgorithm ?? 'auto';
  const adjacency = buildGraphAdjacency(nodes, edges, { directed });

  if (
    !adjacency.neighborsByNode.has(source) ||
    !adjacency.neighborsByNode.has(target)
  ) {
    return {
      source,
      target,
      paths: [],
      complete: false,
    };
  }

  const first = shortestPath(adjacency.nodes, adjacency.edges, source, target, {
    directed,
    algorithm: shortestPathAlgorithm,
  });
  if (!first.reachable || first.path.length === 0) {
    return {
      source,
      target,
      paths: [],
      complete: false,
    };
  }

  const accepted: PathRecord<NodeId>[] = [
    {
      path: first.path,
      distance: first.distance,
    },
  ];
  const candidates = new Map<string, PathRecord<NodeId>>();

  for (let pathIndex = 1; pathIndex < k; pathIndex += 1) {
    const previous = accepted[pathIndex - 1]?.path ?? [];
    if (previous.length < 2) {
      break;
    }

    for (let spurIndex = 0; spurIndex < previous.length - 1; spurIndex += 1) {
      const spurNode = previous[spurIndex];
      if (!spurNode) {
        continue;
      }

      const rootPath = previous.slice(0, spurIndex + 1);
      const rootNodeExclusion = new Set(rootPath.slice(0, -1));
      const removedEdgeKeys = new Set<string>();

      for (const pathRecord of accepted) {
        if (
          pathRecord.path.length > spurIndex + 1 &&
          hasSamePrefix(pathRecord.path, rootPath)
        ) {
          const fromId = pathRecord.path[spurIndex];
          const toId = pathRecord.path[spurIndex + 1];
          if (fromId && toId) {
            removedEdgeKeys.add(`${fromId}\u0000${toId}`);
          }
        }
      }

      const filteredEdges = adjacency.edges.filter((edge) => {
        if (removedEdgeKeys.has(`${edge.from}\u0000${edge.to}`)) {
          return false;
        }
        if (rootNodeExclusion.has(edge.from) || rootNodeExclusion.has(edge.to)) {
          return false;
        }
        return true;
      });

      const spurPath = shortestPath(
        adjacency.nodes,
        filteredEdges,
        spurNode,
        target,
        {
          directed,
          algorithm: shortestPathAlgorithm,
        },
      );

      if (!spurPath.reachable || spurPath.path.length === 0) {
        continue;
      }

      const totalPath = rootPath.slice(0, -1).concat(spurPath.path);
      const totalDistance = routeDistanceForPath(totalPath, adjacency);
      if (!Number.isFinite(totalDistance)) {
        continue;
      }

      const key = pathKey(totalPath);
      if (!candidates.has(key)) {
        candidates.set(key, {
          path: totalPath,
          distance: totalDistance,
        });
      }
    }

    if (candidates.size === 0) {
      break;
    }

    const next = Array.from(candidates.values()).sort((left, right) => {
      const distanceDelta = left.distance - right.distance;
      if (Math.abs(distanceDelta) > 1e-12) {
        return distanceDelta;
      }
      return defaultTieBreaker(pathKey(left.path), pathKey(right.path));
    })[0];

    if (!next) {
      break;
    }

    accepted.push(next);
    candidates.delete(pathKey(next.path));
  }

  return {
    source,
    target,
    paths: accepted,
    complete: accepted.length >= k,
  };
}

export function maximumFlow<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  source: NodeId,
  sink: NodeId,
  options: MaximumFlowOptions = {},
): MaximumFlowResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);
  if (
    !adjacency.neighborsByNode.has(source) ||
    !adjacency.neighborsByNode.has(sink)
  ) {
    return {
      source,
      sink,
      maxFlow: 0,
      augmentations: 0,
      flowByEdge: [],
      sourcePartition: [],
      sinkPartition: [],
      cutEdges: [],
    };
  }

  const originalEdges: Array<Required<GraphEdge<NodeId>>> = [];
  for (const edge of adjacency.edges) {
    if (edge.weight < 0) {
      throw new GraphAlgorithmError(
        'NEGATIVE_WEIGHT',
        'Maximum flow requires non-negative capacities.',
      );
    }
    originalEdges.push(edge);
  }

  interface ResidualEdge {
    to: NodeId;
    reverseIndex: number;
    capacity: number;
    originalIndex: number | null;
  }

  const residual = new Map<NodeId, ResidualEdge[]>();
  for (const nodeId of adjacency.nodes) {
    residual.set(nodeId, []);
  }

  const addResidualEdge = (
    from: NodeId,
    to: NodeId,
    capacity: number,
    originalIndex: number,
  ): void => {
    const fromEdges = residual.get(from);
    const toEdges = residual.get(to);
    if (!fromEdges || !toEdges) {
      return;
    }

    const forwardIndex = fromEdges.length;
    const reverseIndex = toEdges.length;
    fromEdges.push({
      to,
      reverseIndex,
      capacity,
      originalIndex,
    });
    toEdges.push({
      to: from,
      reverseIndex: forwardIndex,
      capacity: 0,
      originalIndex: null,
    });
  };

  for (let index = 0; index < originalEdges.length; index += 1) {
    const edge = originalEdges[index];
    if (!edge) {
      continue;
    }
    addResidualEdge(edge.from, edge.to, edge.weight, index);
  }

  let maxFlow = 0;
  let augmentations = 0;
  const flowByOriginal = new Array<number>(originalEdges.length).fill(0);

  while (true) {
    const parent = new Map<NodeId, { from: NodeId; edgeIndex: number }>();
    const queue: NodeId[] = [source];
    parent.set(source, { from: source, edgeIndex: -1 });

    let queueIndex = 0;
    while (queueIndex < queue.length && !parent.has(sink)) {
      const nodeId = queue[queueIndex];
      queueIndex += 1;
      if (!nodeId) {
        continue;
      }

      const edgesFromNode = residual.get(nodeId) ?? [];
      for (let edgeIndex = 0; edgeIndex < edgesFromNode.length; edgeIndex += 1) {
        const edge = edgesFromNode[edgeIndex];
        if (!edge || edge.capacity <= 1e-12) {
          continue;
        }
        if (parent.has(edge.to)) {
          continue;
        }

        parent.set(edge.to, { from: nodeId, edgeIndex });
        queue.push(edge.to);
      }
    }

    if (!parent.has(sink)) {
      break;
    }

    let bottleneck = Number.POSITIVE_INFINITY;
    let cursor: NodeId = sink;

    while (cursor !== source) {
      const parentEntry = parent.get(cursor);
      if (!parentEntry) {
        bottleneck = 0;
        break;
      }
      const edge = residual.get(parentEntry.from)?.[parentEntry.edgeIndex];
      if (!edge) {
        bottleneck = 0;
        break;
      }
      bottleneck = Math.min(bottleneck, edge.capacity);
      cursor = parentEntry.from;
    }

    if (!Number.isFinite(bottleneck) || bottleneck <= 1e-12) {
      break;
    }

    cursor = sink;
    while (cursor !== source) {
      const parentEntry = parent.get(cursor);
      if (!parentEntry) {
        break;
      }
      const edge = residual.get(parentEntry.from)?.[parentEntry.edgeIndex];
      const reverse = edge
        ? residual.get(edge.to)?.[edge.reverseIndex]
        : undefined;
      if (!edge || !reverse) {
        break;
      }

      edge.capacity -= bottleneck;
      reverse.capacity += bottleneck;

      if (edge.originalIndex !== null) {
        flowByOriginal[edge.originalIndex] =
          (flowByOriginal[edge.originalIndex] ?? 0) + bottleneck;
      } else if (reverse.originalIndex !== null) {
        flowByOriginal[reverse.originalIndex] =
          (flowByOriginal[reverse.originalIndex] ?? 0) - bottleneck;
      }

      cursor = parentEntry.from;
    }

    maxFlow += bottleneck;
    augmentations += 1;
  }

  const reachableFromSource = new Set<NodeId>();
  const partitionQueue: NodeId[] = [source];
  reachableFromSource.add(source);
  let partitionCursor = 0;

  while (partitionCursor < partitionQueue.length) {
    const nodeId = partitionQueue[partitionCursor];
    partitionCursor += 1;
    if (!nodeId) {
      continue;
    }

    for (const edge of residual.get(nodeId) ?? []) {
      if (edge.capacity <= 1e-12 || reachableFromSource.has(edge.to)) {
        continue;
      }
      reachableFromSource.add(edge.to);
      partitionQueue.push(edge.to);
    }
  }

  const sourcePartition = adjacency.nodes
    .filter((nodeId) => reachableFromSource.has(nodeId))
    .sort(defaultTieBreaker);
  const sinkPartition = adjacency.nodes
    .filter((nodeId) => !reachableFromSource.has(nodeId))
    .sort(defaultTieBreaker);

  const cutEdges = originalEdges
    .filter(
      (edge) =>
        reachableFromSource.has(edge.from) && !reachableFromSource.has(edge.to),
    )
    .sort((left, right) => {
      const fromDelta = defaultTieBreaker(left.from, right.from);
      if (fromDelta !== 0) {
        return fromDelta;
      }
      return defaultTieBreaker(left.to, right.to);
    });

  const flowByEdge = originalEdges
    .map((edge, index) => ({
      from: edge.from,
      to: edge.to,
      flow: Math.max(0, flowByOriginal[index] ?? 0),
      capacity: edge.weight,
    }))
    .sort((left, right) => {
      const fromDelta = defaultTieBreaker(left.from, right.from);
      if (fromDelta !== 0) {
        return fromDelta;
      }
      return defaultTieBreaker(left.to, right.to);
    });

  return {
    source,
    sink,
    maxFlow,
    augmentations,
    flowByEdge,
    sourcePartition,
    sinkPartition,
    cutEdges,
  };
}

export function minCostMaxFlow<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: FlowEdge<NodeId>[],
  source: NodeId,
  sink: NodeId,
  options: MinCostMaxFlowOptions = {},
): MinCostMaxFlowResult<NodeId> {
  const edgeProjection: GraphEdge<NodeId>[] = edges.map((edge) => ({
    from: edge.from,
    to: edge.to,
    weight: edge.capacity,
  }));
  const nodeIds = dedupeNodeList(nodes, edgeProjection);
  const directed = options.directed ?? true;

  if (!nodeIds.includes(source) || !nodeIds.includes(sink)) {
    return {
      source,
      sink,
      flow: 0,
      cost: 0,
      complete: false,
      augmentations: 0,
      flowByEdge: [],
    };
  }

  interface ResidualCostEdge {
    to: NodeId;
    reverseIndex: number;
    capacity: number;
    cost: number;
    originalIndex: number | null;
  }

  interface OriginalCostEdge {
    from: NodeId;
    to: NodeId;
    capacity: number;
    cost: number;
  }

  const originals: OriginalCostEdge[] = [];
  for (const edge of edges) {
    if (!Number.isFinite(edge.capacity) || edge.capacity < 0) {
      throw new GraphAlgorithmError(
        'INVALID_ARGUMENT',
        `Flow edge capacity must be non-negative and finite, received ${edge.capacity}.`,
      );
    }
    const cost = edge.cost ?? 0;
    if (!Number.isFinite(cost)) {
      throw new GraphAlgorithmError(
        'INVALID_ARGUMENT',
        `Flow edge cost must be finite, received ${cost}.`,
      );
    }

    originals.push({
      from: edge.from,
      to: edge.to,
      capacity: edge.capacity,
      cost,
    });

    if (!directed) {
      originals.push({
        from: edge.to,
        to: edge.from,
        capacity: edge.capacity,
        cost,
      });
    }
  }

  const residual = new Map<NodeId, ResidualCostEdge[]>();
  for (const nodeId of nodeIds) {
    residual.set(nodeId, []);
  }

  const addResidualEdge = (
    from: NodeId,
    to: NodeId,
    capacity: number,
    cost: number,
    originalIndex: number,
  ): void => {
    const fromEdges = residual.get(from);
    const toEdges = residual.get(to);
    if (!fromEdges || !toEdges) {
      return;
    }

    const forwardIndex = fromEdges.length;
    const reverseIndex = toEdges.length;
    fromEdges.push({
      to,
      reverseIndex,
      capacity,
      cost,
      originalIndex,
    });
    toEdges.push({
      to: from,
      reverseIndex: forwardIndex,
      capacity: 0,
      cost: -cost,
      originalIndex: null,
    });
  };

  for (let index = 0; index < originals.length; index += 1) {
    const edge = originals[index];
    if (!edge) {
      continue;
    }
    addResidualEdge(edge.from, edge.to, edge.capacity, edge.cost, index);
  }

  const targetFlowRaw = options.targetFlow;
  const targetFlow =
    targetFlowRaw === undefined ? Number.POSITIVE_INFINITY : targetFlowRaw;
  if (!Number.isFinite(targetFlow) && targetFlow !== Number.POSITIVE_INFINITY) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      `targetFlow must be finite or omitted, received ${targetFlow}.`,
    );
  }
  if (targetFlow < 0) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      `targetFlow must be non-negative, received ${targetFlow}.`,
    );
  }

  let flow = 0;
  let cost = 0;
  let augmentations = 0;
  const flowByOriginal = new Array<number>(originals.length).fill(0);

  while (flow < targetFlow - 1e-12) {
    const distance = new Map<NodeId, number>();
    const parent = new Map<NodeId, { from: NodeId; edgeIndex: number }>();

    for (const nodeId of nodeIds) {
      distance.set(nodeId, Number.POSITIVE_INFINITY);
    }
    distance.set(source, 0);

    for (let iteration = 0; iteration < nodeIds.length - 1; iteration += 1) {
      let changed = false;
      for (const nodeId of nodeIds) {
        const currentDistance = distance.get(nodeId);
        if (currentDistance === undefined || !Number.isFinite(currentDistance)) {
          continue;
        }

        const edgesFromNode = residual.get(nodeId) ?? [];
        for (
          let edgeIndex = 0;
          edgeIndex < edgesFromNode.length;
          edgeIndex += 1
        ) {
          const edge = edgesFromNode[edgeIndex];
          if (!edge || edge.capacity <= 1e-12) {
            continue;
          }

          const candidateDistance = currentDistance + edge.cost;
          const knownDistance =
            distance.get(edge.to) ?? Number.POSITIVE_INFINITY;

          if (candidateDistance < knownDistance - 1e-12) {
            distance.set(edge.to, candidateDistance);
            parent.set(edge.to, { from: nodeId, edgeIndex });
            changed = true;
          }
        }
      }

      if (!changed) {
        break;
      }
    }

    const sinkDistance = distance.get(sink) ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(sinkDistance)) {
      break;
    }

    let bottleneck = Math.min(targetFlow - flow, Number.POSITIVE_INFINITY);
    let cursor: NodeId = sink;

    while (cursor !== source) {
      const parentEntry = parent.get(cursor);
      if (!parentEntry) {
        bottleneck = 0;
        break;
      }
      const edge = residual.get(parentEntry.from)?.[parentEntry.edgeIndex];
      if (!edge) {
        bottleneck = 0;
        break;
      }
      bottleneck = Math.min(bottleneck, edge.capacity);
      cursor = parentEntry.from;
    }

    if (!Number.isFinite(bottleneck) || bottleneck <= 1e-12) {
      break;
    }

    cursor = sink;
    while (cursor !== source) {
      const parentEntry = parent.get(cursor);
      if (!parentEntry) {
        break;
      }
      const edge = residual.get(parentEntry.from)?.[parentEntry.edgeIndex];
      const reverse = edge
        ? residual.get(edge.to)?.[edge.reverseIndex]
        : undefined;
      if (!edge || !reverse) {
        break;
      }

      edge.capacity -= bottleneck;
      reverse.capacity += bottleneck;

      if (edge.originalIndex !== null) {
        flowByOriginal[edge.originalIndex] =
          (flowByOriginal[edge.originalIndex] ?? 0) + bottleneck;
      } else if (reverse.originalIndex !== null) {
        flowByOriginal[reverse.originalIndex] =
          (flowByOriginal[reverse.originalIndex] ?? 0) - bottleneck;
      }

      cursor = parentEntry.from;
    }

    flow += bottleneck;
    cost += bottleneck * sinkDistance;
    augmentations += 1;
  }

  const flowByEdge = originals
    .map((edge, index) => ({
      from: edge.from,
      to: edge.to,
      flow: Math.max(0, flowByOriginal[index] ?? 0),
      capacity: edge.capacity,
      cost: edge.cost,
    }))
    .sort((left, right) => {
      const fromDelta = defaultTieBreaker(left.from, right.from);
      if (fromDelta !== 0) {
        return fromDelta;
      }
      return defaultTieBreaker(left.to, right.to);
    });

  return {
    source,
    sink,
    flow,
    cost,
    complete:
      targetFlow === Number.POSITIVE_INFINITY
        ? true
        : flow >= targetFlow - 1e-12,
    augmentations,
    flowByEdge,
  };
}

export function kMeansClustering(
  points: number[][],
  k: number,
  options: KMeansOptions = {},
): KMeansResult {
  if (!Array.isArray(points) || points.length === 0) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'kMeansClustering requires at least one point.',
    );
  }

  const dimensionality = points[0]?.length ?? 0;
  if (dimensionality === 0) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'kMeansClustering requires points with at least one axis.',
    );
  }

  for (const point of points) {
    if (point.length !== dimensionality) {
      throw new GraphAlgorithmError(
        'INVALID_ARGUMENT',
        'kMeansClustering requires all points to share dimensionality.',
      );
    }
  }

  const clusterCount = Math.max(1, Math.min(points.length, Math.floor(k)));
  const maxIterations = Math.max(1, options.maxIterations ?? 120);
  const tolerance = Math.max(0, options.tolerance ?? 1e-5);
  const nInit = Math.max(1, options.nInit ?? 8);
  const normalization = options.normalization ?? 'zscore';
  const useKMeansPlusPlus = options.useKMeansPlusPlus ?? true;
  const baseSeed =
    options.seed === undefined || !Number.isFinite(options.seed)
      ? Math.floor(Math.random() * 0xffffffff)
      : Math.floor(options.seed);

  const transform = normalizePoints(points, normalization);
  const normalizedPoints = points.map((point) => transform.normalize(point));

  let best: KMeansRunResult | null = null;
  let bestSeed = baseSeed;

  for (let attempt = 0; attempt < nInit; attempt += 1) {
    const seed = (baseSeed + attempt * 2654435761) >>> 0;
    const random = createRandom(seed);
    const run = runSingleKMeans(
      normalizedPoints,
      clusterCount,
      random,
      maxIterations,
      tolerance,
      useKMeansPlusPlus,
    );

    if (!best || run.inertia < best.inertia - 1e-9) {
      best = run;
      bestSeed = seed;
    }
  }

  if (!best) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'kMeansClustering failed to produce a valid run.',
    );
  }

  const clusters: KMeansCluster[] = [];
  for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex += 1) {
    const indices: number[] = [];
    for (let pointIndex = 0; pointIndex < best.assignments.length; pointIndex += 1) {
      if (best.assignments[pointIndex] === clusterIndex) {
        indices.push(pointIndex);
      }
    }

    clusters.push({
      centroid: transform.denormalize(best.centroidsNormalized[clusterIndex] ?? []),
      indices,
    });
  }

  const silhouette = computeSilhouette(
    normalizedPoints,
    best.assignments,
    clusterCount,
  );

  return {
    assignments: best.assignments,
    clusters,
    iterations: best.iterations,
    inertia: best.inertia,
    converged: best.converged,
    silhouette,
    selectedSeed: bestSeed,
  };
}

export function kMeansAuto(points: number[][], options: KMeansAutoOptions = {}): KMeansAutoResult {
  if (!Array.isArray(points) || points.length === 0) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'kMeansAuto requires at least one point.',
    );
  }

  const minK = Math.max(2, options.kMin ?? 2);
  const maxK = Math.max(
    minK,
    Math.min(points.length, options.kMax ?? Math.min(10, Math.ceil(Math.sqrt(points.length)) + 2)),
  );

  let bestResult: KMeansResult | null = null;
  let bestK = minK;
  const candidates: KMeansAutoCandidate[] = [];

  for (let k = minK; k <= maxK; k += 1) {
    const result = kMeansClustering(points, k, {
      ...options,
      seed:
        options.seed === undefined || !Number.isFinite(options.seed)
          ? undefined
          : options.seed + k * 997,
    });

    candidates.push({
      k,
      silhouette: result.silhouette,
      inertia: result.inertia,
    });

    if (!bestResult) {
      bestResult = result;
      bestK = k;
      continue;
    }

    const currentSilhouette = result.silhouette ?? Number.NEGATIVE_INFINITY;
    const bestSilhouette = bestResult.silhouette ?? Number.NEGATIVE_INFINITY;

    if (currentSilhouette > bestSilhouette + 1e-9) {
      bestResult = result;
      bestK = k;
      continue;
    }

    if (
      Math.abs(currentSilhouette - bestSilhouette) <= 1e-9 &&
      result.inertia < bestResult.inertia - 1e-9
    ) {
      bestResult = result;
      bestK = k;
    }
  }

  if (!bestResult) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'kMeansAuto failed to choose a cluster configuration.',
    );
  }

  return {
    ...bestResult,
    selectedK: bestK,
    candidates,
  };
}

export function travelingSalesmanApprox<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: TravelingSalesmanOptions<NodeId> = {},
): TravelingSalesmanResult<NodeId> {
  const adjacency = buildGraphAdjacency(nodes, edges, options);

  if (adjacency.nodes.length === 0) {
    return {
      order: [],
      distance: 0,
      segments: [],
      visitedCount: 0,
      complete: true,
      unreachableNodes: [],
      lowerBound: 0,
      optimalityGap: 0,
    };
  }

  if (hasNegativeWeights(adjacency)) {
    throw new GraphAlgorithmError(
      'NEGATIVE_WEIGHT',
      'TSP approximation requires non-negative graph weights.',
    );
  }

  const returnToStart = options.returnToStart ?? true;
  const twoOptPasses = Math.max(0, options.twoOptPasses ?? 3);
  const starts = createDeterministicStartList(adjacency.nodes, options);

  const distanceMatrix = new Map<NodeId, Map<NodeId, number>>();
  const previousMatrix = new Map<NodeId, Map<NodeId, NodeId>>();

  for (const source of adjacency.nodes) {
    const engine = runShortestPathEngine(
      adjacency,
      source,
      options.shortestPathAlgorithm ?? 'auto',
    );

    if (engine.result.negativeCycleNodes.size > 0) {
      throw new GraphAlgorithmError(
        'NEGATIVE_CYCLE',
        'TSP approximation cannot run when negative cycles are reachable.',
      );
    }

    distanceMatrix.set(source, engine.result.distanceByNode);
    previousMatrix.set(source, engine.result.previousByNode);
  }

  let bestRoute: NodeId[] = [];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const start of starts) {
    const greedyRoute = buildGreedyRoute(
      start,
      adjacency.nodes,
      distanceMatrix,
      returnToStart,
    );

    let candidateRoute = greedyRoute;
    if (candidateRoute.length > 2) {
      candidateRoute = optimizeRouteTwoOpt(
        candidateRoute,
        distanceMatrix,
        twoOptPasses,
      );
    }

    const candidateDistance = routeDistanceFromMatrix(
      candidateRoute,
      distanceMatrix,
    );

    if (candidateDistance < bestDistance) {
      bestDistance = candidateDistance;
      bestRoute = candidateRoute;
    }
  }

  const visited = new Set(bestRoute);
  const unreachableNodes = adjacency.nodes.filter((nodeId) => !visited.has(nodeId));
  const complete = unreachableNodes.length === 0 && Number.isFinite(bestDistance);

  const segments: TravelingSalesmanSegment<NodeId>[] = [];
  let totalDistance = 0;

  for (let index = 1; index < bestRoute.length; index += 1) {
    const fromId = bestRoute[index - 1];
    const toId = bestRoute[index];
    if (!fromId || !toId) {
      continue;
    }

    const distance = distanceMatrix.get(fromId)?.get(toId) ?? Number.POSITIVE_INFINITY;
    const previous = previousMatrix.get(fromId) ?? new Map<NodeId, NodeId>();
    const path = reconstructPath(fromId, toId, previous);

    if (!Number.isFinite(distance) || path.length === 0) {
      continue;
    }

    totalDistance += distance;
    segments.push({
      from: fromId,
      to: toId,
      distance,
      path,
    });
  }

  if (!complete) {
    totalDistance = Number.POSITIVE_INFINITY;
  }

  const lowerBound = computeMstLowerBound(adjacency.nodes, distanceMatrix);
  const optimalityGap =
    complete &&
    Number.isFinite(totalDistance) &&
    Number.isFinite(lowerBound) &&
    lowerBound > 0
      ? (totalDistance - lowerBound) / lowerBound
      : null;

  return {
    order: bestRoute,
    distance: totalDistance,
    segments,
    visitedCount: visited.size,
    complete,
    unreachableNodes,
    lowerBound,
    optimalityGap,
  };
}

// ── Hierarchical Clustering ──────────────────────────────────────────

export type LinkageMethod = 'single' | 'complete' | 'average' | 'ward';

export interface DendrogramNode {
  left: number;
  right: number;
  distance: number;
  size: number;
}

export interface HierarchicalClusterResult {
  clusters: number[][];
  assignments: number[];
  dendrogram: DendrogramNode[];
  silhouette: number | null;
}

export function hierarchicalClustering(
  points: number[][],
  k: number,
  options: {
    linkage?: LinkageMethod;
    distanceMetric?: 'euclidean' | 'cosine' | 'manhattan';
  } = {},
): HierarchicalClusterResult {
  if (!Array.isArray(points) || points.length === 0) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'hierarchicalClustering requires at least one point.',
    );
  }

  const n = points.length;
  const clusterCount = Math.max(1, Math.min(n, Math.floor(k)));
  const linkage = options.linkage ?? 'average';
  const metric = options.distanceMetric ?? 'euclidean';

  const distFn = (a: number[], b: number[]): number => {
    switch (metric) {
      case 'cosine': {
        const sim = distanceCosineSimilarity(a, b);
        return 1 - sim;
      }
      case 'manhattan':
        return manhattanDistance(a, b);
      default:
        return euclideanDistance(a, b);
    }
  };

  // Initialize: each point is its own cluster
  // clusterMembers[i] = array of point indices in cluster i
  const clusterMembers: number[][] = points.map((_, i) => [i]);
  // active[i] = whether cluster i is still active
  const active: boolean[] = new Array(n).fill(true);
  const dendrogram: DendrogramNode[] = [];

  // Precompute pairwise distances
  const distMatrix: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const d = distFn(points[i], points[j]);
      distMatrix[i][j] = d;
      distMatrix[j][i] = d;
    }
  }

  // Cluster distances (for lance-williams updates or direct computation)
  const clusterDist: number[][] = Array.from({ length: n }, (_, i) =>
    [...distMatrix[i]],
  );

  let activeCount = n;

  while (activeCount > clusterCount) {
    // Find closest pair of active clusters
    let bestI = -1;
    let bestJ = -1;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < clusterMembers.length; i += 1) {
      if (!active[i]) continue;
      for (let j = i + 1; j < clusterMembers.length; j += 1) {
        if (!active[j]) continue;
        if (clusterDist[i][j] < bestDist) {
          bestDist = clusterDist[i][j];
          bestI = i;
          bestJ = j;
        }
      }
    }

    if (bestI === -1 || bestJ === -1) break;

    // Merge bestJ into bestI
    dendrogram.push({
      left: bestI < n ? -(bestI + 1) : bestI,
      right: bestJ < n ? -(bestJ + 1) : bestJ,
      distance: bestDist,
      size: clusterMembers[bestI].length + clusterMembers[bestJ].length,
    });

    const mergedMembers = clusterMembers[bestI].concat(clusterMembers[bestJ]);
    clusterMembers[bestI] = mergedMembers;
    active[bestJ] = false;
    activeCount -= 1;

    // Update distances from merged cluster to all other active clusters
    for (let other = 0; other < clusterMembers.length; other += 1) {
      if (!active[other] || other === bestI) continue;

      let newDist: number;
      switch (linkage) {
        case 'single':
          newDist = Math.min(clusterDist[bestI][other], clusterDist[bestJ][other]);
          break;
        case 'complete':
          newDist = Math.max(clusterDist[bestI][other], clusterDist[bestJ][other]);
          break;
        case 'ward': {
          // Lance-Williams formula for Ward's method
          const ni = clusterMembers[bestI].length - clusterMembers[bestJ].length;
          const nj = clusterMembers[bestJ].length;
          const nk = clusterMembers[other].length;
          const total = ni + nj + nk;
          newDist = Math.sqrt(
            ((ni + nk) * clusterDist[bestI][other] * clusterDist[bestI][other] +
              (nj + nk) * clusterDist[bestJ][other] * clusterDist[bestJ][other] -
              nk * bestDist * bestDist) /
              total,
          );
          break;
        }
        default: {
          // average linkage
          const sizeI = clusterMembers[bestI].length - clusterMembers[bestJ].length;
          const sizeJ = clusterMembers[bestJ].length;
          newDist =
            (clusterDist[bestI][other] * sizeI +
              clusterDist[bestJ][other] * sizeJ) /
            (sizeI + sizeJ);
          break;
        }
      }

      clusterDist[bestI][other] = newDist;
      clusterDist[other][bestI] = newDist;
    }
  }

  // Build final cluster assignments
  const assignments = new Array<number>(n).fill(-1);
  const clusters: number[][] = [];
  let clusterIdx = 0;
  for (let i = 0; i < clusterMembers.length; i += 1) {
    if (!active[i]) continue;
    clusters.push(clusterMembers[i]);
    for (const ptIdx of clusterMembers[i]) {
      assignments[ptIdx] = clusterIdx;
    }
    clusterIdx += 1;
  }

  // Compute silhouette
  const silhouette = computeSilhouette(points, assignments, clusters.length);

  return {
    clusters,
    assignments,
    dendrogram,
    silhouette,
  };
}

// ── DBSCAN ───────────────────────────────────────────────────────────

export interface DbscanResult {
  clusters: number[][];
  assignments: number[];
  noise: number[];
  clusterCount: number;
}

export function dbscan(
  points: number[][],
  epsilon: number,
  minPoints: number,
  options: {
    distanceMetric?: 'euclidean' | 'cosine' | 'manhattan';
  } = {},
): DbscanResult {
  if (!Array.isArray(points) || points.length === 0) {
    throw new GraphAlgorithmError(
      'INVALID_ARGUMENT',
      'dbscan requires at least one point.',
    );
  }

  const n = points.length;
  const metric = options.distanceMetric ?? 'euclidean';

  const distFn = (a: number[], b: number[]): number => {
    switch (metric) {
      case 'cosine':
        return 1 - distanceCosineSimilarity(a, b);
      case 'manhattan':
        return manhattanDistance(a, b);
      default:
        return euclideanDistance(a, b);
    }
  };

  const UNVISITED = -2;
  const NOISE = -1;
  const assignments = new Array<number>(n).fill(UNVISITED);
  let currentCluster = 0;

  // Find neighbors within epsilon
  const regionQuery = (pointIdx: number): number[] => {
    const neighbors: number[] = [];
    for (let i = 0; i < n; i += 1) {
      if (distFn(points[pointIdx], points[i]) <= epsilon) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i += 1) {
    if (assignments[i] !== UNVISITED) continue;

    const neighbors = regionQuery(i);

    if (neighbors.length < minPoints) {
      assignments[i] = NOISE;
      continue;
    }

    // Start a new cluster
    assignments[i] = currentCluster;
    const seed = [...neighbors];
    let seedIdx = 0;

    while (seedIdx < seed.length) {
      const j = seed[seedIdx];
      seedIdx += 1;

      if (assignments[j] === NOISE) {
        assignments[j] = currentCluster;
      }
      if (assignments[j] !== UNVISITED) continue;

      assignments[j] = currentCluster;
      const jNeighbors = regionQuery(j);
      if (jNeighbors.length >= minPoints) {
        for (const neighbor of jNeighbors) {
          if (!seed.includes(neighbor)) {
            seed.push(neighbor);
          }
        }
      }
    }

    currentCluster += 1;
  }

  // Build output
  const clusters: number[][] = Array.from(
    { length: currentCluster },
    () => [],
  );
  const noise: number[] = [];

  for (let i = 0; i < n; i += 1) {
    if (assignments[i] === NOISE) {
      noise.push(i);
    } else {
      clusters[assignments[i]].push(i);
    }
  }

  return {
    clusters,
    assignments,
    noise,
    clusterCount: currentCluster,
  };
}
