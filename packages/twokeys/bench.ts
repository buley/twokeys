/**
 * Twokeys Benchmark
 *
 * Measures performance of key operations
 */

import { Series } from './src/index';

// Generate test data
const smallData = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
const mediumData = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
const largeData = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));

function benchmark(name: string, fn: () => void, iterations: number = 1000): void {
  // Warmup
  for (let i = 0; i < 10; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  const avgMs = (end - start) / iterations;
  const opsPerSec = Math.round(1000 / avgMs);
  console.log(`${name.padEnd(40)} ${avgMs.toFixed(4)}ms/op\t${opsPerSec.toLocaleString()} ops/sec`);
}

console.log('='.repeat(70));
console.log('Twokeys Benchmark');
console.log('='.repeat(70));

console.log('\n--- Small Dataset (100 elements) ---');
benchmark('Series creation', () => new Series({ data: smallData }));
benchmark('sorted()', () => new Series({ data: smallData }).sorted());
benchmark('median()', () => new Series({ data: smallData }).median());
benchmark('mean()', () => new Series({ data: smallData }).mean());
benchmark('mode()', () => new Series({ data: smallData }).mode());
benchmark('extremes()', () => new Series({ data: smallData }).extremes());
benchmark('hinges()', () => new Series({ data: smallData }).hinges());
benchmark('iqr()', () => new Series({ data: smallData }).iqr());
benchmark('fences()', () => new Series({ data: smallData }).fences());
benchmark('outliers()', () => new Series({ data: smallData }).outliers());
benchmark('counts()', () => new Series({ data: smallData }).counts());
benchmark('ranked()', () => new Series({ data: smallData }).ranked());
benchmark('binned()', () => new Series({ data: smallData }).binned());
benchmark('smooth()', () => new Series({ data: smallData }).smooth());
benchmark('hanning()', () => new Series({ data: smallData }).hanning());
benchmark('logs()', () => new Series({ data: smallData }).logs());
benchmark('roots()', () => new Series({ data: smallData }).roots());
benchmark('describe() [full analysis]', () => new Series({ data: smallData }).describe(), 100);

console.log('\n--- Medium Dataset (1,000 elements) ---');
benchmark('Series creation', () => new Series({ data: mediumData }));
benchmark('sorted()', () => new Series({ data: mediumData }).sorted());
benchmark('median()', () => new Series({ data: mediumData }).median());
benchmark('mean()', () => new Series({ data: mediumData }).mean());
benchmark('mode()', () => new Series({ data: mediumData }).mode());
benchmark('fences()', () => new Series({ data: mediumData }).fences());
benchmark('outliers()', () => new Series({ data: mediumData }).outliers());
benchmark('counts()', () => new Series({ data: mediumData }).counts(), 100);
benchmark('ranked()', () => new Series({ data: mediumData }).ranked());
benchmark('smooth()', () => new Series({ data: mediumData }).smooth(), 100);
benchmark('describe() [full analysis]', () => new Series({ data: mediumData }).describe(), 10);

console.log('\n--- Large Dataset (10,000 elements) ---');
benchmark('Series creation', () => new Series({ data: largeData }), 100);
benchmark('sorted()', () => new Series({ data: largeData }).sorted(), 100);
benchmark('median()', () => new Series({ data: largeData }).median(), 100);
benchmark('mean()', () => new Series({ data: largeData }).mean(), 100);
benchmark('mode()', () => new Series({ data: largeData }).mode(), 100);
benchmark('fences()', () => new Series({ data: largeData }).fences(), 100);
benchmark('outliers()', () => new Series({ data: largeData }).outliers(), 100);
benchmark('counts()', () => new Series({ data: largeData }).counts(), 10);
benchmark('ranked()', () => new Series({ data: largeData }).ranked(), 100);
benchmark('smooth()', () => new Series({ data: largeData }).smooth(), 10);
benchmark('describe() [full analysis]', () => new Series({ data: largeData }).describe(), 5);

console.log('\n' + '='.repeat(70));
