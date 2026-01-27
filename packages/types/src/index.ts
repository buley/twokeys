/**
 * @twokeys/types - Shared Zod schemas for Twokeys ecosystem
 *
 * Provides runtime validation and TypeScript types for all Twokeys data structures.
 */

import { z } from 'zod';

// =============================================================================
// Series Options
// =============================================================================

export const SeriesOptionsSchema = z.object({
  data: z.array(z.number()).optional(),
});
export type SeriesOptions = z.infer<typeof SeriesOptionsSchema>;

// =============================================================================
// Points Options
// =============================================================================

export const PointsOptionsSchema = z.object({
  data: z.array(z.array(z.number())).optional(),
  dimensionality: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
});
export type PointsOptions = z.infer<typeof PointsOptionsSchema>;

// =============================================================================
// Median Result
// =============================================================================

export const MedianResultSchema = z.object({
  datum: z.number(),
  depth: z.number(),
});
export type MedianResult = z.infer<typeof MedianResultSchema>;

// =============================================================================
// Mode Result
// =============================================================================

export const ModeResultSchema = z.object({
  count: z.number().int().nonnegative(),
  data: z.array(z.number()),
});
export type ModeResult = z.infer<typeof ModeResultSchema>;

// =============================================================================
// Rank Info
// =============================================================================

export const RankInfoSchema = z.object({
  rank: z.number().int().positive(),
  peers: z.number().int().nonnegative(),
});
export type RankInfo = z.infer<typeof RankInfoSchema>;

// =============================================================================
// Ranked Result
// =============================================================================

export const RankedResultSchema = z.object({
  up: z.record(z.string(), RankInfoSchema),
  down: z.record(z.string(), RankInfoSchema),
  groups: z.object({
    up: z.array(z.union([z.number(), z.array(z.number())])),
    down: z.array(z.union([z.number(), z.array(z.number())])),
  }),
});
export type RankedResult = z.infer<typeof RankedResultSchema>;

// =============================================================================
// Binned Result
// =============================================================================

export const BinDataSchema = z.object({
  from: z.number(),
  to: z.number(),
  data: z.array(z.number()),
});
export type BinData = z.infer<typeof BinDataSchema>;

export const BinnedResultSchema = z.object({
  bins: z.number().int().nonnegative(),
  width: z.number(),
  binned: z.record(z.string(), BinDataSchema),
});
export type BinnedResult = z.infer<typeof BinnedResultSchema>;

// =============================================================================
// Series Summary
// =============================================================================

export const SeriesSummarySchema = z.object({
  median: MedianResultSchema,
  mean: z.number(),
  mode: ModeResultSchema,
  hinges: z.array(MedianResultSchema),
  adjacent: z.array(z.number()),
  outliers: z.array(z.number()),
  outer: z.array(z.number()),
  outside: z.array(z.number()),
  inside: z.array(z.number()),
  extremes: z.array(z.number()),
  iqr: z.number(),
  fences: z.array(z.number()),
});
export type SeriesSummary = z.infer<typeof SeriesSummarySchema>;

// =============================================================================
// Smooths
// =============================================================================

export const SmoothsSchema = z.object({
  smooth: z.array(z.number()),
  hanning: z.array(z.number()),
});
export type Smooths = z.infer<typeof SmoothsSchema>;

// =============================================================================
// Transforms
// =============================================================================

export const TransformsSchema = z.object({
  logs: z.array(z.number()),
  roots: z.array(z.number()),
  inverse: z.array(z.number()),
});
export type Transforms = z.infer<typeof TransformsSchema>;

// =============================================================================
// Series Description (full analysis)
// =============================================================================

export const SeriesDescriptionSchema = z.object({
  original: z.array(z.number()),
  summary: SeriesSummarySchema,
  smooths: SmoothsSchema,
  transforms: TransformsSchema,
  counts: z.array(z.tuple([z.number(), z.number()])),
  sorted: z.array(z.number()),
  ranked: RankedResultSchema,
  binned: BinnedResultSchema,
});
export type SeriesDescription = z.infer<typeof SeriesDescriptionSchema>;

// =============================================================================
// Points Description
// =============================================================================

export const PointsDescriptionSchema = z.object({
  original: z.array(z.array(z.number())),
});
export type PointsDescription = z.infer<typeof PointsDescriptionSchema>;

// =============================================================================
// MCP Command Inputs
// =============================================================================

export const AnalyzeInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;

export const MedianInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type MedianInput = z.infer<typeof MedianInputSchema>;

export const MeanInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type MeanInput = z.infer<typeof MeanInputSchema>;

export const ModeInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type ModeInput = z.infer<typeof ModeInputSchema>;

export const OutliersInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type OutliersInput = z.infer<typeof OutliersInputSchema>;

export const FencesInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type FencesInput = z.infer<typeof FencesInputSchema>;

export const HingesInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type HingesInput = z.infer<typeof HingesInputSchema>;

export const RankedInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
});
export type RankedInput = z.infer<typeof RankedInputSchema>;

export const BinnedInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
  bins: z.number().int().positive().optional(),
});
export type BinnedInput = z.infer<typeof BinnedInputSchema>;

export const SmoothInputSchema = z.object({
  data: z.array(z.number()).min(3, 'Smoothing requires at least 3 data points'),
});
export type SmoothInput = z.infer<typeof SmoothInputSchema>;

export const TransformInputSchema = z.object({
  data: z.array(z.number()).min(1, 'Data array must have at least one element'),
  type: z.enum(['log', 'sqrt', 'inverse']),
});
export type TransformInput = z.infer<typeof TransformInputSchema>;

// =============================================================================
// Re-export zod for convenience
// =============================================================================

export { z };
