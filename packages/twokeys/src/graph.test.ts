import { describe, expect, test } from 'bun:test';
import {
  aStarShortestPath,
  analyzeGraph,
  articulationPointsAndBridges,
  allPairsShortestPaths,
  betweennessCentrality,
  closenessCentrality,
  degreeCentrality,
  kNearestNeighbors,
  kMeansAuto,
  kMeansClustering,
  labelPropagationCommunities,
  linkPrediction,
  louvainCommunities,
  maximumFlow,
  minCostMaxFlow,
  minimumSpanningTree,
  nodeSimilarity,
  pageRank,
  shortestPath,
  stronglyConnectedComponents,
  topologicalSort,
  travelingSalesmanApprox,
  weaklyConnectedComponents,
  yenKShortestPaths,
  hierarchicalClustering,
  dbscan,
  type GraphEdge,
} from './graph';

describe('graph analytics', () => {
  test('topologicalSort orders DAG nodes in dependency order', () => {
    const nodes = ['root', 'a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'root', to: 'a' },
      { from: 'a', to: 'b' },
      { from: 'root', to: 'c' },
    ];

    const result = topologicalSort(nodes, edges);
    const indexById = new Map<string, number>();
    result.order.forEach((nodeId, index) => indexById.set(nodeId, index));

    expect(result.isDag).toBe(true);
    expect(result.cycleNodes).toEqual([]);
    expect((indexById.get('root') ?? -1) < (indexById.get('a') ?? -1)).toBe(
      true,
    );
    expect((indexById.get('a') ?? -1) < (indexById.get('b') ?? -1)).toBe(
      true,
    );
    expect((indexById.get('root') ?? -1) < (indexById.get('c') ?? -1)).toBe(
      true,
    );
  });

  test('topologicalSort reports cycle members when graph is not a DAG', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'a' },
      { from: 'c', to: 'd' },
    ];

    const result = topologicalSort(nodes, edges);

    expect(result.isDag).toBe(false);
    expect(result.order).toHaveLength(nodes.length);
    expect(result.cycleNodes.sort()).toEqual(['a', 'b']);
  });

  test('topologicalSort prioritizes higher-value ready nodes when provided', () => {
    const nodes = ['root', 'draft', 'ship'];
    const edges: GraphEdge[] = [
      { from: 'root', to: 'draft' },
      { from: 'root', to: 'ship' },
    ];

    const result = topologicalSort(nodes, edges, {
      priorityByNode: {
        ship: 10,
        draft: 2,
      },
    });

    expect(result.isDag).toBe(true);
    expect(result.order).toEqual(['root', 'ship', 'draft']);
  });

  test('stronglyConnectedComponents groups directed cycles', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'a' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
      { from: 'd', to: 'c' },
    ];

    const result = stronglyConnectedComponents(nodes, edges, { directed: true });
    const sortedComponents = result.components.map((component) =>
      [...component].sort(),
    );

    expect(sortedComponents).toContainEqual(['a', 'b']);
    expect(sortedComponents).toContainEqual(['c', 'd']);
  });

  test('weaklyConnectedComponents groups nodes regardless of edge direction', () => {
    const nodes = ['a', 'b', 'c', 'd', 'e'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'd', to: 'e' },
    ];

    const result = weaklyConnectedComponents(nodes, edges);

    expect(result.components).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e'],
    ]);
    expect(result.componentByNode.get('a')).toBe(0);
    expect(result.componentByNode.get('e')).toBe(1);
  });

  test('centrality metrics rank middle node highest in a chain', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ];

    const degree = degreeCentrality(nodes, edges, { directed: false });
    const closeness = closenessCentrality(nodes, edges, {
      directed: false,
      mode: 'harmonic',
    });
    const betweenness = betweennessCentrality(nodes, edges, {
      directed: false,
    });

    expect((degree.get('b')?.normalized ?? 0) > (degree.get('a')?.normalized ?? 0)).toBe(true);
    expect((closeness.get('b')?.normalized ?? 0) > (closeness.get('a')?.normalized ?? 0)).toBe(true);
    expect(
      (betweenness.get('b')?.normalized ?? 0) >
        (betweenness.get('a')?.normalized ?? 0),
    ).toBe(true);
  });

  test('closeness harmonic handles disconnected graph without NaN', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [{ from: 'a', to: 'b', weight: 1 }];

    const closeness = closenessCentrality(nodes, edges, {
      directed: false,
      mode: 'harmonic',
    });

    expect(closeness.get('a')?.normalized).toBeGreaterThan(0);
    expect(closeness.get('c')?.normalized).toBe(0);
  });

  test('shortestPath returns best weighted route', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 1 },
      { from: 'b', to: 'c', weight: 2 },
      { from: 'a', to: 'c', weight: 10 },
    ];

    const result = shortestPath(nodes, edges, 'a', 'c');
    expect(result.reachable).toBe(true);
    expect(result.algorithm).toBe('dijkstra');
    expect(result.distance).toBe(3);
    expect(result.path).toEqual(['a', 'b', 'c']);
  });

  test('shortestPath uses bellman-ford automatically when negative edges exist', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 2 },
      { from: 'b', to: 'c', weight: -1 },
      { from: 'a', to: 'c', weight: 3 },
    ];

    const result = shortestPath(nodes, edges, 'a', 'c', {
      algorithm: 'auto',
      directed: true,
    });

    expect(result.algorithm).toBe('bellman-ford');
    expect(result.hasNegativeWeights).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.distance).toBe(1);
    expect(result.path).toEqual(['a', 'b', 'c']);
  });

  test('shortestPath marks negative cycle reachability', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 1 },
      { from: 'b', to: 'c', weight: -2 },
      { from: 'c', to: 'b', weight: -2 },
      { from: 'c', to: 'd', weight: 1 },
    ];

    const result = shortestPath(nodes, edges, 'a', 'd', {
      algorithm: 'auto',
      directed: true,
    });

    expect(result.negativeCycle).toBe(true);
    expect(result.reachable).toBe(false);
    expect(result.path).toEqual([]);
    expect(result.distance).toBe(Number.NEGATIVE_INFINITY);
  });

  test('pageRank ranks a hub above leaf nodes', () => {
    const nodes = ['hub', 'a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'hub' },
      { from: 'b', to: 'hub' },
      { from: 'c', to: 'hub' },
      { from: 'hub', to: 'a' },
      { from: 'hub', to: 'b' },
      { from: 'hub', to: 'c' },
    ];

    const result = pageRank(nodes, edges);

    expect(result.order[0]).toBe('hub');
    expect(result.byNode.get('hub')?.rank).toBe(1);

    const scoreSum = Array.from(result.byNode.values()).reduce(
      (sum, record) => sum + record.score,
      0,
    );
    expect(scoreSum).toBeCloseTo(1, 8);
  });

  test('minimumSpanningTree returns a minimum spanning tree on connected graph', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 3 },
      { from: 'a', to: 'c', weight: 1 },
      { from: 'b', to: 'c', weight: 1 },
      { from: 'b', to: 'd', weight: 4 },
      { from: 'c', to: 'd', weight: 2 },
    ];

    const result = minimumSpanningTree(nodes, edges);

    expect(result.spanning).toBe(true);
    expect(result.componentCount).toBe(1);
    expect(result.edges).toHaveLength(3);
    expect(result.totalWeight).toBe(4);
  });

  test('articulationPointsAndBridges identifies articulation points and bridges', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'a' },
      { from: 'c', to: 'd' },
    ];

    const result = articulationPointsAndBridges(nodes, edges);

    expect(result.articulationPoints).toEqual(['c']);
    expect(result.bridges).toEqual([{ from: 'c', to: 'd', weight: 1 }]);
  });

  test('labelPropagationCommunities separates disconnected components', () => {
    const nodes = ['a', 'b', 'c', 'd', 'e', 'f'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'a', to: 'c' },
      { from: 'd', to: 'e' },
      { from: 'e', to: 'f' },
      { from: 'd', to: 'f' },
    ];

    const result = labelPropagationCommunities(nodes, edges, { directed: false });

    expect(result.communities).toHaveLength(2);
    expect(result.communities).toContainEqual(['a', 'b', 'c']);
    expect(result.communities).toContainEqual(['d', 'e', 'f']);
    expect(result.algorithm).toBe('label-propagation');
    expect(result.modularity).toBeGreaterThan(0);
  });

  test('louvainCommunities detects two dense communities', () => {
    const nodes = ['a', 'b', 'c', 'd', 'e', 'f'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 3 },
      { from: 'b', to: 'c', weight: 3 },
      { from: 'a', to: 'c', weight: 3 },
      { from: 'd', to: 'e', weight: 3 },
      { from: 'e', to: 'f', weight: 3 },
      { from: 'd', to: 'f', weight: 3 },
      { from: 'c', to: 'd', weight: 0.3 },
    ];

    const result = louvainCommunities(nodes, edges, { directed: false });

    expect(result.communities).toHaveLength(2);
    expect(result.communities).toContainEqual(['a', 'b', 'c']);
    expect(result.communities).toContainEqual(['d', 'e', 'f']);
    expect(result.algorithm).toBe('louvain');
    expect(result.modularity).toBeGreaterThan(0.2);
  });

  test('nodeSimilarity computes jaccard similarity rankings', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'c' },
      { from: 'a', to: 'd' },
      { from: 'b', to: 'c' },
      { from: 'b', to: 'd' },
    ];

    const result = nodeSimilarity(nodes, edges, {
      directed: false,
      metric: 'jaccard',
    });

    expect(result.pairs[0]?.left).toBe('a');
    expect(result.pairs[0]?.right).toBe('b');
    expect(result.pairs[0]?.score).toBe(1);
  });

  test('kNearestNeighbors returns top similar neighbor for each node', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'c' },
      { from: 'a', to: 'd' },
      { from: 'b', to: 'c' },
      { from: 'b', to: 'd' },
    ];

    const result = kNearestNeighbors(nodes, edges, {
      directed: false,
      metric: 'jaccard',
      k: 1,
    });

    expect(result.neighborsByNode.get('a')?.[0]?.nodeId).toBe('b');
    expect(result.neighborsByNode.get('b')?.[0]?.nodeId).toBe('a');
  });

  test('linkPrediction suggests missing edge from shared neighbors', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'c' },
      { from: 'b', to: 'c' },
    ];

    const result = linkPrediction(nodes, edges, {
      directed: false,
      metric: 'jaccard',
      limit: 3,
    });

    expect(result.predictions[0]?.from).toBe('a');
    expect(result.predictions[0]?.to).toBe('b');
    expect(result.predictions[0]?.score).toBeGreaterThan(0);
  });

  test('aStarShortestPath matches shortest route with zero heuristic', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 1 },
      { from: 'b', to: 'c', weight: 2 },
      { from: 'a', to: 'c', weight: 10 },
    ];

    const result = aStarShortestPath(nodes, edges, 'a', 'c', {
      directed: true,
      heuristic: () => 0,
    });

    expect(result.reachable).toBe(true);
    expect(result.distance).toBe(3);
    expect(result.path).toEqual(['a', 'b', 'c']);
  });

  test('allPairsShortestPaths returns distance matrix', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 1 },
      { from: 'b', to: 'c', weight: 2 },
      { from: 'a', to: 'c', weight: 10 },
    ];

    const result = allPairsShortestPaths(nodes, edges, {
      directed: true,
      algorithm: 'auto',
    });

    expect(result.algorithm).toBe('dijkstra');
    expect(result.distanceBySource.get('a')?.get('c')).toBe(3);
    expect(result.distanceBySource.get('c')?.get('a')).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  test('yenKShortestPaths returns ordered alternatives', () => {
    const nodes = ['s', 'a', 'b', 't'];
    const edges: GraphEdge[] = [
      { from: 's', to: 'a', weight: 1 },
      { from: 's', to: 'b', weight: 1 },
      { from: 'a', to: 't', weight: 1 },
      { from: 'b', to: 't', weight: 1 },
      { from: 'a', to: 'b', weight: 1 },
      { from: 's', to: 't', weight: 3 },
    ];

    const result = yenKShortestPaths(nodes, edges, 's', 't', {
      directed: true,
      k: 3,
    });

    expect(result.paths).toHaveLength(3);
    expect(result.paths[0]?.distance).toBe(2);
    expect(result.paths[1]?.distance).toBe(2);
    expect(result.paths[2]?.distance).toBe(3);
  });

  test('maximumFlow computes max flow and min-cut partition', () => {
    const nodes = ['s', 'a', 'b', 't'];
    const edges: GraphEdge[] = [
      { from: 's', to: 'a', weight: 3 },
      { from: 's', to: 'b', weight: 2 },
      { from: 'a', to: 'b', weight: 1 },
      { from: 'a', to: 't', weight: 2 },
      { from: 'b', to: 't', weight: 3 },
    ];

    const result = maximumFlow(nodes, edges, 's', 't');

    expect(result.maxFlow).toBe(5);
    expect(result.augmentations).toBeGreaterThan(0);
    expect(result.sourcePartition).toContain('s');
    expect(result.sinkPartition).toContain('t');
  });

  test('minCostMaxFlow finds min-cost plan for target flow', () => {
    const nodes = ['s', 'a', 'b', 't'];
    const edges = [
      { from: 's', to: 'a', capacity: 2, cost: 1 },
      { from: 's', to: 'b', capacity: 1, cost: 2 },
      { from: 'a', to: 'b', capacity: 1, cost: 0 },
      { from: 'a', to: 't', capacity: 1, cost: 3 },
      { from: 'b', to: 't', capacity: 2, cost: 1 },
    ];

    const result = minCostMaxFlow(nodes, edges, 's', 't', {
      targetFlow: 3,
      directed: true,
    });

    expect(result.flow).toBe(3);
    expect(result.cost).toBe(9);
    expect(result.complete).toBe(true);
  });

  test('kMeansClustering separates two obvious point groups', () => {
    const points = [
      [0, 0],
      [0.1, -0.1],
      [-0.2, 0.2],
      [10, 10],
      [10.1, 9.9],
      [9.8, 10.2],
    ];

    const result = kMeansClustering(points, 2, {
      seed: 42,
      maxIterations: 100,
      nInit: 5,
    });

    expect(result.clusters).toHaveLength(2);
    expect(result.converged).toBe(true);
    expect(result.silhouette).toBeGreaterThan(0.8);

    const firstGroupLabel = result.assignments[0];
    const secondGroupLabel = result.assignments[3];

    expect(result.assignments.slice(0, 3).every((label) => label === firstGroupLabel)).toBe(true);
    expect(result.assignments.slice(3).every((label) => label === secondGroupLabel)).toBe(true);
    expect(firstGroupLabel === secondGroupLabel).toBe(false);
  });

  test('kMeansAuto chooses k=2 for clearly bi-modal points', () => {
    const points = [
      [0, 0],
      [0.2, 0.1],
      [-0.1, -0.2],
      [10, 10],
      [10.2, 10.1],
      [9.9, 10.3],
    ];

    const auto = kMeansAuto(points, {
      seed: 7,
      kMin: 2,
      kMax: 4,
      nInit: 6,
    });

    expect(auto.selectedK).toBe(2);
    expect(auto.candidates).toHaveLength(3);
  });

  test('travelingSalesmanApprox builds a full round trip on connected graph', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', weight: 1 },
      { from: 'b', to: 'c', weight: 1 },
      { from: 'c', to: 'd', weight: 1 },
      { from: 'd', to: 'a', weight: 1 },
      { from: 'a', to: 'c', weight: Math.SQRT2 },
      { from: 'b', to: 'd', weight: Math.SQRT2 },
    ];

    const result = travelingSalesmanApprox(nodes, edges, {
      directed: false,
      start: 'a',
      returnToStart: true,
      twoOptPasses: 4,
      multiStartCount: 4,
      seed: 19,
    });

    expect(result.complete).toBe(true);
    expect(result.unreachableNodes).toEqual([]);
    expect(result.order[0]).toBe('a');
    expect(result.order[result.order.length - 1]).toBe('a');
    expect(result.visitedCount).toBe(4);
    expect(result.distance).toBeLessThanOrEqual(4.2);
    expect(result.lowerBound).toBeGreaterThan(0);
    expect(result.optimalityGap).not.toBeNull();
  });

  test('analyzeGraph returns centrality plus SCC breakdown', () => {
    const nodes = ['a', 'b', 'c'];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'a' },
    ];

    const analysis = analyzeGraph(nodes, edges);

    expect(analysis.degree.size).toBe(3);
    expect(analysis.closeness.size).toBe(3);
    expect(analysis.betweenness.size).toBe(3);
    expect(analysis.pageRank.size).toBe(3);
    expect(analysis.stronglyConnectedComponents).toHaveLength(1);
    expect(analysis.weaklyConnectedComponents).toHaveLength(1);
    expect(analysis.articulationPoints).toEqual([]);
    expect(analysis.bridges).toEqual([]);
    expect(analysis.stronglyConnectedComponents[0]?.sort()).toEqual(['a', 'b', 'c']);
  });

  test('analyzeGraph falls back for page rank when negative weights exist', () => {
    const nodes = ['a', 'b'];
    const edges: GraphEdge[] = [{ from: 'a', to: 'b', weight: -1 }];

    const analysis = analyzeGraph(nodes, edges);

    expect(analysis.pageRank.size).toBe(2);
    expect(analysis.pageRank.get('a')?.score).toBe(0.5);
    expect(analysis.pageRank.get('b')?.score).toBe(0.5);
  });
});

