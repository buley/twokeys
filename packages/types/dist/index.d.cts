import { z } from 'zod';
export { z } from 'zod';

/**
 * @twokeys/types - Shared Zod schemas for Twokeys ecosystem
 *
 * Provides runtime validation and TypeScript types for all Twokeys data structures.
 */

declare const SeriesOptionsSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    data?: number[] | undefined;
}, {
    data?: number[] | undefined;
}>;
type SeriesOptions = z.infer<typeof SeriesOptionsSchema>;
declare const PointsOptionsSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
    dimensionality: z.ZodOptional<z.ZodNumber>;
    count: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    data?: number[][] | undefined;
    dimensionality?: number | undefined;
    count?: number | undefined;
}, {
    data?: number[][] | undefined;
    dimensionality?: number | undefined;
    count?: number | undefined;
}>;
type PointsOptions = z.infer<typeof PointsOptionsSchema>;
declare const MedianResultSchema: z.ZodObject<{
    datum: z.ZodNumber;
    depth: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    datum: number;
    depth: number;
}, {
    datum: number;
    depth: number;
}>;
type MedianResult = z.infer<typeof MedianResultSchema>;
declare const ModeResultSchema: z.ZodObject<{
    count: z.ZodNumber;
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
    count: number;
}, {
    data: number[];
    count: number;
}>;
type ModeResult = z.infer<typeof ModeResultSchema>;
declare const RankInfoSchema: z.ZodObject<{
    rank: z.ZodNumber;
    peers: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    rank: number;
    peers: number;
}, {
    rank: number;
    peers: number;
}>;
type RankInfo = z.infer<typeof RankInfoSchema>;
declare const RankedResultSchema: z.ZodObject<{
    up: z.ZodRecord<z.ZodString, z.ZodObject<{
        rank: z.ZodNumber;
        peers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rank: number;
        peers: number;
    }, {
        rank: number;
        peers: number;
    }>>;
    down: z.ZodRecord<z.ZodString, z.ZodObject<{
        rank: z.ZodNumber;
        peers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rank: number;
        peers: number;
    }, {
        rank: number;
        peers: number;
    }>>;
    groups: z.ZodObject<{
        up: z.ZodArray<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>, "many">;
        down: z.ZodArray<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>, "many">;
    }, "strip", z.ZodTypeAny, {
        up: (number | number[])[];
        down: (number | number[])[];
    }, {
        up: (number | number[])[];
        down: (number | number[])[];
    }>;
}, "strip", z.ZodTypeAny, {
    up: Record<string, {
        rank: number;
        peers: number;
    }>;
    down: Record<string, {
        rank: number;
        peers: number;
    }>;
    groups: {
        up: (number | number[])[];
        down: (number | number[])[];
    };
}, {
    up: Record<string, {
        rank: number;
        peers: number;
    }>;
    down: Record<string, {
        rank: number;
        peers: number;
    }>;
    groups: {
        up: (number | number[])[];
        down: (number | number[])[];
    };
}>;
type RankedResult = z.infer<typeof RankedResultSchema>;
declare const BinDataSchema: z.ZodObject<{
    from: z.ZodNumber;
    to: z.ZodNumber;
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
    from: number;
    to: number;
}, {
    data: number[];
    from: number;
    to: number;
}>;
type BinData = z.infer<typeof BinDataSchema>;
declare const BinnedResultSchema: z.ZodObject<{
    bins: z.ZodNumber;
    width: z.ZodNumber;
    binned: z.ZodRecord<z.ZodString, z.ZodObject<{
        from: z.ZodNumber;
        to: z.ZodNumber;
        data: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        data: number[];
        from: number;
        to: number;
    }, {
        data: number[];
        from: number;
        to: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    bins: number;
    width: number;
    binned: Record<string, {
        data: number[];
        from: number;
        to: number;
    }>;
}, {
    bins: number;
    width: number;
    binned: Record<string, {
        data: number[];
        from: number;
        to: number;
    }>;
}>;
type BinnedResult = z.infer<typeof BinnedResultSchema>;
declare const SeriesSummarySchema: z.ZodObject<{
    median: z.ZodObject<{
        datum: z.ZodNumber;
        depth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        datum: number;
        depth: number;
    }, {
        datum: number;
        depth: number;
    }>;
    mean: z.ZodNumber;
    mode: z.ZodObject<{
        count: z.ZodNumber;
        data: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        data: number[];
        count: number;
    }, {
        data: number[];
        count: number;
    }>;
    hinges: z.ZodArray<z.ZodObject<{
        datum: z.ZodNumber;
        depth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        datum: number;
        depth: number;
    }, {
        datum: number;
        depth: number;
    }>, "many">;
    adjacent: z.ZodArray<z.ZodNumber, "many">;
    outliers: z.ZodArray<z.ZodNumber, "many">;
    outer: z.ZodArray<z.ZodNumber, "many">;
    outside: z.ZodArray<z.ZodNumber, "many">;
    inside: z.ZodArray<z.ZodNumber, "many">;
    extremes: z.ZodArray<z.ZodNumber, "many">;
    iqr: z.ZodNumber;
    fences: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    median: {
        datum: number;
        depth: number;
    };
    mean: number;
    mode: {
        data: number[];
        count: number;
    };
    hinges: {
        datum: number;
        depth: number;
    }[];
    adjacent: number[];
    outliers: number[];
    outer: number[];
    outside: number[];
    inside: number[];
    extremes: number[];
    iqr: number;
    fences: number[];
}, {
    median: {
        datum: number;
        depth: number;
    };
    mean: number;
    mode: {
        data: number[];
        count: number;
    };
    hinges: {
        datum: number;
        depth: number;
    }[];
    adjacent: number[];
    outliers: number[];
    outer: number[];
    outside: number[];
    inside: number[];
    extremes: number[];
    iqr: number;
    fences: number[];
}>;
type SeriesSummary = z.infer<typeof SeriesSummarySchema>;
declare const SmoothsSchema: z.ZodObject<{
    smooth: z.ZodArray<z.ZodNumber, "many">;
    hanning: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    smooth: number[];
    hanning: number[];
}, {
    smooth: number[];
    hanning: number[];
}>;
type Smooths = z.infer<typeof SmoothsSchema>;
declare const TransformsSchema: z.ZodObject<{
    logs: z.ZodArray<z.ZodNumber, "many">;
    roots: z.ZodArray<z.ZodNumber, "many">;
    inverse: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    logs: number[];
    roots: number[];
    inverse: number[];
}, {
    logs: number[];
    roots: number[];
    inverse: number[];
}>;
type Transforms = z.infer<typeof TransformsSchema>;
declare const SeriesDescriptionSchema: z.ZodObject<{
    original: z.ZodArray<z.ZodNumber, "many">;
    summary: z.ZodObject<{
        median: z.ZodObject<{
            datum: z.ZodNumber;
            depth: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            datum: number;
            depth: number;
        }, {
            datum: number;
            depth: number;
        }>;
        mean: z.ZodNumber;
        mode: z.ZodObject<{
            count: z.ZodNumber;
            data: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            data: number[];
            count: number;
        }, {
            data: number[];
            count: number;
        }>;
        hinges: z.ZodArray<z.ZodObject<{
            datum: z.ZodNumber;
            depth: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            datum: number;
            depth: number;
        }, {
            datum: number;
            depth: number;
        }>, "many">;
        adjacent: z.ZodArray<z.ZodNumber, "many">;
        outliers: z.ZodArray<z.ZodNumber, "many">;
        outer: z.ZodArray<z.ZodNumber, "many">;
        outside: z.ZodArray<z.ZodNumber, "many">;
        inside: z.ZodArray<z.ZodNumber, "many">;
        extremes: z.ZodArray<z.ZodNumber, "many">;
        iqr: z.ZodNumber;
        fences: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        median: {
            datum: number;
            depth: number;
        };
        mean: number;
        mode: {
            data: number[];
            count: number;
        };
        hinges: {
            datum: number;
            depth: number;
        }[];
        adjacent: number[];
        outliers: number[];
        outer: number[];
        outside: number[];
        inside: number[];
        extremes: number[];
        iqr: number;
        fences: number[];
    }, {
        median: {
            datum: number;
            depth: number;
        };
        mean: number;
        mode: {
            data: number[];
            count: number;
        };
        hinges: {
            datum: number;
            depth: number;
        }[];
        adjacent: number[];
        outliers: number[];
        outer: number[];
        outside: number[];
        inside: number[];
        extremes: number[];
        iqr: number;
        fences: number[];
    }>;
    smooths: z.ZodObject<{
        smooth: z.ZodArray<z.ZodNumber, "many">;
        hanning: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        smooth: number[];
        hanning: number[];
    }, {
        smooth: number[];
        hanning: number[];
    }>;
    transforms: z.ZodObject<{
        logs: z.ZodArray<z.ZodNumber, "many">;
        roots: z.ZodArray<z.ZodNumber, "many">;
        inverse: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        logs: number[];
        roots: number[];
        inverse: number[];
    }, {
        logs: number[];
        roots: number[];
        inverse: number[];
    }>;
    counts: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">;
    sorted: z.ZodArray<z.ZodNumber, "many">;
    ranked: z.ZodObject<{
        up: z.ZodRecord<z.ZodString, z.ZodObject<{
            rank: z.ZodNumber;
            peers: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rank: number;
            peers: number;
        }, {
            rank: number;
            peers: number;
        }>>;
        down: z.ZodRecord<z.ZodString, z.ZodObject<{
            rank: z.ZodNumber;
            peers: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rank: number;
            peers: number;
        }, {
            rank: number;
            peers: number;
        }>>;
        groups: z.ZodObject<{
            up: z.ZodArray<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>, "many">;
            down: z.ZodArray<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>, "many">;
        }, "strip", z.ZodTypeAny, {
            up: (number | number[])[];
            down: (number | number[])[];
        }, {
            up: (number | number[])[];
            down: (number | number[])[];
        }>;
    }, "strip", z.ZodTypeAny, {
        up: Record<string, {
            rank: number;
            peers: number;
        }>;
        down: Record<string, {
            rank: number;
            peers: number;
        }>;
        groups: {
            up: (number | number[])[];
            down: (number | number[])[];
        };
    }, {
        up: Record<string, {
            rank: number;
            peers: number;
        }>;
        down: Record<string, {
            rank: number;
            peers: number;
        }>;
        groups: {
            up: (number | number[])[];
            down: (number | number[])[];
        };
    }>;
    binned: z.ZodObject<{
        bins: z.ZodNumber;
        width: z.ZodNumber;
        binned: z.ZodRecord<z.ZodString, z.ZodObject<{
            from: z.ZodNumber;
            to: z.ZodNumber;
            data: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            data: number[];
            from: number;
            to: number;
        }, {
            data: number[];
            from: number;
            to: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        bins: number;
        width: number;
        binned: Record<string, {
            data: number[];
            from: number;
            to: number;
        }>;
    }, {
        bins: number;
        width: number;
        binned: Record<string, {
            data: number[];
            from: number;
            to: number;
        }>;
    }>;
}, "strip", z.ZodTypeAny, {
    binned: {
        bins: number;
        width: number;
        binned: Record<string, {
            data: number[];
            from: number;
            to: number;
        }>;
    };
    original: number[];
    summary: {
        median: {
            datum: number;
            depth: number;
        };
        mean: number;
        mode: {
            data: number[];
            count: number;
        };
        hinges: {
            datum: number;
            depth: number;
        }[];
        adjacent: number[];
        outliers: number[];
        outer: number[];
        outside: number[];
        inside: number[];
        extremes: number[];
        iqr: number;
        fences: number[];
    };
    smooths: {
        smooth: number[];
        hanning: number[];
    };
    transforms: {
        logs: number[];
        roots: number[];
        inverse: number[];
    };
    counts: [number, number][];
    sorted: number[];
    ranked: {
        up: Record<string, {
            rank: number;
            peers: number;
        }>;
        down: Record<string, {
            rank: number;
            peers: number;
        }>;
        groups: {
            up: (number | number[])[];
            down: (number | number[])[];
        };
    };
}, {
    binned: {
        bins: number;
        width: number;
        binned: Record<string, {
            data: number[];
            from: number;
            to: number;
        }>;
    };
    original: number[];
    summary: {
        median: {
            datum: number;
            depth: number;
        };
        mean: number;
        mode: {
            data: number[];
            count: number;
        };
        hinges: {
            datum: number;
            depth: number;
        }[];
        adjacent: number[];
        outliers: number[];
        outer: number[];
        outside: number[];
        inside: number[];
        extremes: number[];
        iqr: number;
        fences: number[];
    };
    smooths: {
        smooth: number[];
        hanning: number[];
    };
    transforms: {
        logs: number[];
        roots: number[];
        inverse: number[];
    };
    counts: [number, number][];
    sorted: number[];
    ranked: {
        up: Record<string, {
            rank: number;
            peers: number;
        }>;
        down: Record<string, {
            rank: number;
            peers: number;
        }>;
        groups: {
            up: (number | number[])[];
            down: (number | number[])[];
        };
    };
}>;
type SeriesDescription = z.infer<typeof SeriesDescriptionSchema>;
declare const PointsDescriptionSchema: z.ZodObject<{
    original: z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">;
}, "strip", z.ZodTypeAny, {
    original: number[][];
}, {
    original: number[][];
}>;
type PointsDescription = z.infer<typeof PointsDescriptionSchema>;
declare const AnalyzeInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;
declare const MedianInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type MedianInput = z.infer<typeof MedianInputSchema>;
declare const MeanInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type MeanInput = z.infer<typeof MeanInputSchema>;
declare const ModeInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type ModeInput = z.infer<typeof ModeInputSchema>;
declare const OutliersInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type OutliersInput = z.infer<typeof OutliersInputSchema>;
declare const FencesInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type FencesInput = z.infer<typeof FencesInputSchema>;
declare const HingesInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type HingesInput = z.infer<typeof HingesInputSchema>;
declare const RankedInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type RankedInput = z.infer<typeof RankedInputSchema>;
declare const BinnedInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
    bins: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    data: number[];
    bins?: number | undefined;
}, {
    data: number[];
    bins?: number | undefined;
}>;
type BinnedInput = z.infer<typeof BinnedInputSchema>;
declare const SmoothInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    data: number[];
}, {
    data: number[];
}>;
type SmoothInput = z.infer<typeof SmoothInputSchema>;
declare const TransformInputSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
    type: z.ZodEnum<["log", "sqrt", "inverse"]>;
}, "strip", z.ZodTypeAny, {
    type: "inverse" | "log" | "sqrt";
    data: number[];
}, {
    type: "inverse" | "log" | "sqrt";
    data: number[];
}>;
type TransformInput = z.infer<typeof TransformInputSchema>;

export { type AnalyzeInput, AnalyzeInputSchema, type BinData, BinDataSchema, type BinnedInput, BinnedInputSchema, type BinnedResult, BinnedResultSchema, type FencesInput, FencesInputSchema, type HingesInput, HingesInputSchema, type MeanInput, MeanInputSchema, type MedianInput, MedianInputSchema, type MedianResult, MedianResultSchema, type ModeInput, ModeInputSchema, type ModeResult, ModeResultSchema, type OutliersInput, OutliersInputSchema, type PointsDescription, PointsDescriptionSchema, type PointsOptions, PointsOptionsSchema, type RankInfo, RankInfoSchema, type RankedInput, RankedInputSchema, type RankedResult, RankedResultSchema, type SeriesDescription, SeriesDescriptionSchema, type SeriesOptions, SeriesOptionsSchema, type SeriesSummary, SeriesSummarySchema, type SmoothInput, SmoothInputSchema, type Smooths, SmoothsSchema, type TransformInput, TransformInputSchema, type Transforms, TransformsSchema };
