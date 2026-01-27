# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-01-27

### Major Changes

- **Complete TypeScript rewrite** - Converted entire codebase from CoffeeScript to TypeScript
- **Monorepo architecture** - Restructured as NX 16 workspace with multiple packages
- **WASM implementation** - Added `@twokeys/wasm` for high-performance computing with graceful TypeScript fallback
- **MCP server** - Added `@twokeys/mcp-server` exposing all functions as AI-friendly tools
- **React 19 playground** - Interactive demo app for exploring statistical functions

### New Packages

- `twokeys` - Core TypeScript library (packages/twokeys)
- `@twokeys/types` - Shared Zod schemas for runtime validation (packages/types)
- `@twokeys/wasm` - WebAssembly implementation with TypeScript fallback (packages/wasm)
- `@twokeys/playground` - React 19 interactive demo app (apps/playground)
- `@twokeys/mcp-server` - MCP server for AI assistants (apps/mcp-server)

### New Features

- **Trimean** - `series.trimean()` - Tukey's robust measure: (Q1 + 2×median + Q3) / 4
- **Letter Values** - `series.letterValues()` - Extensions beyond quartiles (eighths, sixteenths, etc.)
- **Stem-and-Leaf** - `series.stemLeaf()` - Text-based distribution visualization
- **Mid-summaries** - `series.midSummaries()` - Averages of symmetric quantile pairs
- **Rough/Residuals** - `series.rough()` - Data minus smooth (exposed as public method)

### Performance Improvements

Benchmarks on 10,000 element arrays:

| Method | Before | After | Improvement |
|--------|--------|-------|-------------|
| `median()` | 154ms | 1.1ms | **140x faster** |
| `counts()` | 822ms | 1.7ms | **480x faster** |
| `fences()` | 221ms | 1.2ms | **184x faster** |
| `smooth()` | 54ms | 36ms | **1.5x faster** |
| `describe()` | 1262ms | 37ms | **34x faster** |

Key optimizations:
- Replaced recursive O(n²) `getMedian()` with O(1) index-based lookup
- Replaced recursive `getCounts()` with Map-based frequency counting
- Removed unnecessary array copying in smooth functions
- Replaced string comparison with direct value comparison

### Bug Fixes

- **`fences()` and `outer()` falsy zero bug** - Functions incorrectly returned empty arrays when median or IQR was 0, due to using `!value` checks which treat 0 as falsy. Fixed by using proper `=== undefined` checks.
- **`fences()` missing median calculation** - Function used `this.data.median` without ensuring `median()` was called first, causing undefined values.
- **`outer()` missing median calculation** - Same issue as `fences()`.
- **`inside()` missing fences calculation** - Called `iqr()` but not `fences()` before using fence values.
- **`outside()` missing outer calculation** - Called `iqr()` but not `outer()` before using outer fence values.
- **Null safety** - Added null/empty array checks before using spread syntax on fences and outer arrays.
- **`mode()` incorrect implementation** - Replaced recursive logic with simple frequency counting.

### Infrastructure

- **NX 16 workspace** - Modern monorepo tooling with caching and dependency graph
- **Bun test runner** - Fast testing with comprehensive coverage
- **tsup bundling** - ESM + CJS dual builds with tree-shaking
- **GitHub Actions CI** - Automated testing and npm publishing
- **Zod schemas** - Runtime validation for all data structures

### MCP Server Tools

The MCP server exposes all Twokeys functionality as AI-friendly tools:

- `analyze` - Complete EDA analysis
- `median`, `mean`, `mode` - Central tendency measures
- `outliers`, `fences` - Outlier detection
- `hinges` - Quartiles with IQR
- `five_number_summary` - Min, Q1, median, Q3, max
- `trimean` - Tukey's robust measure
- `letter_values` - Extended quartiles
- `stem_leaf` - Text visualization
- `ranked`, `binned` - Distribution analysis
- `smooth` - 3RSSH smoothing
- `transform` - Log, sqrt, inverse transforms

---

*"The best thing about being a statistician is that you get to play in everyone's backyard."* — John Tukey
