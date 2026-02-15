/**
 * Graph EDA — What Tukey Would Have Done With Graphs
 *
 * Treats graph structural properties as data series that deserve
 * full exploratory data analysis treatment.
 */

import { Series } from './index';
import type {
  SeriesDescription,
  GraphNodeInput,
  GraphEdge,
} from './index';

// ── Types ────────────────────────────────────────────────────────────

export interface GraphEdaSummary<NodeId extends string = string> {
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

export interface GraphOutlierResult<NodeId extends string = string> {
  nodeId: NodeId;
  score: number;
  reason: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

function resolveNodeId<NodeId extends string>(
  node: GraphNodeInput<NodeId>,
): NodeId {
  if (typeof node === 'string') return node;
  return node.id;
}

function buildAdjacencyMaps<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  directed: boolean,
): {
  nodeIds: NodeId[];
  outNeighbors: Map<NodeId, Set<NodeId>>;
  inNeighbors: Map<NodeId, Set<NodeId>>;
  edgeSet: Set<string>;
} {
  const nodeIdSet = new Set<NodeId>();
  for (const node of nodes) {
    nodeIdSet.add(resolveNodeId(node));
  }
  for (const edge of edges) {
    nodeIdSet.add(edge.from as NodeId);
    nodeIdSet.add(edge.to as NodeId);
  }

  const nodeIds = Array.from(nodeIdSet).sort();
  const outNeighbors = new Map<NodeId, Set<NodeId>>();
  const inNeighbors = new Map<NodeId, Set<NodeId>>();
  const edgeSet = new Set<string>();

  for (const id of nodeIds) {
    outNeighbors.set(id, new Set());
    inNeighbors.set(id, new Set());
  }

  for (const edge of edges) {
    const from = edge.from as NodeId;
    const to = edge.to as NodeId;
    outNeighbors.get(from)?.add(to);
    inNeighbors.get(to)?.add(from);
    edgeSet.add(`${from}\0${to}`);

    if (!directed) {
      outNeighbors.get(to)?.add(from);
      inNeighbors.get(from)?.add(to);
      edgeSet.add(`${to}\0${from}`);
    }
  }

  return { nodeIds, outNeighbors, inNeighbors, edgeSet };
}

// ── Clustering Coefficient ───────────────────────────────────────────

/**
 * Compute the local clustering coefficient for each node.
 * For undirected graphs: the fraction of pairs of neighbors that are connected.
 * For directed graphs: uses the total number of directed triangles.
 */
export function clusteringCoefficient<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: { directed?: boolean } = {},
): Map<NodeId, number> {
  const directed = options.directed ?? false;
  const { nodeIds, outNeighbors, edgeSet } = buildAdjacencyMaps(
    nodes,
    edges,
    directed,
  );

  const result = new Map<NodeId, number>();

  for (const nodeId of nodeIds) {
    const neighbors = outNeighbors.get(nodeId)!;
    const k = neighbors.size;

    if (k < 2) {
      result.set(nodeId, 0);
      continue;
    }

    const neighborArr = Array.from(neighbors);
    let triangles = 0;

    for (let i = 0; i < neighborArr.length; i += 1) {
      for (let j = i + 1; j < neighborArr.length; j += 1) {
        const a = neighborArr[i];
        const b = neighborArr[j];
        if (directed) {
          if (edgeSet.has(`${a}\0${b}`)) triangles += 1;
          if (edgeSet.has(`${b}\0${a}`)) triangles += 1;
        } else {
          if (edgeSet.has(`${a}\0${b}`) || edgeSet.has(`${b}\0${a}`)) {
            triangles += 1;
          }
        }
      }
    }

    const maxTriangles = directed ? k * (k - 1) : (k * (k - 1)) / 2;
    result.set(nodeId, maxTriangles > 0 ? triangles / maxTriangles : 0);
  }

  return result;
}

// ── Graph EDA ────────────────────────────────────────────────────────

/**
 * Full exploratory data analysis of a graph's structural properties.
 * Returns distributions as Series descriptions for full Tukey-style EDA.
 */
