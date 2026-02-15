# Twokeys

> Exploratory data analysis for graphs, vectors, and series — named after **John Tukey**, the legendary statistician who pioneered EDA.

[![CI](https://github.com/buley/twokeys/actions/workflows/ci.yml/badge.svg)](https://github.com/buley/twokeys/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/twokeys.svg)](https://www.npmjs.com/package/twokeys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## About John Tukey

John Wilder Tukey (1915–2000) revolutionized how we look at data. He invented the box plot, coined the terms "bit" and "software," and championed the idea that **looking at data** is just as important as modeling it. His book *Exploratory Data Analysis* (1977) changed statistics forever.

This library is named after him — a founding mind in [data exploration and analysis](http://en.wikipedia.org/wiki/Exploratory_data_analysis) and a personal hero of the author.

## Features

### Graph EDA (v3)
- **Graph structural analysis**: Treat degree distributions, clustering coefficients, and centrality scores as data series — then apply Tukey-style EDA to them
- **Graph outlier detection**: Find structurally unusual nodes via Tukey fences on graph metrics
- **25+ graph algorithms**: Centrality (degree, closeness, betweenness, PageRank), community detection (Louvain, label propagation), shortest paths (Dijkstra, A*, Yen's k-shortest), max flow, topological sort, SCCs, MST, articulation points
- **Clustering**: k-means (with automatic k via elbow/silhouette), hierarchical (single, complete, average, Ward linkage), DBSCAN
- **GDS-style catalog**: Neo4j-inspired named graph projections with multi-step analysis pipelines

### Distance & Similarity
- **Dense vectors**: Cosine similarity, Euclidean, Manhattan, Mahalanobis distance, L2 normalization
- **Sparse vectors**: Cosine similarity for `Map<string, number>` representations
- **Set operations**: Jaccard similarity, overlap coefficient

### Multivariate Analysis (Points)
- Covariance and correlation matrices
- Mahalanobis distance and outlier detection
- Per-dimension Series analysis
- L2 and z-score normalization

### 1D EDA (Series)
- **Summary statistics**: Mean, median, mode, trimean, variance, standard deviation, skewness, kurtosis
- **Outlier detection**: Tukey fences (inner and outer)
- **Letter values**: Extended quartiles (eighths, sixteenths, etc.)
- **Stem-and-leaf**: Text-based distribution visualization
- **Smoothing**: Hanning filter, Tukey's 3RSSH, exponential moving average
- **Transforms**: Log, square root, reciprocal, z-score

### Infrastructure
- **WASM support**: Optional WebAssembly acceleration with automatic TypeScript fallback
- **MCP server**: Expose statistical tools to AI assistants via Model Context Protocol
- **Interactive playground**: React app for exploring features and benchmarking
- **Zero dependencies**: Core library is pure TypeScript
- **Runtime validation**: Shared Zod schemas across the ecosystem

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`twokeys`](./packages/twokeys) | 3.0.0 | Core library — Series, Points, graph EDA, graph algorithms, distance, clustering, GDS catalog |
| [`@buley/twokeys-wasm`](./packages/wasm) | 2.0.0 | AssemblyScript WASM implementation of core statistical functions with TypeScript fallback |
| [`@buley/twokeys-types`](./packages/types) | 2.0.0 | Shared Zod schemas for runtime validation and TypeScript types |

## Apps

| App | Description |
|-----|-------------|
| [`@twokeys/playground`](./apps/playground) | Interactive React + Vite web app for exploring Twokeys features, visualizing analyses, and benchmarking WASM vs TypeScript |
| [`@buley/twokeys-mcp`](./apps/mcp-server) | MCP server exposing 15 statistical tools (analyze, median, outliers, fences, smoothing, etc.) to AI assistants |

## Installation

```bash
npm install twokeys
# or
bun add twokeys
# or
yarn add twokeys
```

For WASM acceleration (optional):

```bash
npm install @buley/twokeys-wasm
```

## Quick Start

### 1D Exploratory Data Analysis

```typescript
import { Series } from 'twokeys';

const series = new Series({ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100] });

console.log(series.mean());      // 14.5
console.log(series.median());    // { datum: 5.5, depth: 5.5 }
console.log(series.trimean());   // Tukey's trimean
console.log(series.outliers());  // [100]

const desc = series.describe();  // Full EDA report
```

### Graph EDA

```typescript
import { graphEda, graphOutliers } from 'twokeys';

const nodes = ['a', 'b', 'c', 'd', 'e'];
const edges = [
  { source: 'a', target: 'b' },
  { source: 'a', target: 'c' },
  { source: 'a', target: 'd' },
  { source: 'b', target: 'c' },
  { source: 'd', target: 'e' },
];

const eda = graphEda(nodes, edges);
// Returns Tukey-style analysis of graph structure:
//   density, degree distribution (as SeriesDescription),
//   clustering coefficients, average path length, diameter,
//   degree assortativity, and more

const unusual = graphOutliers(nodes, edges);
// Nodes with structurally unusual degree or clustering
```

### Graph Algorithms

```typescript
import {
  pageRank,
  louvainCommunities,
  shortestPath,
  betweennessCentrality,
  kMeansClustering,
  dbscan,
} from 'twokeys';

// PageRank
const ranks = pageRank(nodes, edges);

// Community detection
const communities = louvainCommunities(nodes, edges);

// Shortest path (Dijkstra)
const path = shortestPath(nodes, edges, 'a', 'e');

// Clustering
const clusters = kMeansClustering(points, 3);
const densityClusters = dbscan(points, 0.5, 5);
```

### GDS-Style Catalog

```typescript
import { createGraphCatalog } from 'twokeys';

const catalog = createGraphCatalog<string>();

catalog.project('social', nodes, edges);

const pr = catalog.pageRank('social', { dampingFactor: 0.85 });
const communities = catalog.louvain('social');

// Multi-step pipelines
const results = catalog.runPipeline('social', [
  { algorithm: 'pageRank' },
  { algorithm: 'louvain' },
]);
```

### Distance & Similarity

```typescript
import { cosineSimilarity, euclideanDistance, jaccardSimilarity } from 'twokeys';

const sim = cosineSimilarity([1, 2, 3], [4, 5, 6]);
const dist = euclideanDistance([0, 0], [3, 4]); // 5

const setA = new Set(['a', 'b', 'c']);
const setB = new Set(['b', 'c', 'd']);
const jaccard = jaccardSimilarity(setA, setB); // 0.5
```

### Multivariate Analysis

```typescript
import { Points } from 'twokeys';

const points = new Points({ data: [[1, 2], [3, 4], [5, 6], [100, 200]] });

points.covarianceMatrix();
points.correlationMatrix();
points.outliersByMahalanobis(); // Multivariate outlier detection
points.describe();              // Full multivariate EDA
```

### Using WASM (Optional)

```typescript
import { loadWasm, analyze, isWasmLoaded } from '@buley/twokeys-wasm';

await loadWasm();
console.log(isWasmLoaded()); // true if WASM loaded

const result = analyze([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
console.log(result.summary.outliers); // [100]
```

## API

### Series

1-dimensional exploratory data analysis.

```typescript
import { Series } from 'twokeys';
const series = new Series({ data: [1, 2, 3, 4, 5] });
```

| Category | Methods |
|----------|---------|
| **Statistics** | `mean()`, `median()`, `mode()`, `trimean()`, `variance()`, `stddev()`, `skewness()`, `kurtosis()` |
| **Dispersion** | `extremes()`, `hinges()`, `iqr()`, `fences()`, `outer()` |
| **Outliers** | `outliers()`, `inside()`, `outside()`, `adjacent()` |
| **Smoothing** | `hanning()`, `smooth()`, `rough()`, `ema()` |
| **Transforms** | `logs()`, `roots()`, `inverse()`, `zscore()` |
| **Visualization** | `stemLeaf()`, `letterValues()`, `midSummaries()` |
| **Ordering** | `sorted()`, `ranked()`, `counts()`, `binned()` |
| **Full report** | `describe()` |

### Points

Multivariate (n-dimensional) data analysis.

```typescript
import { Points } from 'twokeys';
const points = new Points({ data: [[1, 2], [3, 4], [5, 6]] });
```

| Category | Methods |
|----------|---------|
| **Statistics** | `centroid()`, `variances()`, `standardDeviations()` |
| **Matrices** | `covarianceMatrix()`, `correlationMatrix()` |
| **Outliers** | `mahalanobis()`, `mahalanobisAll()`, `outliersByMahalanobis()` |
| **Normalization** | `normalizeL2()`, `normalizeZscore()` |
| **Full report** | `describe()` |

### Graph EDA

```typescript
import { graphEda, graphOutliers, clusteringCoefficient } from 'twokeys';
```

| Function | Description |
|----------|-------------|
| `graphEda(nodes, edges, options?)` | Full structural EDA: density, degree/clustering distributions as Series, path length, diameter, assortativity, reciprocity |
| `graphOutliers(nodes, edges, options?)` | Structurally unusual nodes via Tukey fences |
| `clusteringCoefficient(nodes, edges, options?)` | Per-node clustering coefficients |

### Graph Algorithms

| Category | Functions |
|----------|-----------|
| **Centrality** | `degreeCentrality()`, `closenessCentrality()`, `betweennessCentrality()`, `pageRank()` |
| **Community** | `louvainCommunities()`, `labelPropagationCommunities()` |
| **Similarity** | `nodeSimilarity()`, `kNearestNeighbors()`, `linkPrediction()` |
| **Paths** | `shortestPath()`, `aStarShortestPath()`, `yenKShortestPaths()`, `allPairsShortestPaths()` |
| **Flow** | `maximumFlow()`, `minCostMaxFlow()` |
| **Structure** | `topologicalSort()`, `stronglyConnectedComponents()`, `weaklyConnectedComponents()`, `minimumSpanningTree()`, `articulationPointsAndBridges()`, `analyzeGraph()` |
| **Clustering** | `kMeansClustering()`, `kMeansAuto()`, `hierarchicalClustering()`, `dbscan()` |
| **TSP** | `travelingSalesmanApprox()` |

### Distance & Similarity

```typescript
import { cosineSimilarity, euclideanDistance, jaccardSimilarity } from 'twokeys';
```

| Function | Description |
|----------|-------------|
| `cosineSimilarity(a, b)` | Cosine similarity for dense vectors [-1, 1] |
| `cosineSimilaritySparse(a, b)` | Cosine similarity for `Map<string, number>` |
| `euclideanDistance(a, b)` | L2 distance |
| `squaredEuclideanDistance(a, b)` | Squared L2 (avoids sqrt) |
| `manhattanDistance(a, b)` | L1 distance |
| `mahalanobisDistance(point, means, variances)` | Diagonal covariance Mahalanobis |
| `normalizeL2(vector)` | Unit vector normalization |
| `jaccardSimilarity(a, b)` | Set intersection / union |
| `overlapCoefficient(a, b)` | Set intersection / min size |

### GDS Catalog

```typescript
import { createGraphCatalog } from 'twokeys';
```

| Method | Description |
|--------|-------------|
| `project(name, nodes, edges)` | Create a named graph projection |
| `drop(name)` | Remove a projection |
| `list()` | List all projections |
| `pageRank(name, options?)` | Run PageRank on a projection |
| `louvain(name, options?)` | Run Louvain community detection |
| `similarity(name, options?)` | Compute node similarity |
| `runPipeline(name, steps)` | Execute multi-step analysis pipeline |

## Benchmarks

Performance on different dataset sizes (operations per second, higher is better):

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

This is an Nx monorepo using Bun.

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run all tests
bun run test

# Dev mode (watch)
bun run dev

# Launch the playground
bun run dev:playground

# Launch the MCP server
bun run dev:mcp
```

## License

MIT

---

*"The best thing about being a statistician is that you get to play in everyone's backyard."* — John Tukey
