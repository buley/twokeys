import { describe, expect, test } from 'bun:test';
import {
  cosineSimilarity,
  squaredEuclideanDistance,
  euclideanDistance,
  manhattanDistance,
  mahalanobisDistance,
  normalizeL2,
  cosineSimilaritySparse,
  jaccardSimilarity,
  overlapCoefficient,
} from './distance';

describe('cosineSimilarity', () => {
  test('identical vectors return 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  test('opposite vectors return -1', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 10);
  });

  test('orthogonal vectors return 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  test('empty vectors return 0', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  test('zero vector returns 0', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });

  test('different-length vectors use min length', () => {
    // [1,2] vs [1,2] portion of [1,2,3]
    const result = cosineSimilarity([1, 2], [1, 2, 3]);
    expect(result).toBeCloseTo(1, 10);
  });
});

describe('squaredEuclideanDistance', () => {
  test('same point returns 0', () => {
    expect(squaredEuclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  test('known distance', () => {
    expect(squaredEuclideanDistance([0, 0], [3, 4])).toBe(25);
  });

  test('empty vectors return 0', () => {
    expect(squaredEuclideanDistance([], [])).toBe(0);
  });
});

describe('euclideanDistance', () => {
  test('3-4-5 triangle', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5, 10);
  });

  test('same point returns 0', () => {
    expect(euclideanDistance([1, 2], [1, 2])).toBe(0);
  });
});

describe('manhattanDistance', () => {
  test('known distance', () => {
    expect(manhattanDistance([0, 0], [3, 4])).toBe(7);
  });

  test('same point returns 0', () => {
    expect(manhattanDistance([1, 2], [1, 2])).toBe(0);
  });
});

describe('mahalanobisDistance', () => {
  test('point at the mean returns 0', () => {
    expect(mahalanobisDistance([1, 2], [1, 2], [1, 1])).toBe(0);
  });

  test('known distance with unit variance', () => {
    const d = mahalanobisDistance([2, 2], [0, 0], [1, 1]);
    expect(d).toBeCloseTo(Math.sqrt(8), 5);
  });

  test('higher variance reduces distance', () => {
    const d1 = mahalanobisDistance([2, 0], [0, 0], [1, 1]);
    const d2 = mahalanobisDistance([2, 0], [0, 0], [4, 1]);
    expect(d2).toBeLessThan(d1);
  });

  test('empty vectors return 0', () => {
    expect(mahalanobisDistance([], [], [])).toBe(0);
  });

  test('epsilon prevents division by zero', () => {
    const d = mahalanobisDistance([1], [0], [0], 1e-8);
    expect(Number.isFinite(d)).toBe(true);
    expect(d).toBeGreaterThan(0);
  });
});

describe('normalizeL2', () => {
  test('unit vector stays the same', () => {
    const result = normalizeL2([1, 0, 0]);
    expect(result[0]).toBeCloseTo(1, 10);
    expect(result[1]).toBeCloseTo(0, 10);
    expect(result[2]).toBeCloseTo(0, 10);
  });

  test('result has magnitude 1', () => {
    const result = normalizeL2([3, 4]);
    const mag = Math.sqrt(result[0] * result[0] + result[1] * result[1]);
    expect(mag).toBeCloseTo(1, 10);
  });

  test('zero vector returns zero vector', () => {
    const result = normalizeL2([0, 0, 0]);
    expect(result).toEqual([0, 0, 0]);
  });
});

describe('cosineSimilaritySparse', () => {
  test('identical maps return 1', () => {
    const a = new Map([['x', 1], ['y', 2]]);
    const result = cosineSimilaritySparse(a, a);
    expect(result).toBeCloseTo(1, 10);
  });

  test('disjoint keys return 0', () => {
    const a = new Map([['x', 1]]);
    const b = new Map([['y', 1]]);
    expect(cosineSimilaritySparse(a, b)).toBe(0);
  });

  test('empty map returns 0', () => {
    const a = new Map<string, number>();
    const b = new Map([['x', 1]]);
    expect(cosineSimilaritySparse(a, b)).toBe(0);
  });
});

describe('jaccardSimilarity', () => {
  test('identical sets return 1', () => {
    const s = new Set([1, 2, 3]);
    expect(jaccardSimilarity(s, s)).toBe(1);
  });

  test('disjoint sets return 0', () => {
    expect(jaccardSimilarity(new Set([1, 2]), new Set([3, 4]))).toBe(0);
  });

  test('partial overlap', () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    // intersection = {2,3} = 2, union = {1,2,3,4} = 4
    expect(jaccardSimilarity(a, b)).toBeCloseTo(0.5, 10);
  });

  test('empty set returns 0', () => {
    expect(jaccardSimilarity(new Set(), new Set([1]))).toBe(0);
  });

  test('string sets', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    expect(jaccardSimilarity(a, b)).toBeCloseTo(0.5, 10);
  });
});

describe('overlapCoefficient', () => {
  test('subset returns 1', () => {
    const a = new Set([1, 2]);
    const b = new Set([1, 2, 3, 4]);
    expect(overlapCoefficient(a, b)).toBe(1);
  });

  test('disjoint sets return 0', () => {
    expect(overlapCoefficient(new Set([1]), new Set([2]))).toBe(0);
  });

  test('empty set returns 0', () => {
    expect(overlapCoefficient(new Set(), new Set([1]))).toBe(0);
  });
});
