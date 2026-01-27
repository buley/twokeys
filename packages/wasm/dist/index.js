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
function tsIqr(hinges2) {
  if (hinges2.length < 2) return NaN;
  return Math.abs(hinges2[1].datum - hinges2[0].datum);
}
function tsFences(median2, iqr2, multiple = 1.5) {
  if (isNaN(median2) || isNaN(iqr2)) return [NaN, NaN];
  const extra = iqr2 * multiple;
  return [median2 - extra, median2 + extra];
}
function tsOuterFences(median2, iqr2, multiple = 1.5) {
  if (isNaN(median2) || isNaN(iqr2)) return [NaN, NaN];
  const extra = 2 * iqr2 * multiple;
  return [median2 - extra, median2 + extra];
}
function tsOutliers(sorted2, fences2) {
  if (isNaN(fences2[0]) || isNaN(fences2[1])) return [];
  return sorted2.filter((n) => n < fences2[0] || n > fences2[1]);
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
    } catch (e) {
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
    const input = new Float64Array(data);
    const result = wasmInstance.sort(input);
    return Array.from(result);
  }
  return tsSorted(data);
}
function mean(data) {
  if (wasmInstance) {
    return wasmInstance.mean(new Float64Array(data));
  }
  return tsMean(data);
}
function median(data) {
  const sortedData = sorted(data);
  const datum = wasmInstance ? wasmInstance.medianSorted(new Float64Array(sortedData)) : tsMedian(sortedData);
  const depth = wasmInstance ? wasmInstance.medianDepth(data.length) : tsMedianDepth(data.length);
  return { datum, depth };
}
function mode(data) {
  if (wasmInstance) {
    const result = wasmInstance.mode(new Float64Array(data));
    const count = result[0];
    const modes = Array.from(result.slice(1));
    return { count, data: modes };
  }
  return tsMode(data);
}
function extremes(data) {
  if (wasmInstance) {
    const result = wasmInstance.extremes(new Float64Array(data));
    return [result[0], result[1]];
  }
  const sortedData = tsSorted(data);
  return tsExtremes(sortedData);
}
function hinges(data) {
  const sortedData = sorted(data);
  if (wasmInstance) {
    const result = wasmInstance.hingesSorted(new Float64Array(sortedData));
    if (isNaN(result[0])) return [];
    return [
      { datum: result[0], depth: result[1] },
      { datum: result[2], depth: result[3] }
    ];
  }
  return tsHinges(sortedData);
}
function iqr(data) {
  const h = hinges(data);
  return tsIqr(h);
}
function fences(data, multiple = 1.5) {
  const sortedData = sorted(data);
  const med = wasmInstance ? wasmInstance.medianSorted(new Float64Array(sortedData)) : tsMedian(sortedData);
  const h = hinges(data);
  const iqrVal = tsIqr(h);
  if (wasmInstance) {
    const result = wasmInstance.fences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsFences(med, iqrVal, multiple);
}
function outerFences(data, multiple = 1.5) {
  const sortedData = sorted(data);
  const med = wasmInstance ? wasmInstance.medianSorted(new Float64Array(sortedData)) : tsMedian(sortedData);
  const h = hinges(data);
  const iqrVal = tsIqr(h);
  if (wasmInstance) {
    const result = wasmInstance.outerFences(med, iqrVal, multiple);
    return [result[0], result[1]];
  }
  return tsOuterFences(med, iqrVal, multiple);
}
function outliers(data, multiple = 1.5) {
  const sortedData = sorted(data);
  const f = fences(data, multiple);
  if (wasmInstance) {
    const result = wasmInstance.outliers(new Float64Array(sortedData), f[0], f[1]);
    return Array.from(result);
  }
  return tsOutliers(sortedData, f);
}
function logs(data) {
  if (wasmInstance) {
    const result = wasmInstance.logs(new Float64Array(data));
    return Array.from(result);
  }
  return tsLogs(data);
}
function roots(data) {
  if (wasmInstance) {
    const result = wasmInstance.roots(new Float64Array(data));
    return Array.from(result);
  }
  return tsRoots(data);
}
function inverse(data) {
  if (wasmInstance) {
    const result = wasmInstance.inverse(new Float64Array(data));
    return Array.from(result);
  }
  return tsInverse(data);
}
function hanning(data) {
  if (wasmInstance) {
    const result = wasmInstance.hanning(new Float64Array(data));
    return Array.from(result);
  }
  return tsHanning(data);
}
function smooth(data) {
  if (wasmInstance) {
    const result = wasmInstance.smooth(new Float64Array(data));
    return Array.from(result);
  }
  return tsSmooth(data);
}
function analyze(data) {
  const sortedData = sorted(data);
  const med = median(data);
  const m = mean(data);
  const mo = mode(data);
  const ext = extremes(data);
  const h = hinges(data);
  const iqrVal = iqr(data);
  const f = fences(data);
  const out = outliers(data);
  return {
    sorted: sortedData,
    summary: {
      median: med,
      mean: m,
      mode: mo,
      extremes: ext,
      hinges: h,
      iqr: iqrVal,
      fences: f,
      outliers: out
    },
    transforms: {
      logs: logs(data),
      roots: roots(data),
      inverse: inverse(data)
    },
    smooths: {
      hanning: hanning(data),
      smooth: smooth(data)
    },
    implementation: wasmInstance ? "wasm" : "typescript"
  };
}
export {
  analyze,
  extremes,
  fences,
  hanning,
  hinges,
  inverse,
  iqr,
  isWasmLoaded,
  loadWasm,
  logs,
  mean,
  median,
  mode,
  outerFences,
  outliers,
  roots,
  smooth,
  sorted
};
//# sourceMappingURL=index.js.map