describe('hierarchicalClustering', () => {
  test('clusters 2D points into expected groups', () => {
    const points = [
      [0, 0], [1, 0], [0, 1],  // Cluster near origin
      [10, 10], [11, 10], [10, 11],  // Cluster far away
    ];
    const result = hierarchicalClustering(points, 2);
    expect(result.clusters.length).toBe(2);
    expect(result.assignments.length).toBe(6);

    // Points 0,1,2 should be in one cluster and 3,4,5 in another
    expect(result.assignments[0]).toBe(result.assignments[1]);
    expect(result.assignments[0]).toBe(result.assignments[2]);
    expect(result.assignments[3]).toBe(result.assignments[4]);
    expect(result.assignments[3]).toBe(result.assignments[5]);
    expect(result.assignments[0]).not.toBe(result.assignments[3]);
  });

  test('single cluster returns all points', () => {
    const points = [[1, 2], [3, 4], [5, 6]];
    const result = hierarchicalClustering(points, 1);
    expect(result.clusters.length).toBe(1);
    expect(result.clusters[0].length).toBe(3);
  });

  test('k equals n returns individual clusters', () => {
    const points = [[1, 2], [3, 4], [5, 6]];
    const result = hierarchicalClustering(points, 3);
    expect(result.clusters.length).toBe(3);
    result.clusters.forEach((c) => expect(c.length).toBe(1));
  });

  test('dendrogram records merges', () => {
    const points = [[0, 0], [1, 0], [10, 10]];
    const result = hierarchicalClustering(points, 1);
    expect(result.dendrogram.length).toBe(2); // 2 merges for 3 points → 1 cluster
  });

  test('different linkage methods work', () => {
    const points = [[0, 0], [1, 0], [10, 10], [11, 10]];
    for (const linkage of ['single', 'complete', 'average', 'ward'] as const) {
      const result = hierarchicalClustering(points, 2, { linkage });
      expect(result.clusters.length).toBe(2);
    }
  });

  test('cosine distance metric works', () => {
    const points = [[1, 0], [0.9, 0.1], [0, 1], [0.1, 0.9]];
    const result = hierarchicalClustering(points, 2, { distanceMetric: 'cosine' });
    expect(result.clusters.length).toBe(2);
  });

  test('throws on empty points', () => {
    expect(() => hierarchicalClustering([], 2)).toThrow();
  });
});

