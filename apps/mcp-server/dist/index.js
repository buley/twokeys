#!/usr/bin/env node
#!/usr/bin/env node

// src/index.ts
import { createMCPServer } from "@affectively/mcp-framework";
import { Series } from "twokeys";
var handlers = {
  async analyze(args) {
    const series = new Series({ data: args.data });
    return series.describe();
  },
  async median(args) {
    const series = new Series({ data: args.data });
    return series.median();
  },
  async mean(args) {
    const series = new Series({ data: args.data });
    return { mean: series.mean() };
  },
  async mode(args) {
    const series = new Series({ data: args.data });
    return series.mode();
  },
  async outliers(args) {
    const series = new Series({ data: args.data });
    return {
      outliers: series.outliers(),
      fences: series.fences()
    };
  },
  async fences(args) {
    const series = new Series({ data: args.data });
    return {
      innerFences: series.fences(),
      outerFences: series.outer()
    };
  },
  async hinges(args) {
    const series = new Series({ data: args.data });
    return {
      hinges: series.hinges(),
      iqr: series.iqr()
    };
  },
  async five_number_summary(args) {
    const series = new Series({ data: args.data });
    const extremes = series.extremes();
    const hinges = series.hinges();
    const median = series.median();
    return {
      minimum: extremes[0],
      q1: hinges[0]?.datum,
      median: median.datum,
      q3: hinges[1]?.datum,
      maximum: extremes[1]
    };
  },
  async trimean(args) {
    const series = new Series({ data: args.data });
    return {
      trimean: series.trimean(),
      median: series.median().datum,
      mean: series.mean()
    };
  },
  async letter_values(args) {
    const series = new Series({ data: args.data });
    return series.letterValues();
  },
  async stem_leaf(args) {
    const series = new Series({ data: args.data });
    return series.stemLeaf();
  },
  async ranked(args) {
    const series = new Series({ data: args.data });
    return series.ranked();
  },
  async binned(args) {
    const series = new Series({ data: args.data });
    return series.binned(args.bins);
  },
  async smooth(args) {
    const series = new Series({ data: args.data });
    return {
      original: args.data,
      smooth: series.smooth(),
      rough: series.rough(),
      hanning: series.hanning()
    };
  },
  async transform(args) {
    const series = new Series({ data: args.data });
    let result;
    switch (args.type) {
      case "log":
        result = series.logs();
        break;
      case "sqrt":
        result = series.roots();
        break;
      case "inverse":
        result = series.inverse();
        break;
    }
    return {
      original: args.data,
      transformed: result,
      type: args.type
    };
  }
};
var tools = [
  {
    name: "analyze",
    description: "Perform complete exploratory data analysis on a dataset.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers to analyze"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "median",
    description: "Calculate the median (middle value) and its depth.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "mean",
    description: "Calculate the arithmetic mean (average).",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "mode",
    description: "Find the mode(s) - most frequently occurring value(s).",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "outliers",
    description: "Detect outliers using Tukey fences (1.5 \xD7 IQR).",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "fences",
    description: "Calculate Tukey fences for outlier detection.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "hinges",
    description: "Calculate hinges (quartiles Q1 and Q3) with IQR.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "five_number_summary",
    description: "Calculate min, Q1, median, Q3, max for box plots.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "trimean",
    description: "Tukey's trimean: (Q1 + 2\xD7median + Q3) / 4.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "letter_values",
    description: "Extended quartiles: M, F, E, D, C, B, A...",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "stem_leaf",
    description: "Stem-and-leaf text display.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "ranked",
    description: "Rank information with tie handling.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "binned",
    description: "Histogram-style binning.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        },
        bins: {
          type: "number",
          description: "Number of bins (optional)"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "smooth",
    description: "Tukey's 3RSSH smoothing with residuals.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers (minimum 3)"
        }
      },
      required: ["data"]
    }
  },
  {
    name: "transform",
    description: "Apply log, sqrt, or inverse transform.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "number" },
          description: "Array of numbers"
        },
        type: {
          type: "string",
          enum: ["log", "sqrt", "inverse"],
          description: "Transform type"
        }
      },
      required: ["data", "type"]
    }
  }
];
var server = createMCPServer({
  name: "twokeys",
  version: "2.0.0",
  description: "Exploratory Data Analysis tools inspired by John Tukey.",
  tools,
  handlers
});
server.start();
//# sourceMappingURL=index.js.map