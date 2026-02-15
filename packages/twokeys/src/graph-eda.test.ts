import { describe, expect, test } from 'bun:test';
import {
  clusteringCoefficient,
  graphEda,
  graphOutliers,
} from './graph-eda';

const triangle = {
  nodes: ['A', 'B', 'C'] as const,
  edges: [
    { from: 'A' as const, to: 'B' as const },
    { from: 'B' as const, to: 'C' as const },
    { from: 'A' as const, to: 'C' as const },
  ],
};

const star = {
  nodes: ['center', 'a', 'b', 'c', 'd'] as const,
  edges: [
    { from: 'center' as const, to: 'a' as const },
    { from: 'center' as const, to: 'b' as const },
    { from: 'center' as const, to: 'c' as const },
    { from: 'center' as const, to: 'd' as const },
  ],
};

describe('clusteringCoefficient', () => {
  test('triangle has coefficient 1 for all nodes', () => {
    const cc = clusteringCoefficient(
      [...triangle.nodes],
      triangle.edges,
      { directed: false },
    );
    for (const node of triangle.nodes) {
      expect(cc.get(node)).toBeCloseTo(1, 5);
    }
  });

  test('star center has coefficient 0 (no edges between leaves)', () => {
    const cc = clusteringCoefficient(
      [...star.nodes],
      star.edges,
      { directed: false },
    );
    expect(cc.get('center')).toBe(0);
  });

  test('isolated node has coefficient 0', () => {
    const cc = clusteringCoefficient(['X'], [], { directed: false });
    expect(cc.get('X')).toBe(0);
  });

  test('node with one neighbor has coefficient 0', () => {
    const cc = clusteringCoefficient(
      ['A', 'B'],
      [{ from: 'A', to: 'B' }],
      { directed: false },
    );
    expect(cc.get('A')).toBe(0);
    expect(cc.get('B')).toBe(0);
  });
});

describe('graphEda', () => {
  test('triangle graph basic properties', () => {
    const result = graphEda([...triangle.nodes], triangle.edges, {
      directed: false,
    });
    expect(result.nodeCount).toBe(3);
    expect(result.edgeCount).toBe(3);
    // density for 3 nodes undirected: 3 / 3 = 1
    expect(result.density).toBeCloseTo(1, 5);
    expect(result.globalClusteringCoefficient).toBeCloseTo(1, 5);
    expect(result.diameter).toBeGreaterThanOrEqual(1);
  });

  test('star graph properties', () => {
    const result = graphEda([...star.nodes], star.edges, {
      directed: false,
    });
    expect(result.nodeCount).toBe(5);
    expect(result.edgeCount).toBe(4);
    // Global CC should be low (center=0, leaves=0)
    expect(result.globalClusteringCoefficient).toBe(0);
  });

  test('directed graph has reciprocity 0 when no reverse edges', () => {
    const result = graphEda(
      ['A', 'B'],
      [{ from: 'A', to: 'B' }],
      { directed: true },
    );
    expect(result.reciprocity).toBe(0);
  });

  test('directed graph reciprocity 1 when all edges are reciprocated', () => {
    const result = graphEda(
      ['A', 'B'],
      [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'A' },
      ],
      { directed: true },
    );
    expect(result.reciprocity).toBe(1);
  });

  test('empty graph', () => {
    const result = graphEda([], [], { directed: false });
    expect(result.nodeCount).toBe(0);
    expect(result.edgeCount).toBe(0);
    expect(result.density).toBe(0);
  });

  test('degree distribution has correct mean', () => {
    const result = graphEda([...triangle.nodes], triangle.edges, {
      directed: false,
    });
    // Each node in a triangle has degree 2
    expect(result.degreeDistribution.summary.mean).toBeCloseTo(2, 5);
  });
});

describe('graphOutliers', () => {
  test('star center is a degree outlier', () => {
    // Center has degree 4 while leaves have degree 1
    const result = graphOutliers([...star.nodes], star.edges, {
      method: 'degree',
      threshold: 1.5,
    });
    const centerOutlier = result.find((r) => r.nodeId === 'center');
    expect(centerOutlier).toBeDefined();
  });

  test('uniform graph has no outliers', () => {
    // Triangle: all nodes have degree 2
    const result = graphOutliers([...triangle.nodes], triangle.edges, {
      method: 'degree',
      threshold: 1.5,
    });
    expect(result.length).toBe(0);
  });

  test('combined method works', () => {
    const result = graphOutliers([...star.nodes], star.edges, {
      method: 'combined',
      threshold: 1.5,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
