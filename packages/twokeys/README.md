# Twokeys

**Exploratory data analysis for graphs, vectors, and series** — named after [John Tukey](https://en.wikipedia.org/wiki/John_Tukey), pioneer of EDA.

```
npm install twokeys
```

## Graph Algorithms

| Algorithm | Function | Description |
|---|---|---|
| Topological Sort | `topologicalSort` | Kahn's algorithm with cycle detection |
| PageRank | `pageRank` | Iterative PageRank with configurable damping |
| Degree Centrality | `degreeCentrality` | In/out/total degree with normalization |
| Closeness Centrality | `closenessCentrality` | Classic & harmonic modes |
| Betweenness Centrality | `betweennessCentrality` | Brandes' algorithm |
| Shortest Path | `shortestPath` | Dijkstra & Bellman-Ford |
| A* Search | `aStarShortestPath` | Heuristic-guided shortest path |
| Yen's K-Shortest | `yenKShortestPaths` | K shortest simple paths |
| All-Pairs Shortest | `allPairsShortestPaths` | Floyd-Warshall / repeated SSSP |
| Minimum Spanning Tree | `minimumSpanningTree` | Kruskal's algorithm |
| Articulation & Bridges | `articulationPointsAndBridges` | Cut vertices & bridge edges |
| SCC (Tarjan) | `stronglyConnectedComponents` | Tarjan's algorithm |
| WCC | `weaklyConnectedComponents` | Union-Find based |
| Label Propagation | `labelPropagationCommunities` | Community detection |
| Louvain | `louvainCommunities` | Modularity-optimizing communities |
| Node Similarity | `nodeSimilarity` | Jaccard, overlap, cosine, Adamic-Adar |
| K-Nearest Neighbors | `kNearestNeighbors` | Structural KNN |
| Link Prediction | `predictLinks` | Score potential edges |
| Max Flow | `maximumFlow` | Edmonds-Karp (BFS augmenting paths) |
| Min-Cost Max Flow | `minCostMaxFlow` | SPFA-based cost optimization |
| TSP Approximation | `travelingSalesmanApprox` | Greedy + 2-opt improvement |
| Full Analysis | `analyzeGraph` | All centralities + components in one call |

## Clustering

| Algorithm | Function | Description |
|---|---|---|
| K-Means | `kMeansClustering` | Lloyd's with K-Means++ init, silhouette scoring |
| K-Means Auto | `kMeansAuto` | Automatic K selection via silhouette |
| Hierarchical | `hierarchicalClustering` | Agglomerative with single/complete/average linkage |
| DBSCAN | `dbscan` | Density-based spatial clustering |

## Graph EDA

Tukey-style exploratory data analysis applied to graph structure:

```ts
import { graphEda } from 'twokeys';

const summary = graphEda(nodes, edges, { directed: true });
// Returns degree distributions as Series descriptions,
// clustering coefficients, diameter, reciprocity, assortativity
```

## Series & Points (Classic EDA)

```ts
import { Series, Points } from 'twokeys';

const s = new Series({ data: [4, 7, 2, 9, 1, 5, 3] });
s.median();   // { datum: 4, depth: 4 }
s.hinges();   // quartiles
s.outliers(); // Tukey fence outliers
s.smooth();   // 3RSS2H,15 median smoothing
s.describe(); // full summary

const p = new Points({ data: [[1,2], [3,4], [5,6]] });
p.centroid();
p.correlationMatrix();
p.mahalanobisAll();
```

## Distance Functions

```ts
import { euclideanDistance, cosineSimilarity, manhattanDistance } from 'twokeys';
```

## Usage with Graphs

All graph functions accept a node list and edge list:

```ts
import { topologicalSort, pageRank, kMeansClustering, type GraphEdge } from 'twokeys';

const nodes = ['a', 'b', 'c', 'd'];
const edges: GraphEdge[] = [
  { from: 'a', to: 'b', weight: 1 },
  { from: 'b', to: 'c', weight: 2 },
  { from: 'a', to: 'd', weight: 1 },
];

const topo = topologicalSort(nodes, edges);
// { order: ['a', 'b', 'd', 'c'], cycleNodes: [], isDag: true }

const pr = pageRank(nodes, edges, { directed: true });
// pr.byNode.get('c')?.normalized  →  highest rank
```

## License

MIT — Taylor Buley <buley@outlook.com>