describe('dbscan', () => {
  test('finds two clusters in well-separated data', () => {
    const points = [
      [0, 0], [0.5, 0], [0, 0.5],  // Cluster 1
      [10, 10], [10.5, 10], [10, 10.5],  // Cluster 2
    ];
    const result = dbscan(points, 1.5, 2);
    expect(result.clusterCount).toBe(2);
    expect(result.noise.length).toBe(0);

    // Same cluster assignments for nearby points
    expect(result.assignments[0]).toBe(result.assignments[1]);
    expect(result.assignments[3]).toBe(result.assignments[4]);
    expect(result.assignments[0]).not.toBe(result.assignments[3]);
  });

  test('identifies noise points', () => {
    const points = [
      [0, 0], [0.5, 0], [0, 0.5],  // Cluster
      [100, 100],  // Noise
    ];
    const result = dbscan(points, 1.5, 2);
    expect(result.noise.length).toBe(1);
    expect(result.noise[0]).toBe(3);
    expect(result.assignments[3]).toBe(-1);
  });

  test('all noise when minPoints is very high', () => {
    const points = [[0, 0], [1, 1], [2, 2]];
    const result = dbscan(points, 0.5, 100);
    expect(result.clusterCount).toBe(0);
    expect(result.noise.length).toBe(3);
  });

  test('single cluster when epsilon is large', () => {
    const points = [[0, 0], [1, 1], [2, 2], [3, 3]];
    const result = dbscan(points, 100, 2);
    expect(result.clusterCount).toBe(1);
    expect(result.noise.length).toBe(0);
  });

  test('throws on empty points', () => {
    expect(() => dbscan([], 1, 2)).toThrow();
  });

  test('cosine distance metric works', () => {
    const points = [[1, 0], [0.9, 0.1], [0, 1], [0.1, 0.9]];
    const result = dbscan(points, 0.2, 2, { distanceMetric: 'cosine' });
    expect(result.clusterCount).toBeGreaterThanOrEqual(1);
  });
});
