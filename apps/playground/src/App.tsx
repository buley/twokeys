import { useState, useEffect, useMemo } from 'react';
import { Series } from 'twokeys';
import * as wasm from '@buley/twokeys-wasm';
import { BoxPlot } from './components/BoxPlot';
import { StemLeaf } from './components/StemLeaf';
import { Benchmark } from './components/Benchmark';

const SAMPLE_DATA = [
  48, 59, 63, 30, 57, 92, 73, 47, 31, 5, 82, 45, 67, 39, 88, 54, 71, 28, 95, 41,
];

type Tab = 'summary' | 'transforms' | 'smoothing' | 'ranking' | 'lettervalues' | 'stemleaf' | 'benchmark';

function App() {
  const [input, setInput] = useState(SAMPLE_DATA.join(', '));
  const [tab, setTab] = useState<Tab>('summary');
  const [wasmReady, setWasmReady] = useState(false);

  // Load WASM on mount
  useEffect(() => {
    wasm.loadWasm().then((loaded) => {
      setWasmReady(loaded !== null);
    });
  }, []);

  // Parse input data
  const data = useMemo(() => {
    const nums = input
      .split(/[,\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    return nums.length > 0 ? nums : SAMPLE_DATA;
  }, [input]);

  // Create Series instance
  const series = useMemo(() => new Series({ data }), [data]);

  // Calculate all statistics
  const stats = useMemo(() => {
    const description = series.describe();
    return {
      ...description,
      trimean: series.trimean(),
      letterValues: series.letterValues(),
      stemLeaf: series.stemLeaf(),
      rough: series.rough(),
    };
  }, [series]);

  const handleRandomize = () => {
    const count = Math.floor(Math.random() * 30) + 10;
    const max = Math.floor(Math.random() * 100) + 50;
    const randomData = Array.from({ length: count }, () => Math.floor(Math.random() * max));
    setInput(randomData.join(', '));
  };

  const handleOutlierExample = () => {
    const normal = Array.from({ length: 20 }, () => Math.floor(Math.random() * 30) + 40);
    const outliers = [5, 150, 200];
    setInput([...normal, ...outliers].join(', '));
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Twokeys Playground</h1>
        <p>Interactive Exploratory Data Analysis, inspired by John Tukey</p>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <span className={`badge ${wasmReady ? 'wasm' : 'ts'}`}>
            {wasmReady ? '⚡ WASM Ready' : '📦 TypeScript'}
          </span>
        </div>
      </header>

      <div className="grid">
        <div>
          <div className="card">
            <h2 className="card-title">Data Input</h2>
            <div className="input-area">
              <label>Enter numbers (comma or space separated)</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your data..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn" onClick={handleRandomize}>
                Randomize
              </button>
              <button className="btn btn-secondary" onClick={handleOutlierExample}>
                Outlier Example
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2 className="card-title">Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-value">{data.length}</div>
                <div className="stat-label">Count</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.summary.mean.toFixed(2)}</div>
                <div className="stat-label">Mean</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.summary.median.datum.toFixed(2)}</div>
                <div className="stat-label">Median</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.trimean.toFixed(2)}</div>
                <div className="stat-label">Trimean</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.summary.iqr.toFixed(2)}</div>
                <div className="stat-label">IQR</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.summary.outliers.length}</div>
                <div className="stat-label">Outliers</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="tabs">
              {(['summary', 'transforms', 'smoothing', 'ranking', 'lettervalues', 'stemleaf', 'benchmark'] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={`tab ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1).replace('lettervalues', 'Letter Values').replace('stemleaf', 'Stem-Leaf')}
                </button>
              ))}
            </div>

            {tab === 'summary' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Five-Number Summary & Box Plot</h3>
                <BoxPlot
                  min={stats.summary.extremes[0]}
                  q1={stats.summary.hinges[0]?.datum ?? 0}
                  median={stats.summary.median.datum}
                  q3={stats.summary.hinges[1]?.datum ?? 0}
                  max={stats.summary.extremes[1]}
                  outliers={stats.summary.outliers}
                  fences={stats.summary.fences}
                />
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Mode</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Values: <span className="mono">{stats.summary.mode.data.join(', ') || 'N/A'}</span>
                    {' '}(appears {stats.summary.mode.count} times)
                  </p>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Adjacent Values</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Most extreme non-outliers: <span className="mono">[{stats.summary.adjacent.join(', ')}]</span>
                  </p>
                </div>
              </div>
            )}

            {tab === 'transforms' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Re-expression (Transforms)</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Tukey's ladder of powers helps normalize skewed data
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)' }}>Transform</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)' }}>First 5 Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Original</td>
                      <td className="mono" style={{ padding: '0.5rem' }}>{data.slice(0, 5).map(n => n.toFixed(2)).join(', ')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Log (ln)</td>
                      <td className="mono" style={{ padding: '0.5rem' }}>{stats.transforms.logs.slice(0, 5).map(n => n.toFixed(3)).join(', ')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Square Root</td>
                      <td className="mono" style={{ padding: '0.5rem' }}>{stats.transforms.roots.slice(0, 5).map(n => n.toFixed(3)).join(', ')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Inverse (1/x)</td>
                      <td className="mono" style={{ padding: '0.5rem' }}>{stats.transforms.inverse.slice(0, 5).map(n => n.toFixed(4)).join(', ')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'smoothing' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Smoothing (3RSSH)</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Tukey's 3RSSH smoother: running medians, split, and Hanning
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)' }}>Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Original</td>
                      <td className="mono" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{data.slice(0, 8).join(', ')}...</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Smooth</td>
                      <td className="mono" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{stats.smooths.smooth.slice(0, 8).join(', ')}...</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Rough (residuals)</td>
                      <td className="mono" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{stats.rough.slice(0, 8).map(n => n.toFixed(1)).join(', ')}...</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem' }}>Hanning</td>
                      <td className="mono" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{stats.smooths.hanning.slice(0, 8).map(n => n.toFixed(1)).join(', ')}...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'ranking' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Ranking</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ascending Ranks</h4>
                    <div className="stem-leaf">
                      {Object.entries(stats.ranked.up).slice(0, 10).map(([val, info]) => (
                        <div key={val}>{val}: rank {info.rank}{info.peers > 0 ? ` (${info.peers} peers)` : ''}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Binned Distribution</h4>
                    <div className="stem-leaf">
                      {Object.entries(stats.binned.binned).map(([bin, data]) => (
                        <div key={bin}>
                          {data.from}-{data.to}: {data.data.length} values
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'lettervalues' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Letter Values</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Extensions of quartiles: M=median, F=fourths (hinges), E=eighths, etc.
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>Letter</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-secondary)' }}>Depth</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-secondary)' }}>Lower</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-secondary)' }}>Upper</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-secondary)' }}>Mid</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-secondary)' }}>Spread</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.letterValues.map((lv) => (
                      <tr key={lv.letter}>
                        <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 600 }}>{lv.letter}</td>
                        <td className="mono" style={{ textAlign: 'right', padding: '0.5rem' }}>{lv.depth.toFixed(1)}</td>
                        <td className="mono" style={{ textAlign: 'right', padding: '0.5rem' }}>{lv.lower.toFixed(2)}</td>
                        <td className="mono" style={{ textAlign: 'right', padding: '0.5rem' }}>{lv.upper.toFixed(2)}</td>
                        <td className="mono" style={{ textAlign: 'right', padding: '0.5rem' }}>{lv.mid.toFixed(2)}</td>
                        <td className="mono" style={{ textAlign: 'right', padding: '0.5rem' }}>{lv.spread.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'stemleaf' && (
              <StemLeaf display={stats.stemLeaf.display} />
            )}

            {tab === 'benchmark' && (
              <Benchmark data={data} wasmReady={wasmReady} />
            )}
          </div>
        </div>
      </div>

      <div className="tukey-quote">
        "The best thing about being a statistician is that you get to play in everyone's backyard."
        <cite>— John Tukey</cite>
      </div>
    </div>
  );
}

export default App;
