# Twokeys

> A small data exploration and manipulation library, named after **John Tukey** — the legendary statistician who pioneered exploratory data analysis (EDA).

[![CI](https://github.com/buley/twokeys/actions/workflows/ci.yml/badge.svg)](https://github.com/buley/twokeys/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/twokeys.svg)](https://www.npmjs.com/package/twokeys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## About John Tukey

John Wilder Tukey (1915–2000) revolutionized how we look at data. He invented the box plot, coined the terms "bit" and "software," and championed the idea that **looking at data** is just as important as modeling it. His book *Exploratory Data Analysis* (1977) changed statistics forever.

This library is named after him — a founding mind in [data exploration and analysis](http://en.wikipedia.org/wiki/Exploratory_data_analysis) and a personal hero of the author.

## Features

- **Summary Statistics**: Mean, median, mode, trimean, quartiles (hinges)
- **Outlier Detection**: Tukey fences (inner and outer)
- **Letter Values**: Extended quartiles (eighths, sixteenths, etc.)
- **Stem-and-Leaf**: Text-based distribution visualization
- **Ranking**: Full ranking with tie handling
- **Binning**: Histogram-style grouping
- **Smoothing**: Hanning filter, Tukey's 3RSSH smoothing
- **Transforms**: Logarithms, square roots, reciprocals
- **WASM Support**: Optional WebAssembly for maximum performance
- **Zero Dependencies**: Pure TypeScript, works everywhere
- **Tiny**: <3KB minified and gzipped

## Packages

| Package | Description |
|---------|-------------|
| `twokeys` | Core TypeScript library |
| `@buley/twokeys-wasm` | WebAssembly implementation with TypeScript fallback |
| `@buley/twokeys-types` | Shared Zod schemas for runtime validation |

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

```typescript
import { Series } from 'twokeys';

// Create a series from your data
const series = new Series({ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100] });

// Get summary statistics
console.log(series.mean());      // 14.5
console.log(series.median());    // { datum: 5.5, depth: 5.5 }
console.log(series.trimean());   // Tukey's trimean

// Detect outliers (using Tukey fences)
console.log(series.outliers());  // [100]

// Get a full description
const desc = series.describe();
console.log(desc.summary);
```

### Using WASM (Optional)

```typescript
import { loadWasm, analyze, isWasmLoaded } from '@buley/twokeys-wasm';

// Load WASM (falls back to TypeScript if unavailable)
await loadWasm();

console.log(isWasmLoaded()); // true if WASM loaded

// Use the same API - automatically uses WASM when available
const result = analyze([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
console.log(result.summary.outliers); // [100]
```

## Benchmarks

Performance on different dataset sizes (operations per second, higher is better):

### TypeScript Implementation

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

### v2.0 Performance Improvements

Compared to v1.x (CoffeeScript), v2.0 TypeScript is dramatically faster:

| Method | v1.x (10K) | v2.0 (10K) | Improvement |
|--------|------------|------------|-------------|
| `median()` | 6 ops/sec | 876 ops/sec | **146x faster** |
| `counts()` | 1 ops/sec | 606 ops/sec | **606x faster** |
| `fences()` | 5 ops/sec | 864 ops/sec | **173x faster** |
| `describe()` | 1 ops/sec | 29 ops/sec | **29x faster** |

Key optimizations:
- O(1) index-based median (was O(n²) recursive)
- Map-based frequency counting (was O(n²) recursive)
- Eliminated unnecessary array copying in smoothing

## Example Output

Applying `describe()` to a Series returns a complete analysis:

```javascript
const series = new Series({ data: [48, 59, 63, 30, 57, 92, 73, 47, 31, 5] });
const analysis = series.describe();

// Result:
{
  "original": [48, 59, 63, 30, 57, 92, 73, 47, 31, 5],
  "summary": {
    "median": { "datum": 52.5, "depth": 5.5 },
    "mean": 50.5,
    "hinges": [{ "datum": 31, "depth": 3 }, { "datum": 63, "depth": 8 }],
    "adjacent": [30, 92],
    "outliers": [],
    "extremes": [5, 92],
    "iqr": 32,
    "fences": [4.5, 100.5]
  },
  "smooths": {
    "smooth": [48, 30, 57, 57, 57, 47, 31, 5, 5, 5],
    "hanning": [48, 61, 46.5, 43.5, 74.5, 82.5, 60, 39, 18, 5]
  },
  "transforms": {
    "logs": [3.87, 4.08, 4.14, ...],
    "roots": [6.93, 7.68, 7.94, ...],
    "inverse": [0.021, 0.017, 0.016, ...]
  },
  "sorted": [5, 30, 31, 47, 48, 57, 59, 63, 73, 92],
  "ranked": { "up": {...}, "down": {...}, "groups": {...} },
  "binned": { "bins": 4, "width": 26, "binned": {...} }
}
```

## API

### Series

The `Series` class provides methods for exploring 1-dimensional numerical data.

```typescript
import { Series } from 'twokeys';

const series = new Series({ data: [1, 2, 3, 4, 5] });
```

#### Summary Statistics

| Method | Description |
|--------|-------------|
| `mean()` | Arithmetic mean |
| `median()` | Median value and depth |
| `mode()` | Most frequent value(s) |
| `trimean()` | Tukey's trimean: (Q1 + 2×median + Q3) / 4 |
| `extremes()` | [min, max] values |
| `hinges()` | Quartile boundaries (Q1, Q3) |
| `iqr()` | Interquartile range |

#### Outlier Detection

| Method | Description |
|--------|-------------|
| `fences()` | Inner fence boundaries (1.5 × IQR) |
| `outer()` | Outer fence boundaries (3 × IQR) |
| `outliers()` | Values outside inner fences |
| `inside()` | Values within fences |
| `outside()` | Values outside outer fences |
| `adjacent()` | Most extreme non-outlier values |

#### Letter Values & Visualization

| Method | Description |
|--------|-------------|
| `letterValues()` | Extended quartiles (M, F, E, D, C, B, A...) |
| `stemLeaf()` | Stem-and-leaf text display |
| `midSummaries()` | Symmetric quantile pair averages |

#### Ranking & Counting

| Method | Description |
|--------|-------------|
| `sorted()` | Sorted copy of data |
| `ranked()` | Rank information with tie handling |
| `counts()` | Frequency of each value |
| `binned()` | Histogram-style bins |

#### Transforms

| Method | Description |
|--------|-------------|
| `logs()` | Natural logarithm of each value |
| `roots()` | Square root of each value |
| `inverse()` | Reciprocal (1/x) of each value |

#### Smoothing

| Method | Description |
|--------|-------------|
| `hanning()` | Hanning filter (running averages) |
| `smooth()` | Tukey's 3RSSH smoothing |
| `rough()` | Residuals (original - smooth) |

#### Full Description

```typescript
series.describe();
// Returns complete analysis including all of the above
```

### Points

The `Points` class handles n-dimensional point data.

```typescript
import { Points } from 'twokeys';

// 100 random 2D points
const points = new Points({ count: 100, dimensionality: 2 });

// Or provide your own data
const myPoints = new Points({ data: [[1, 2], [3, 4], [5, 6]] });
```

### Twokeys

The main class provides factory methods and utilities.

```typescript
import Twokeys from 'twokeys';

// Generate random data
const randomData = Twokeys.randomSeries(100, 50);  // 100 values, max 50
const randomPoints = Twokeys.randomPoints(50, 3);  // 50 3D points

// Access classes
const series = new Twokeys.Series({ data: [1, 2, 3] });
const points = new Twokeys.Points(100);
```

## Examples

### Box Plot Data

```typescript
const series = new Series({ data: myData });

const boxPlot = {
  min: series.extremes()[0],
  q1: series.hinges()[0].datum,
  median: series.median().datum,
  q3: series.hinges()[1].datum,
  max: series.extremes()[1],
  outliers: series.outliers(),
};
```

### Outlier Detection

```typescript
const series = new Series({ data: measurements });

// Inner fences: 1.5 × IQR from hinges
const suspicious = series.outliers();

// Outer fences: 3 × IQR from hinges
const extreme = series.outside();
```

### Letter Values Display

```typescript
const series = new Series({ data: myData });

// Get extended quartiles
const lv = series.letterValues();
// [
//   { letter: 'M', depth: 10.5, lower: 52.5, upper: 52.5, mid: 52.5, spread: 0 },
//   { letter: 'F', depth: 5, lower: 31, upper: 73, mid: 52, spread: 42 },
//   { letter: 'E', depth: 3, lower: 30, upper: 82, mid: 56, spread: 52 },
//   ...
// ]
```

### Stem-and-Leaf Display

```typescript
const series = new Series({ data: myData });

const { display } = series.stemLeaf();
// [
//   "   0 | 5",
//   "   3 | 0 1",
//   "   4 | 7 8",
//   "   5 | 7 9",
//   "   6 | 3",
//   "   7 | 3",
//   "   9 | 2"
// ]
```

### Data Transformation

```typescript
const series = new Series({ data: skewedData });

// Try different transforms to normalize
const logTransformed = series.logs();
const sqrtTransformed = series.roots();
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Build all packages
bun run build

# Run benchmark
bun run bench.ts
```

## License

MIT

---

*"The best thing about being a statistician is that you get to play in everyone's backyard."* — John Tukey
