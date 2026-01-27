interface StemLeafProps {
  display: string[];
}

export function StemLeaf({ display }: StemLeafProps) {
  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Stem-and-Leaf Display</h3>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        A text-based visualization showing data distribution. Stems are on the left, leaves on the right.
      </p>
      <div className="stem-leaf">
        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Stem | Leaves
          <br />
          -----+--------
        </div>
        {display.length > 0 ? (
          display.map((line, i) => <div key={i}>{line}</div>)
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>Not enough data for stem-leaf display</div>
        )}
      </div>
    </div>
  );
}
