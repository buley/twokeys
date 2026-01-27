import { useState } from 'react';
import { Series } from 'twokeys';
import * as wasm from '@buley/twokeys-wasm';

interface BenchmarkProps {
  data: number[];
  wasmReady: boolean;
}

interface BenchmarkResult {
  name: string;
  tsTime: number;
  wasmTime: number | null;
  speedup: number | null;
}

export function Benchmark({ data, wasmReady }: BenchmarkProps) {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);

  const runBenchmark = async () => {
    setRunning(true);
    const iterations = 1000;
    const benchmarks: BenchmarkResult[] = [];

    // Helper to benchmark a function
    const bench = (name: string, tsFn: () => void, wasmFn?: () => void): BenchmarkResult => {
      // Warmup
      for (let i = 0; i < 10; i++) tsFn();
      if (wasmFn) for (let i = 0; i < 10; i++) wasmFn();

      // TypeScript benchmark
      const tsStart = performance.now();
      for (let i = 0; i < iterations; i++) tsFn();
      const tsEnd = performance.now();
      const tsTime = (tsEnd - tsStart) / iterations;

      // WASM benchmark
      let wasmTime: number | null = null;
      if (wasmFn && wasmReady) {
        const wasmStart = performance.now();
        for (let i = 0; i < iterations; i++) wasmFn();
        const wasmEnd = performance.now();
        wasmTime = (wasmEnd - wasmStart) / iterations;
      }

      const speedup = wasmTime !== null && tsTime > 0 ? tsTime / wasmTime : null;

      return { name, tsTime, wasmTime, speedup };
    };

    // Run benchmarks
    await new Promise((resolve) => setTimeout(resolve, 10));

    benchmarks.push(
      bench(
        'sorted()',
        () => new Series({ data }).sorted(),
        wasmReady ? () => wasm.sorted(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'mean()',
        () => new Series({ data }).mean(),
        wasmReady ? () => wasm.mean(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'median()',
        () => new Series({ data }).median(),
        wasmReady ? () => wasm.median(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'mode()',
        () => new Series({ data }).mode(),
        wasmReady ? () => wasm.mode(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'fences()',
        () => new Series({ data }).fences(),
        wasmReady ? () => wasm.fences(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'outliers()',
        () => new Series({ data }).outliers(),
        wasmReady ? () => wasm.outliers(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'logs()',
        () => new Series({ data }).logs(),
        wasmReady ? () => wasm.logs(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'smooth()',
        () => new Series({ data }).smooth(),
        wasmReady ? () => wasm.smooth(data) : undefined
      )
    );

    benchmarks.push(
      bench(
        'describe() / analyze()',
        () => new Series({ data }).describe(),
        wasmReady ? () => wasm.analyze(data) : undefined
      )
    );

    setResults(benchmarks);
    setRunning(false);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Performance Benchmark</h3>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Compare TypeScript vs WASM performance ({data.length} elements, 1000 iterations)
      </p>

      <button className="btn" onClick={runBenchmark} disabled={running}>
        {running ? 'Running...' : 'Run Benchmark'}
      </button>

      {results.length > 0 && (
        <div className="benchmark" style={{ marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Method</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>TypeScript</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>WASM</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>Speedup</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>{result.name}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem' }}>
                    {result.tsTime.toFixed(4)}ms
                  </td>
                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem' }}>
                    {result.wasmTime !== null ? `${result.wasmTime.toFixed(4)}ms` : '—'}
                  </td>
                  <td
                    className="mono"
                    style={{
                      textAlign: 'right',
                      padding: '0.75rem',
                      color: result.speedup !== null && result.speedup > 1 ? 'var(--success)' : 'var(--text-secondary)',
                    }}
                  >
                    {result.speedup !== null ? `${result.speedup.toFixed(2)}x` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
