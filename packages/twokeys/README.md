# Twokeys

> Exploratory data analysis for graphs, vectors, and series — named after **John Tukey**, the legendary statistician who pioneered EDA.

[![CI](https://github.com/buley/twokeys/actions/workflows/ci.yml/badge.svg)](https://github.com/buley/twokeys/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/twokeys.svg)](https://www.npmjs.com/package/twokeys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What Is This?

Tukey taught us that **looking at data** is just as important as modeling it. Twokeys applies that philosophy to three domains:

1. **Graph EDA** — Treat structural properties of graphs (degree distributions, clustering coefficients, assortativity) as data series that deserve full Tukey-style analysis
2. **Vector Distance & Similarity** — Cosine similarity, Mahalanobis distance, Jaccard similarity, L2 normalization, and more
3. **Multivariate Analysis** — Centroids, covariance matrices, correlation matrices, and Mahalanobis-based outlier detection via the `Points` class
4. **1D EDA** — The original `Series` class: medians, fences, letter values, stem-and-leaf plots, smoothing, and everything else Tukey invented
5. **Graph Algorithms** — Centrality, community detection, shortest paths, flow, clustering (k-means, hierarchical, DBSCAN), TSP approximation, and a GDS-style catalog

Zero dependencies. Pure TypeScript. Works everywhere.

## Installation

```bash
npm install twokeys
# or
bun add twokeys
```

## Graph EDA

The core insight: graph structural properties ARE data series. Degree distributions get box plots. Clustering coefficients get outlier detection. Assortativity tells you whether your network is stratified.

```typescript
import { graphEda, graphOutliers } from 'twokeys';

const nodes = ['alice', 'bob', 'carol', 'dave', 'eve'] as const;
const edges = [
  { from: 'alice', to: 'bob', weight: 1 },
  { from: 'alice', to: 'carol', weight: 1 },
  { from: 'bob', to: 'carol', weight: 1 },
  { from: 'carol', to: 'dave', weight: 1 },
  { from: 'dave', to: 'eve', weight: 1 },
];

const summary = graphEda(nodes, edges);

// Every structural metric, analyzed as a Tukey Series:
summary.density;                    // edges / maxPossibleEdges
summary.degreeDistribution;         // Full SeriesDescription with median, fences, outliers
summary.clusteringDistribution;     // Clustering coefficients as EDA
summary.globalClusteringCoefficient;
summary.averagePathLength;
summary.diameter;
summary.reciprocity;
summary.degreeAssortativity;        // Do hubs connect to hubs?

// Find structurally unusual nodes
const unusual = graphOutliers(nodes, edges, { method: 'combined' });
// [{ nodeId: 'eve', score: 2.1, reason: 'Low degree + low clustering' }]
```

## Vector Distance & Similarity

Standalone functions for vector math. These are the workhorses that `Points`, graph algorithms, and consumers all use.

```typescript
import {
  cosineSimilarity,
  euclideanDistance,
  manhattanDistance,
  mahalanobisDistance,
  normalizeL2,
  cosineSimilaritySparse,
  jaccardSimilarity,
  overlapCoefficient,
} from 'twokeys';

// Dense vectors
cosineSimilarity([1, 2, 3], [4, 5, 6]);          // 0.974
euclideanDistance([0, 0], [3, 4]);                  // 5
manhattanDistance([0, 0], [3, 4]);                  // 7
normalizeL2([3, 4]);                               // [0.6, 0.8]
mahalanobisDistance([5, 5], [0, 0], [1, 1]);       // 7.07

// Sparse vectors (Map<string, number>)
const a = new Map([['x', 1], ['y', 2]]);
const b = new Map([['y', 3], ['z', 4]]);
cosineSimilaritySparse(a, b);                       // similarity on shared keys

// Set similarity
jaccardSimilarity(new Set([1, 2, 3]), new Set([2, 3, 4]));  // 0.5
overlapCoefficient(new Set([1, 2]), new Set([2, 3, 4]));     // 0.5
```

## Multivariate Analysis (Points)

Full multivariate EDA: centroids, covariance, correlation, Mahalanobis outlier detection.

```typescript
import { Points } from 'twokeys';

const points = new Points({
  data: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [100, 100, 100],  // outlier
  ],
});

points.centroid();              // [28, 28.75, 29.5]
points.variances();             // Per-dimension variance
points.standardDeviations();    // Per-dimension stddev
points.covarianceMatrix();      // Full covariance matrix
points.correlationMatrix();     // Pearson correlation matrix

// Mahalanobis distance — the multivariate equivalent of z-score
points.mahalanobis([50, 50, 50]);   // Distance of a single point
points.mahalanobisAll();             // Distance for each stored point

// Tukey-style outlier detection for multivariate data
points.outliersByMahalanobis();      // [[100, 100, 100]]

// Normalization
points.normalizeL2();     // L2-normalize all points (returns new Points)
points.normalizeZscore(); // Z-score normalize per dimension

// Full description — each dimension analyzed as a Series
const desc = points.describe();
desc.centroid;              // Mean point
desc.correlationMatrix;     // Pearson correlations
desc.mahalanobisDistances;  // Distance from centroid per point
desc.outlierCount;          // How many outliers
desc.dimensionSummaries;    // Each dimension as a full SeriesDescription
```

## 1D Exploratory Data Analysis (Series)

The original Tukey toolkit: everything you need to explore univariate data.

```typescript
import { Series } from 'twokeys';

const series = new Series({ data: [2, 4, 4, 4, 5, 5, 7, 9] });

// Summary statistics
series.mean();       // 5
series.median();     // { datum: 4.5, depth: 4.5 }
series.mode();       // { count: 3, data: [4] }
series.trimean();    // Tukey's trimean

// Dispersion
series.variance();   // Sample variance
series.stddev();     // Standard deviation
series.iqr();        // Interquartile range
series.skewness();   // Fisher-Pearson skewness
series.kurtosis();   // Excess kurtosis

// Outlier detection (Tukey fences)
series.fences();     // Inner fence boundaries (1.5 x IQR)
series.outliers();   // Values outside inner fences
series.outside();    // Values outside outer fences (3 x IQR)

// Time series
series.ema(0.3);     // Exponential moving average
series.zscore();     // Z-score normalization
series.hanning();    // Hanning filter
series.smooth();     // Tukey's 3RSSH smoothing
series.rough();      // Residuals (original - smooth)

// Visualization
series.stemLeaf();     // Stem-and-leaf plot
series.letterValues();  // Extended quartiles (M, F, E, D, C, B, A...)

// Everything at once
series.describe();
```

## Graph Algorithms

Centrality, community detection, shortest paths, flow, clustering, and a GDS-style catalog.

```typescript
import {
  // Centrality
  degreeCentrality,
  closenessCentrality,
  betweennessCentrality,
  pageRank,

  // Community detection
  louvainCommunities,
  labelPropagationCommunities,

  // Similarity & link prediction
  nodeSimilarity,
  kNearestNeighbors,
  linkPrediction,

  // Paths & flow
  shortestPath,
  aStarShortestPath,
  yenKShortestPaths,
  allPairsShortestPaths,
  maximumFlow,
  minCostMaxFlow,

  // Structure
  topologicalSort,
  stronglyConnectedComponents,
  weaklyConnectedComponents,
  minimumSpanningTree,
  articulationPointsAndBridges,
  analyzeGraph,

  // Clustering
  kMeansClustering,
  kMeansAuto,
  hierarchicalClustering,
  dbscan,

  // TSP
  travelingSalesmanApprox,

  // GDS-style catalog
  createGraphCatalog,
} from 'twokeys';
```

### Clustering

```typescript
import { kMeansClustering, hierarchicalClustering, dbscan } from 'twokeys';

const points = [
  [1, 1], [1.5, 2], [3, 4],
  [5, 7], [3.5, 5], [4.5, 5],
  [3.5, 4.5],
];

// k-Means
const km = kMeansClustering(points, 2);

// Hierarchical (single, complete, average, or ward linkage)
const hc = hierarchicalClustering(points, 2, { linkage: 'ward' });
hc.clusters;     // Point indices per cluster
hc.dendrogram;   // Merge history
hc.silhouette;   // Cluster quality score

// DBSCAN — density-based, finds natural shapes, handles noise
const db = dbscan(points, 1.5, 2);
db.clusters;      // Point indices per cluster
db.noise;         // Indices of noise points
db.clusterCount;  // Number of clusters found
```

### GDS-Style Catalog

In-memory graph projections with procedure wrappers and pipelines, inspired by Neo4j GDS.

```typescript
import { createGraphCatalog } from 'twokeys';

const gds = createGraphCatalog<string>();
gds.project('social', nodes, edges, { directed: true });

const rank = gds.pageRank('social');
const pipeline = gds.runPipeline('social', [
  { id: 'rank', kind: 'page-rank' },
  { id: 'sim', kind: 'similarity', options: { metric: 'jaccard' } },
  { id: 'links', kind: 'link-prediction', options: { limit: 10 } },
]);
```

## API Reference

### Distance & Similarity (`distance.ts`)

| Function | Description |
|----------|-------------|
| `cosineSimilarity(a, b)` | Cosine similarity between dense vectors [-1, 1] |
| `euclideanDistance(a, b)` | Euclidean (L2) distance |
| `squaredEuclideanDistance(a, b)` | Squared Euclidean distance (avoids sqrt) |
| `manhattanDistance(a, b)` | Manhattan (L1) distance |
| `mahalanobisDistance(point, means, variances, epsilon?)` | Mahalanobis distance |
| `normalizeL2(vector)` | L2-normalize a vector to unit length |
| `cosineSimilaritySparse(a, b)` | Cosine similarity for sparse vectors (`Map<string, number>`) |
| `jaccardSimilarity(a, b)` | Jaccard index for sets |
| `overlapCoefficient(a, b)` | Overlap coefficient for sets |

### Graph EDA (`graph-eda.ts`)

| Function | Description |
|----------|-------------|
| `graphEda(nodes, edges, options?)` | Full Tukey-style EDA of graph structure |
| `clusteringCoefficient(nodes, edges, options?)` | Per-node clustering coefficients |
| `graphOutliers(nodes, edges, options?)` | Structurally unusual nodes |

### Series

| Category | Methods |
|----------|---------|
| **Statistics** | `mean()`, `median()`, `mode()`, `trimean()`, `variance()`, `stddev()`, `skewness()`, `kurtosis()` |
| **Dispersion** | `extremes()`, `hinges()`, `iqr()`, `fences()`, `outer()` |
| **Outliers** | `outliers()`, `inside()`, `outside()`, `adjacent()` |
| **Time Series** | `ema(alpha)`, `zscore()`, `hanning()`, `smooth()`, `rough()` |
| **Visualization** | `stemLeaf()`, `letterValues()`, `midSummaries()` |
| **Transforms** | `logs()`, `roots()`, `inverse()` |
| **Sorting** | `sorted()`, `ranked()`, `counts()`, `binned()` |

### Points

| Method | Description |
|--------|-------------|
| `centroid()` | Mean point across all dimensions |
| `variances()` | Per-dimension variance |
| `standardDeviations()` | Per-dimension standard deviation |
| `covarianceMatrix()` | Full covariance matrix |
| `correlationMatrix()` | Pearson correlation matrix |
| `mahalanobis(point)` | Mahalanobis distance of a single point from centroid |
| `mahalanobisAll()` | Mahalanobis distance for each stored point |
| `outliersByMahalanobis(threshold?)` | Points with Mahalanobis distance > threshold |
| `normalizeL2()` | L2-normalize all points (returns new Points) |
| `normalizeZscore()` | Z-score normalize per dimension (returns new Points) |
| `describe()` | Full multivariate EDA summary |

### Graph Algorithms

| Category | Functions |
|----------|-----------|
| **Centrality** | `degreeCentrality`, `closenessCentrality`, `betweennessCentrality`, `pageRank` |
| **Community** | `louvainCommunities`, `labelPropagationCommunities` |
| **Similarity** | `nodeSimilarity`, `kNearestNeighbors`, `linkPrediction` |
| **Paths** | `shortestPath`, `aStarShortestPath`, `yenKShortestPaths`, `allPairsShortestPaths` |
| **Flow** | `maximumFlow`, `minCostMaxFlow` |
| **Structure** | `topologicalSort`, `stronglyConnectedComponents`, `weaklyConnectedComponents`, `minimumSpanningTree`, `articulationPointsAndBridges`, `analyzeGraph` |
| **Clustering** | `kMeansClustering`, `kMeansAuto`, `hierarchicalClustering`, `dbscan` |
| **TSP** | `travelingSalesmanApprox` |
| **Catalog** | `createGraphCatalog` — GDS-style projections and pipelines |

## Packages

| Package | Description |
|---------|-------------|
| `twokeys` | Core TypeScript library |
| `@buley/twokeys-wasm` | WebAssembly implementation with TypeScript fallback |
| `@buley/twokeys-types` | Shared Zod schemas for runtime validation |

## Benchmarks

Performance on different dataset sizes (operations per second):

| Method | 100 elements | 1,000 elements | 10,000 elements |
|--------|-------------:|---------------:|----------------:|
| `sorted()` | 224,599 | 14,121 | 874 |
| `median()` | 199,397 | 14,127 | 876 |
| `mean()` | 550,610 | 413,551 | 68,399 |
| `mode()` | 87,665 | 6,738 | 431 |
| `fences()` | 238,486 | 13,270 | 864 |
| `outliers()` | 210,058 | 12,584 | 854 |
| `smooth()` | 61,268 | 1,599 | 31 |
| `describe()` | 15,642 | 952 | 29 |

## Development

```bash
bun install
bun test
bun test --coverage
bun run build
```

## About John Tukey

John Wilder Tukey (1915-2000) revolutionized how we look at data. He invented the box plot, coined the terms "bit" and "software," and championed the idea that looking at data is just as important as modeling it. His book *Exploratory Data Analysis* (1977) changed statistics forever.

This library is named after him — a founding mind in [data exploration and analysis](http://en.wikipedia.org/wiki/Exploratory_data_analysis) and a personal hero of the author.

## License

MIT

---

*"The best thing about being a statistician is that you get to play in everyone's backyard."* — John Tukey