export function graphEda<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: {
    directed?: boolean;
    samplePathLength?: number;
  } = {},
): GraphEdaSummary<NodeId> {
  const directed = options.directed ?? false;
  const { nodeIds, outNeighbors, inNeighbors, edgeSet } = buildAdjacencyMaps(
    nodes,
    edges,
    directed,
  );

  const nodeCount = nodeIds.length;
  const edgeCount = edges.length;

  // Density
  const maxEdges = directed
    ? nodeCount * (nodeCount - 1)
    : (nodeCount * (nodeCount - 1)) / 2;
  const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

  // Degree distributions
  const degrees: number[] = [];
  const inDegrees: number[] = [];
  const outDegrees: number[] = [];

  for (const nodeId of nodeIds) {
    const outDeg = outNeighbors.get(nodeId)?.size ?? 0;
    const inDeg = inNeighbors.get(nodeId)?.size ?? 0;
    outDegrees.push(outDeg);
    inDegrees.push(inDeg);
    degrees.push(directed ? outDeg + inDeg : outDeg);
  }

  const degreeSeries = new Series({ data: degrees });
  const inDegreeSeries = new Series({ data: inDegrees });
  const outDegreeSeries = new Series({ data: outDegrees });

  // Clustering coefficients
  const cc = clusteringCoefficient(nodes, edges, { directed });
  const ccValues = Array.from(cc.values());
  const globalCC =
    ccValues.length > 0
      ? ccValues.reduce((a, b) => a + b, 0) / ccValues.length
      : 0;
  const ccSeries = new Series({ data: ccValues.length > 0 ? ccValues : [0] });

  // Reciprocity (fraction of edges with a reverse edge)
  let reciprocalCount = 0;
  if (directed) {
    for (const edge of edges) {
      if (edgeSet.has(`${edge.to}\0${edge.from}`)) {
        reciprocalCount += 1;
      }
    }
  }
  const reciprocity = directed && edgeCount > 0
    ? reciprocalCount / edgeCount
    : directed
      ? 0
      : 1;

  // BFS-based path length sampling
  const sampleSize = Math.min(
    nodeCount,
    options.samplePathLength ?? Math.min(nodeCount, 50),
  );
  let totalPathLength = 0;
  let pathCount = 0;
  let diameter = 0;

  // Sample nodes deterministically
  const sampleStep = Math.max(1, Math.floor(nodeCount / sampleSize));
  for (let si = 0; si < nodeCount && si / sampleStep < sampleSize; si += sampleStep) {
    const source = nodeIds[si];
    // BFS from source
    const dist = new Map<NodeId, number>();
    dist.set(source, 0);
    const queue: NodeId[] = [source];
    let qi = 0;

    while (qi < queue.length) {
      const current = queue[qi];
      qi += 1;
      const currentDist = dist.get(current)!;
      const neighbors = outNeighbors.get(current) ?? new Set<NodeId>();

      for (const neighbor of neighbors) {
        if (!dist.has(neighbor)) {
          const d = currentDist + 1;
          dist.set(neighbor, d);
          queue.push(neighbor);
          totalPathLength += d;
          pathCount += 1;
          if (d > diameter) diameter = d;
        }
      }
    }
  }

  const averagePathLength = pathCount > 0 ? totalPathLength / pathCount : 0;

  // Degree assortativity: Pearson correlation of degrees at edge endpoints
  let assortativity = 0;
  if (edges.length > 1) {
    const sourceDegrees: number[] = [];
    const targetDegrees: number[] = [];
    for (const edge of edges) {
      sourceDegrees.push(outNeighbors.get(edge.from as NodeId)?.size ?? 0);
      targetDegrees.push(outNeighbors.get(edge.to as NodeId)?.size ?? 0);
    }
    const n = sourceDegrees.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i += 1) {
      sumX += sourceDegrees[i];
      sumY += targetDegrees[i];
      sumXY += sourceDegrees[i] * targetDegrees[i];
      sumX2 += sourceDegrees[i] * sourceDegrees[i];
      sumY2 += targetDegrees[i] * targetDegrees[i];
    }
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );
    assortativity = denominator > 0 ? numerator / denominator : 0;
  }

  return {
    nodeCount,
    edgeCount,
    density,
    degreeDistribution: degreeSeries.describe(),
    inDegreeDistribution: inDegreeSeries.describe(),
    outDegreeDistribution: outDegreeSeries.describe(),
    clusteringCoefficients: cc,
    globalClusteringCoefficient: globalCC,
    clusteringDistribution: ccSeries.describe(),
    averagePathLength,
    diameter,
    reciprocity,
    degreeAssortativity: assortativity,
  };
}

// ── Graph Outliers ───────────────────────────────────────────────────

/**
 * Graph-based outlier detection: nodes with unusual structural signatures.
 */
export function graphOutliers<NodeId extends string>(
  nodes: GraphNodeInput<NodeId>[],
  edges: GraphEdge<NodeId>[],
  options: {
    method?: 'degree' | 'clustering' | 'combined';
    threshold?: number;
  } = {},
): GraphOutlierResult<NodeId>[] {
  const method = options.method ?? 'combined';
  const threshold = options.threshold ?? 2.0;
  const directed = false;
  const { nodeIds, outNeighbors } = buildAdjacencyMaps(nodes, edges, directed);

  const results: GraphOutlierResult<NodeId>[] = [];

  if (method === 'degree' || method === 'combined') {
    const degrees = nodeIds.map((id) => outNeighbors.get(id)?.size ?? 0);
    const degreeSeries = new Series({ data: degrees });
    const mean = degreeSeries.mean();
    const std = degreeSeries.stddev();

    if (std > 0) {
      for (let i = 0; i < nodeIds.length; i += 1) {
        const zscore = Math.abs(degrees[i] - mean) / std;
        if (zscore > threshold) {
          results.push({
            nodeId: nodeIds[i],
            score: zscore,
            reason: `degree outlier (z=${zscore.toFixed(2)}, degree=${degrees[i]})`,
          });
        }
      }
    }
  }

  if (method === 'clustering' || method === 'combined') {
    const cc = clusteringCoefficient(nodes, edges, { directed });
    const ccValues = Array.from(cc.values());
    const ccSeries = new Series({ data: ccValues.length > 0 ? ccValues : [0] });
    const mean = ccSeries.mean();
    const std = ccSeries.stddev();

    if (std > 0) {
      let i = 0;
      for (const nodeId of nodeIds) {
        const value = cc.get(nodeId) ?? 0;
        const zscore = Math.abs(value - mean) / std;
        if (zscore > threshold) {
          // Avoid duplicates in combined mode
          const existing = results.find((r) => r.nodeId === nodeId);
          if (existing) {
            existing.score = Math.max(existing.score, zscore);
            existing.reason += `; clustering outlier (z=${zscore.toFixed(2)}, cc=${value.toFixed(3)})`;
          } else {
            results.push({
              nodeId,
              score: zscore,
              reason: `clustering outlier (z=${zscore.toFixed(2)}, cc=${value.toFixed(3)})`,
            });
          }
        }
        i += 1;
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
