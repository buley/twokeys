// src/index.ts
function tsSorted(arr) {
  return [...arr].sort((a, b) => a - b);
}
function tsMean(arr) {
  if (!arr.length) return NaN;
  let sum = 0;
  for (const n of arr) sum += n;
  return sum / arr.length;
}
function tsMedian(sorted2) {
  const len = sorted2.length;
  if (!len) return NaN;
  if (len === 1) return sorted2[0];
  const mid = Math.floor(len / 2);
  return len % 2 === 0 ? (sorted2[mid - 1] + sorted2[mid]) / 2 : sorted2[mid];
}
function tsMedianDepth(length, offset = 0) {
  if (!length) return NaN;
  return offset + (length + 1) / 2;
}
function tsMode(data) {
  if (!data.length) return { count: 0, data: [] };
  const freq = /* @__PURE__ */ new Map();
  let maxCount = 0;
  for (const val of data) {
    const count = (freq.get(val) || 0) + 1;
    freq.set(val, count);
    if (count > maxCount) maxCount = count;
  }
  const modes = [];
  for (const [val, count] of freq) {
    if (count === maxCount) modes.push(val);
  }
  return { count: maxCount, data: modes.sort((a, b) => a - b) };
}
function tsExtremes(sorted2) {
  if (!sorted2.length) return [NaN, NaN];
  return [sorted2[0], sorted2[sorted2.length - 1]];
}
function tsVariance(data) {
  if (data.length < 2) return NaN;
  const m = tsMean(data);
  let sum = 0;
  for (const val of data) {
    const delta = val - m;
    sum += delta * delta;
  }
  return sum / (data.length - 1);
}
function tsStddev(data) {
  return Math.sqrt(tsVariance(data));
}
function tsSkewness(data) {
  const n = data.length;
  if (n < 3) return NaN;
  const m = tsMean(data);
  const s = tsStddev(data);
  if (s === 0) return 0;
  let sum = 0;
  for (const val of data) {
    const z = (val - m) / s;
    sum += z * z * z;
  }
  return n / ((n - 1) * (n - 2)) * sum;
}
function tsKurtosis(data) {
  const n = data.length;
  if (n < 4) return NaN;
  const m = tsMean(data);
  const s = tsStddev(data);
  if (s === 0) return 0;
  let sum = 0;
  for (const val of data) {
    const z = (val - m) / s;
    sum += z * z * z * z;
  }
  const rawKurt = n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * sum;
  const correction = 3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3));
  return rawKurt - correction;
}
function tsHinges(sorted2) {
  const len = sorted2.length;
  if (len < 4) return [];
  const per = Math.floor(len / 2);
  const q1Slice = sorted2.slice(0, per);
  const q3Slice = sorted2.slice(per);
  return [
    { datum: tsMedian(q1Slice), depth: tsMedianDepth(per, 0) },
    { datum: tsMedian(q3Slice), depth: tsMedianDepth(q3Slice.length, per) }
  ];
}
function tsIqr(h) {
  if (h.length < 2) return NaN;
  return Math.abs(h[1].datum - h[0].datum);
}
function tsFences(med, iqrVal, multiple = 1.5) {
  if (isNaN(med) || isNaN(iqrVal)) return [NaN, NaN];
  const extra = iqrVal * multiple;
  return [med - extra, med + extra];
}
function tsOuterFences(med, iqrVal, multiple = 1.5) {
  if (isNaN(med) || isNaN(iqrVal)) return [NaN, NaN];
  const extra = 2 * iqrVal * multiple;
  return [med - extra, med + extra];
}
function tsOutliers(sortedData, f) {
  if (isNaN(f[0]) || isNaN(f[1])) return [];
  return sortedData.filter((n) => n < f[0] || n > f[1]);
}
function tsAdjacent(sortedData, f) {
  if (f.length === 0) return [];
  const low = f[0];
  const high = f[1];
  const lows = [];
  const highs = [];
  for (const val of sortedData) {
    if (val > low) lows.push(val);
    if (val < high) highs.push(val);
  }
  lows.sort((a, b) => a - b);
  highs.sort((a, b) => a - b);
  return [lows[0], highs[highs.length - 1]];
}
function tsInside(sortedData, f) {
  if (f.length === 0) return [];
  const lo = Math.min(...f);
  const hi = Math.max(...f);
  return sortedData.filter((n) => n > lo && n < hi);
}
function tsOutside(sortedData, outer) {
  if (outer.length === 0) return [];
  const lo = Math.min(...outer);
  const hi = Math.max(...outer);
  return sortedData.filter((n) => n < lo || n > hi);
}
function tsCounts(sortedData) {
  const freq = /* @__PURE__ */ new Map();
  for (const val of sortedData) {
    freq.set(val, (freq.get(val) || 0) + 1);
  }
  const result = [];
  for (const [val, count] of freq) {
    result.push([val, count]);
  }
  return result.sort((a, b) => a[0] - b[0]);
}
function tsRanked(sortedData) {
  const up = {};
  const down = {};
  const total = sortedData.length;
  const ranked2 = [];
  let tiedRank = NaN;
  let tiedNumbers = [];
  const reset = () => {
    tiedRank = NaN;
    tiedNumbers = [];
  };
  for (let i = 0; i < sortedData.length; i++) {
    const num = sortedData[i];
    const incr = i + 1;
    const decr = i - 1;
    if (num === sortedData[decr]) {
      if (!isNaN(tiedRank) && tiedNumbers.length === 0) {
        tiedNumbers.push(num);
        ranked2.push(tiedNumbers);
        reset();
      } else {
        tiedNumbers.push(num);
        tiedRank = decr;
      }
      if (num !== sortedData[incr]) {
        ranked2.push(tiedNumbers);
        reset();
      }
    } else {
      if (num !== sortedData[incr]) {
        if (tiedNumbers.length > 0) {
          ranked2.push(tiedNumbers);
          reset();
        } else {
          ranked2.push(num);
        }
      } else {
        tiedNumbers.push(num);
      }
    }
  }
  let offset = 0;
  for (let i = 0; i < ranked2.length; i++) {
    const item = ranked2[i];
    if (typeof item === "number") {
      down[item] = { rank: i + 1 + offset, peers: 0 };
      up[item] = { rank: total - i - offset, peers: 0 };
    } else if (Array.isArray(item)) {
      offset += item.length;
      const usable = item[0];
      down[usable] = { rank: i + 1 + offset, peers: item.length };
      up[usable] = { rank: total - i - offset, peers: item.length };
    } else {
      offset += 1;
    }
  }
  return {
    up,
    down,
    groups: {
      down: [...ranked2],
      up: [...ranked2].reverse()
    }
  };
}
function tsBinned(sortedData, ext) {
  const binned2 = {};
  const total = sortedData.length;
  if (total === 0 || ext.length < 2) {
    return { bins: 0, width: NaN, binned: {} };
  }
  let width = (ext[1] - ext[0]) / (Math.log(sortedData.length) / Math.LN2);
  width = Math.floor(width);
  if (width < 1) width = 1;
  let binCount = Math.floor(ext[1] / width) + 1;
  if (!binCount || binCount < 1) binCount = 1;
  for (const val of sortedData) {
    const bin = Math.floor(val / width);
    if (!binned2[bin]) {
      binned2[bin] = {
        from: bin * width,
        to: (bin + 1) * width - 1,
        data: []
      };
    }
    binned2[bin].data.push(val);
  }
  return { bins: binCount, width, binned: binned2 };
}
function tsLogs(arr) {
  return arr.map((n) => Math.log(n));
}
function tsRoots(arr) {
  return arr.map((n) => Math.sqrt(n));
}
function tsInverse(arr) {
  return arr.map((n) => 1 / n);
}
function tsZscore(data) {
  const m = tsMean(data);
  const s = tsStddev(data);
  if (s === 0 || isNaN(s)) return data.map(() => 0);
  return data.map((val) => (val - m) / s);
}
function tsHanning(arr) {
  if (arr.length < 2) return [...arr];
  const result = [arr[0]];
  for (let i = 1; i < arr.length - 1; i++) {
    result.push((arr[i] + arr[i + 1]) / 2);
  }
  result.push(arr[arr.length - 1]);
  return result;
}
function tsSmoothMedian(arr) {
  if (arr.length <= 2) return [...arr];
  const result = new Array(arr.length);
  result[0] = arr[0];
  result[arr.length - 1] = arr[arr.length - 1];
  for (let i = 1; i < arr.length - 1; i++) {
    result[i] = Math.min(Math.max(arr[i - 1], arr[i]), arr[i + 1]);
  }
  return result;
}
function tsSmoothExtremes(arr) {
  if (arr.length <= 2) return [...arr];
  const result = [...arr];
  const tmpHead = arr[1] - 2 * (arr[2] - arr[1]);
  const candidates = [arr[0], arr[1], tmpHead].sort((a, b) => a - b);
  result[0] = candidates[1];
  const tmpTail = arr[arr.length - 2] - 2 * (arr[arr.length - 3] - arr[arr.length - 2]);
  const tailCandidates = [arr[arr.length - 1], arr[arr.length - 2], tmpTail].sort((a, b) => a - b);
  result[arr.length - 1] = tailCandidates[1];
  return result;
}
function tsSmooth(arr) {
  let result = [...arr];
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  result = tsSmoothExtremes(result);
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  result = tsSmoothExtremes(result);
  for (let i = 0; i < 3; i++) result = tsSmoothMedian(result);
  return result;
}
function tsEma(data, alpha) {
  if (data.length === 0) return [];
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(result[i - 1] * (1 - alpha) + data[i] * alpha);
  }
  return result;
}
function tsRough(original, smoothed) {
  const result = [];
  for (let i = 0; i < original.length; i++) {
    result.push(original[i] - (smoothed[i] ?? 0));
  }
  return result;
}
function tsTrimean(q1, med, q3) {
  return (q1 + 2 * med + q3) / 4;
}
function tsLetterValues(sortedData, medResult) {
  const n = sortedData.length;
  if (n < 2) return [];
  const letters = ["M", "F", "E", "D", "C", "B", "A", "Z", "Y", "X", "W", "V", "U", "T", "S"];
  const results = [];
  const medDepth = (n + 1) / 2;
  results.push({
    letter: "M",
    depth: medDepth,
    lower: medResult.datum,
    upper: medResult.datum,
    mid: medResult.datum,
    spread: 0
  });
  let depth = medDepth;
  let letterIdx = 1;
  while (depth > 1 && letterIdx < letters.length) {
    depth = Math.floor((Math.floor(depth) + 1) / 2);
    if (depth < 1) break;
    const lowerIdx = Math.ceil(depth) - 1;
    const upperIdx = n - Math.ceil(depth);
    if (lowerIdx < 0 || upperIdx >= n || lowerIdx >= upperIdx) break;
    const lower = sortedData[lowerIdx];
    const upper = sortedData[upperIdx];
    results.push({
      letter: letters[letterIdx],
      depth,
      lower,
      upper,
      mid: (lower + upper) / 2,
      spread: upper - lower
    });
    letterIdx++;
  }
  return results;
}
function tsStemLeaf(sortedData, leafDigits = 1) {
  if (!sortedData.length) return { stems: [], leaves: {}, display: [] };
  const scale = Math.pow(10, leafDigits);
  const stemMap = /* @__PURE__ */ new Map();
  for (const val of sortedData) {
    const stem = Math.floor(val / scale);
    const leaf = Math.abs(Math.round(val % scale));
    if (!stemMap.has(stem)) stemMap.set(stem, []);
    stemMap.get(stem).push(leaf);
  }
  const stemKeys = Array.from(stemMap.keys()).sort((a, b) => a - b);
  const stems = [];
  const leaves = {};
  const display = [];
  for (const stem of stemKeys) {
    const stemStr = String(stem);
    stems.push(stemStr);
    const leafArr = stemMap.get(stem).sort((a, b) => a - b).map(String);
    leaves[stemStr] = leafArr;
    display.push(`${stemStr.padStart(4)} | ${leafArr.join(" ")}`);
  }
  return { stems, leaves, display };
}
function tsCosineSimilarity(a, b) {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
function tsSqEuclideanDistance(a, b) {
  let sum = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const delta = (a[i] ?? 0) - (b[i] ?? 0);
    sum += delta * delta;
  }
  return sum;
}
function tsEuclideanDistance(a, b) {
  return Math.sqrt(tsSqEuclideanDistance(a, b));
}
function tsManhattanDistance(a, b) {
  let sum = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
  }
  return sum;
}
function tsMahalanobisDistance(point, means, variances, epsilon = 1e-8) {
  const len = Math.min(point.length, means.length, variances.length);
  if (len === 0) return 0;
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const delta = (point[i] ?? 0) - (means[i] ?? 0);
    const v = Math.max(variances[i] ?? 0, epsilon);
    sum += delta * delta / v;
  }
  return Math.sqrt(sum);
}
function tsNormalizeL2(vector) {
  let sumSq = 0;
  for (const v of vector) sumSq += v * v;
  const mag = Math.sqrt(sumSq);
  if (mag === 0) return vector.map(() => 0);
  return vector.map((v) => v / mag);
}
var wasmInstance = null;
var wasmLoadPromise = null;
async function loadWasm() {
  if (wasmInstance) return wasmInstance;
  if (wasmLoadPromise) return wasmLoadPromise;
  wasmLoadPromise = (async () => {
    try {
      const wasmUrl = new URL("../build/release.wasm", import.meta.url);
      const response = await fetch(wasmUrl);
      const wasmBuffer = await response.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(wasmBuffer);
      wasmInstance = wasmModule.instance.exports;
      return wasmInstance;
    } catch {
      console.warn("@buley/twokeys-wasm: WASM not available, using TypeScript fallback");
      return null;
    }
  })();
  return wasmLoadPromise;
}
function isWasmLoaded() {
  return wasmInstance !== null;
}
function sorted(data) {
  if (wasmInstance) {
    return Array.from(wasmInstance.sort(new Float64Array(data)));
  }
  return tsSorted(data);
}
function mean(data) {
  if (wasmInstance) return wasmInstance.mean(new Float64Array(data));
  return tsMean(data);
}
function median(data) {
  const s = sorted(data);
  const datum = wasmInstance ? wasmInstance.medianSorted(new Float64Array(s)) : tsMedian(s);
  const depth = wasmInstance ? wasmInstance.medianDepth(data.length) : tsMedianDepth(data.length);
  return { datum, depth };
}
function mode(data) {
  if (wasmInstance) {
    const result = wasmInstance.mode(new Float64Array(data));
    return { count: result[0], data: Array.from(result.slice(1)) };
  }
  return tsMode(data);
}
function extremes(data) {
  if (wasmInstance) {
    const result = wasmInstance.extremes(new Float64Array(data));
    return [result[0], result[1]];
  }
  return tsExtremes(tsSorted(data));
}
function variance(data) {
  if (wasmInstance) return wasmInstance.variance(new Float64Array(data));
  return tsVariance(data);
}
function stddev(data) {
  if (wasmInstance) return wasmInstance.stddev(new Float64Array(data));
  return tsStddev(data);
}
function skewness(data) {
  if (wasmInstance) return wasmInstance.skewness(new Float64Array(data));
  return tsSkewness(data);
}
function kurtosis(data) {
  if (wasmInstance) return wasmInstance.kurtosis(new Float64Array(data));
  return tsKurtosis(data);
}
function hinges(data) {
  const s = sorted(data);
  if (wasmInstance) {
    const result = wasmInstance.hingesSorted(new Float64Array(s));
    if (isNaN(result[0])) return [];
    return [
      { datum: result[0], depth: result[1] },
      { datum: result[2], depth: result[3] }
    ];
  }
  return tsHinges(s);
}
function iqr(data) {
  return tsIqr(hinges(data));
}
function fences(data, multiple = 1.5) {
  const s = sorted(data);
  const med = wasmInstance ? wasmInstance.medianSorted(new Float64Array(s)) : tsMedian(s);
  const iqrVal = tsIqr(hinges(data));
  if (wasmInstance) {
    const result = wasmInstance.fences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsFences(med, iqrVal, multiple);
}
function outerFences(data, multiple = 1.5) {
  const s = sorted(data);
  const med = wasmInstance ? wasmInstance.medianSorted(new Float64Array(s)) : tsMedian(s);
  const iqrVal = tsIqr(hinges(data));
  if (wasmInstance) {
    const result = wasmInstance.outerFences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsOuterFences(med, iqrVal, multiple);
}
function outliers(data, multiple = 1.5) {
  const s = sorted(data);
  const f = fences(data, multiple);
  if (wasmInstance) {
    return Array.from(wasmInstance.outliers(new Float64Array(s), f[0], f[1]));
  }
  return tsOutliers(s, f);
}
function adjacent(data) {
  const s = sorted(data);
  const f = fences(data);
  return tsAdjacent(s, f);
}
function inside(data) {
  const s = sorted(data);
  const f = fences(data);
  return tsInside(s, f);
}
function outside(data) {
  const s = sorted(data);
  const outer = outerFences(data);
  return tsOutside(s, outer);
}
function counts(data) {
  return tsCounts(sorted(data));
}
function ranked(data) {
  return tsRanked(sorted(data));
}
function binned(data) {
  const s = sorted(data);
  const ext = s.length ? [s[0], s[s.length - 1]] : [];
  return tsBinned(s, ext);
}
function logs(data) {
  if (wasmInstance) return Array.from(wasmInstance.logs(new Float64Array(data)));
  return tsLogs(data);
}
function roots(data) {
  if (wasmInstance) return Array.from(wasmInstance.roots(new Float64Array(data)));
  return tsRoots(data);
}
function inverse(data) {
  if (wasmInstance) return Array.from(wasmInstance.inverse(new Float64Array(data)));
  return tsInverse(data);
}
function zscore(data) {
  if (wasmInstance) return Array.from(wasmInstance.zscoreCalc(new Float64Array(data)));
  return tsZscore(data);
}
function hanning(data) {
  if (wasmInstance) return Array.from(wasmInstance.hanning(new Float64Array(data)));
  return tsHanning(data);
}
function smooth(data) {
  if (wasmInstance) return Array.from(wasmInstance.smooth(new Float64Array(data)));
  return tsSmooth(data);
}
function rough(data) {
  const smoothed = smooth(data);
  if (wasmInstance) {
    return Array.from(
      wasmInstance.roughCalc(new Float64Array(data), new Float64Array(smoothed))
    );
  }
  return tsRough(data, smoothed);
}
function ema(data, alpha) {
  if (wasmInstance) return Array.from(wasmInstance.emaCalc(new Float64Array(data), alpha));
  return tsEma(data, alpha);
}
function trimean(data) {
  const med = median(data);
  const h = hinges(data);
  if (h.length < 2) return med.datum;
  return tsTrimean(h[0].datum, med.datum, h[1].datum);
}
function letterValues(data) {
  const s = sorted(data);
  const med = median(data);
  return tsLetterValues(s, med);
}
function stemLeaf(data, leafDigits = 1) {
  return tsStemLeaf(sorted(data), leafDigits);
}
function midSummaries(data) {
  return letterValues(data).map(({ depth, mid, spread }) => ({ depth, mid, spread }));
}
function cosineSimilarity(a, b) {
  if (wasmInstance) return wasmInstance.cosineSim(new Float64Array(a), new Float64Array(b));
  return tsCosineSimilarity(a, b);
}
function squaredEuclideanDistance(a, b) {
  if (wasmInstance) return wasmInstance.sqEuclideanDist(new Float64Array(a), new Float64Array(b));
  return tsSqEuclideanDistance(a, b);
}
function euclideanDistance(a, b) {
  if (wasmInstance) return wasmInstance.euclideanDist(new Float64Array(a), new Float64Array(b));
  return tsEuclideanDistance(a, b);
}
function manhattanDistance(a, b) {
  if (wasmInstance) return wasmInstance.manhattanDist(new Float64Array(a), new Float64Array(b));
  return tsManhattanDistance(a, b);
}
function mahalanobisDistance(point, means, variances, epsilon = 1e-8) {
  if (wasmInstance) {
    return wasmInstance.mahalanobisDist(
      new Float64Array(point),
      new Float64Array(means),
      new Float64Array(variances)
    );
  }
  return tsMahalanobisDistance(point, means, variances, epsilon);
}
function normalizeL2(vector) {
  if (wasmInstance) return Array.from(wasmInstance.normalizeL2Vec(new Float64Array(vector)));
  return tsNormalizeL2(vector);
}
function cosineSimilaritySparse(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [key, val] of small) {
    const other = large.get(key);
    if (other !== void 0) dot += val * other;
    magA += val * val;
  }
  for (const val of large.values()) magB += val * val;
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
function jaccardSimilarity(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union <= 0 ? 0 : intersection / union;
}
function overlapCoefficient(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const value of small) {
    if (large.has(value)) intersection++;
  }
  const minSize = Math.min(a.size, b.size);
  return minSize <= 0 ? 0 : intersection / minSize;
}
function analyze(data) {
  const s = sorted(data);
  const ext = s.length ? [s[0], s[s.length - 1]] : [NaN, NaN];
  const med = median(data);
  const h = hinges(data);
  const iqrVal = tsIqr(h);
  const f = fences(data);
  const of = outerFences(data);
  return {
    original: data,
    summary: {
      median: med,
      mean: mean(data),
      mode: mode(data),
      hinges: h,
      adjacent: tsAdjacent(s, f),
      outliers: tsOutliers(s, f),
      outer: of,
      outside: tsOutside(s, of),
      inside: tsInside(s, f),
      extremes: ext,
      iqr: iqrVal,
      fences: f
    },
    smooths: {
      smooth: smooth(data),
      hanning: hanning(data)
    },
    transforms: {
      logs: logs(data),
      roots: roots(data),
      inverse: inverse(data)
    },
    counts: counts(data),
    sorted: s,
    ranked: ranked(data),
    binned: binned(data),
    implementation: wasmInstance ? "wasm" : "typescript"
  };
}
export {
  adjacent,
  analyze,
  binned,
  cosineSimilarity,
  cosineSimilaritySparse,
  counts,
  ema,
  euclideanDistance,
  extremes,
  fences,
  hanning,
  hinges,
  inside,
  inverse,
  iqr,
  isWasmLoaded,
  jaccardSimilarity,
  kurtosis,
  letterValues,
  loadWasm,
  logs,
  mahalanobisDistance,
  manhattanDistance,
  mean,
  median,
  midSummaries,
  mode,
  normalizeL2,
  outerFences,
  outliers,
  outside,
  overlapCoefficient,
  ranked,
  roots,
  rough,
  skewness,
  smooth,
  sorted,
  squaredEuclideanDistance,
  stddev,
  stemLeaf,
  trimean,
  variance,
  zscore
};
//# sourceMappingURL=index.js.map