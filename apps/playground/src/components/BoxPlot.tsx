interface BoxPlotProps {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  fences: number[];
}

export function BoxPlot({ min, q1, median, q3, max, outliers, fences }: BoxPlotProps) {
  // Calculate scale
  const dataMin = Math.min(min, ...outliers, fences[0] || min);
  const dataMax = Math.max(max, ...outliers, fences[1] || max);
  const range = dataMax - dataMin || 1;
  const padding = range * 0.1;
  const scaleMin = dataMin - padding;
  const scaleMax = dataMax + padding;
  const scaleRange = scaleMax - scaleMin;

  const toPercent = (val: number) => ((val - scaleMin) / scaleRange) * 100;

  const boxLeft = toPercent(q1);
  const boxRight = toPercent(q3);
  const boxWidth = boxRight - boxLeft;
  const medianPos = toPercent(median);
  const minPos = toPercent(min);
  const maxPos = toPercent(max);
  const fenceLowPos = fences[0] !== undefined ? toPercent(fences[0]) : null;
  const fenceHighPos = fences[1] !== undefined ? toPercent(fences[1]) : null;

  return (
    <div className="box-plot">
      <div style={{ position: 'relative', height: '100px', marginBottom: '2rem' }}>
        {/* Fence lines (dashed) */}
        {fenceLowPos !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${fenceLowPos}%`,
              top: '35%',
              height: '30%',
              borderLeft: '2px dashed var(--warning)',
              opacity: 0.5,
            }}
          />
        )}
        {fenceHighPos !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${fenceHighPos}%`,
              top: '35%',
              height: '30%',
              borderLeft: '2px dashed var(--warning)',
              opacity: 0.5,
            }}
          />
        )}

        {/* Whisker line */}
        <div
          style={{
            position: 'absolute',
            left: `${minPos}%`,
            width: `${maxPos - minPos}%`,
            top: '50%',
            height: '2px',
            background: 'var(--text-secondary)',
          }}
        />

        {/* Min whisker cap */}
        <div
          style={{
            position: 'absolute',
            left: `${minPos}%`,
            top: '35%',
            height: '30%',
            width: '2px',
            background: 'var(--text-secondary)',
          }}
        />

        {/* Max whisker cap */}
        <div
          style={{
            position: 'absolute',
            left: `${maxPos}%`,
            top: '35%',
            height: '30%',
            width: '2px',
            background: 'var(--text-secondary)',
          }}
        />

        {/* Box */}
        <div
          style={{
            position: 'absolute',
            left: `${boxLeft}%`,
            width: `${boxWidth}%`,
            top: '25%',
            height: '50%',
            background: 'var(--accent)',
            opacity: 0.3,
            borderRadius: '4px',
            border: '2px solid var(--accent)',
          }}
        />

        {/* Median line */}
        <div
          style={{
            position: 'absolute',
            left: `${medianPos}%`,
            top: '20%',
            height: '60%',
            width: '3px',
            background: 'var(--text-primary)',
            borderRadius: '2px',
          }}
        />

        {/* Outliers */}
        {outliers.map((outlier, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${toPercent(outlier)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--error)',
            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>Min: {min.toFixed(2)}</span>
        <span>Q1: {q1.toFixed(2)}</span>
        <span>Median: {median.toFixed(2)}</span>
        <span>Q3: {q3.toFixed(2)}</span>
        <span>Max: {max.toFixed(2)}</span>
      </div>

      {outliers.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--error)' }}>
          Outliers: {outliers.join(', ')}
        </div>
      )}
    </div>
  );
}
