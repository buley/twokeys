/**
 * @twokeys/wasm - AssemblyScript implementation of Twokeys statistical functions
 *
 * High-performance WASM implementation of core statistical algorithms.
 */

// =============================================================================
// Memory management helpers
// =============================================================================

/** Allocate a Float64 array and return pointer */
export function allocateF64Array(length: i32): usize {
  return heap.alloc(length * 8);
}

/** Free allocated memory */
export function freeMemory(ptr: usize): void {
  heap.free(ptr);
}

/** Get length from array pointer (stored at offset -4) */
function getArrayLength(ptr: usize): i32 {
  return load<i32>(ptr - 4);
}

// =============================================================================
// Sorting (QuickSort)
// =============================================================================

function partition(arr: Float64Array, low: i32, high: i32): i32 {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  return i + 1;
}

function quicksort(arr: Float64Array, low: i32, high: i32): void {
  if (low < high) {
    const pi = partition(arr, low, high);
    quicksort(arr, low, pi - 1);
    quicksort(arr, pi + 1, high);
  }
}

/** Sort array in place and return sorted copy */
export function sort(data: Float64Array): Float64Array {
  const len = data.length;
  const result = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = data[i];
  }
  if (len > 1) {
    quicksort(result, 0, len - 1);
  }
  return result;
}

// =============================================================================
// Mean
// =============================================================================

/** Calculate arithmetic mean */
export function mean(data: Float64Array): f64 {
  const len = data.length;
  if (len === 0) return NaN;
  let sum: f64 = 0;
  for (let i = 0; i < len; i++) {
    sum += data[i];
  }
  return sum / len;
}

// =============================================================================
// Median
// =============================================================================

/** Calculate median of sorted array */
export function medianSorted(sorted: Float64Array): f64 {
  const len = sorted.length;
  if (len === 0) return NaN;
  if (len === 1) return sorted[0];

  const mid = len >> 1; // integer division by 2
  if ((len & 1) === 0) {
    // even length
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/** Calculate median (will sort internally) */
export function median(data: Float64Array): f64 {
  const sorted = sort(data);
  return medianSorted(sorted);
}

/** Calculate median depth */
export function medianDepth(length: i32, offset: i32 = 0): f64 {
  if (length === 0) return NaN;
  return <f64>offset + (<f64>length + 1) / 2;
}

// =============================================================================
// Mode
// =============================================================================

/** Mode result: [count, ...modes] */
export function mode(data: Float64Array): Float64Array {
  const len = data.length;
  if (len === 0) {
    const result = new Float64Array(1);
    result[0] = 0;
    return result;
  }

  // Use sorted data to count frequencies efficiently
  const sorted = sort(data);
  let maxCount: i32 = 1;
  let currentCount: i32 = 1;
  let currentVal = sorted[0];
  const counts = new Map<f64, i32>();
  counts.set(currentVal, 1);

  for (let i = 1; i < len; i++) {
    if (sorted[i] === currentVal) {
      currentCount++;
      counts.set(currentVal, currentCount);
      if (currentCount > maxCount) {
        maxCount = currentCount;
      }
    } else {
      currentVal = sorted[i];
      currentCount = 1;
      counts.set(currentVal, 1);
    }
  }

  // Collect modes (values with max frequency)
  const modes: f64[] = [];
  const keys = counts.keys();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (counts.get(key) === maxCount) {
      modes.push(key);
    }
  }

  // Return [count, ...modes]
  const result = new Float64Array(modes.length + 1);
  result[0] = <f64>maxCount;
  for (let i = 0; i < modes.length; i++) {
    result[i + 1] = modes[i];
  }
  return result;
}

// =============================================================================
// Extremes
// =============================================================================

/** Get [min, max] from sorted array */
export function extremesSorted(sorted: Float64Array): Float64Array {
  const len = sorted.length;
  const result = new Float64Array(2);
  if (len === 0) {
    result[0] = NaN;
    result[1] = NaN;
    return result;
  }
  result[0] = sorted[0];
  result[1] = sorted[len - 1];
  return result;
}

/** Get [min, max] */
export function extremes(data: Float64Array): Float64Array {
  const len = data.length;
  const result = new Float64Array(2);
  if (len === 0) {
    result[0] = NaN;
    result[1] = NaN;
    return result;
  }
  let min = data[0];
  let max = data[0];
  for (let i = 1; i < len; i++) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  result[0] = min;
  result[1] = max;
  return result;
}

// =============================================================================
// Hinges (Quartiles)
// =============================================================================

/** Calculate hinges (Q1 and Q3) from sorted data */
export function hingesSorted(sorted: Float64Array): Float64Array {
  const len = sorted.length;
  const result = new Float64Array(4); // [q1, q1_depth, q3, q3_depth]

  if (len < 4) {
    result[0] = NaN;
    result[1] = NaN;
    result[2] = NaN;
    result[3] = NaN;
    return result;
  }

  const per = len >> 1; // len / 2

  // Q1: median of first half
  const q1End = per;
  const q1Mid = q1End >> 1;
  if ((q1End & 1) === 0) {
    result[0] = (sorted[q1Mid - 1] + sorted[q1Mid]) / 2;
  } else {
    result[0] = sorted[q1Mid];
  }
  result[1] = medianDepth(q1End, 0);

  // Q3: median of second half
  const q3Start = per;
  const q3Len = len - q3Start;
  const q3Mid = q3Start + (q3Len >> 1);
  if ((q3Len & 1) === 0) {
    result[2] = (sorted[q3Mid - 1] + sorted[q3Mid]) / 2;
  } else {
    result[2] = sorted[q3Mid];
  }
  result[3] = medianDepth(q3Len, q3Start);

  return result;
}

// =============================================================================
// IQR (Interquartile Range)
// =============================================================================

/** Calculate IQR from hinges [q1, q1_depth, q3, q3_depth] */
export function iqrFromHinges(hinges: Float64Array): f64 {
  if (hinges.length < 4) return NaN;
  return Math.abs(hinges[2] - hinges[0]);
}

// =============================================================================
// Fences
// =============================================================================

/** Calculate inner fences (1.5 * IQR) */
export function fences(median: f64, iqr: f64, multiple: f64 = 1.5): Float64Array {
  const result = new Float64Array(2);
  if (isNaN(median) || isNaN(iqr)) {
    result[0] = NaN;
    result[1] = NaN;
    return result;
  }
  const extra = iqr * multiple;
  result[0] = median - extra;
  result[1] = median + extra;
  return result;
}

/** Calculate outer fences (3 * IQR) */
export function outerFences(median: f64, iqr: f64, multiple: f64 = 1.5): Float64Array {
  const result = new Float64Array(2);
  if (isNaN(median) || isNaN(iqr)) {
    result[0] = NaN;
    result[1] = NaN;
    return result;
  }
  const extra = 2 * iqr * multiple;
  result[0] = median - extra;
  result[1] = median + extra;
  return result;
}

// =============================================================================
// Outliers
// =============================================================================

/** Find outliers (values outside fences) */
export function outliers(sorted: Float64Array, fenceLow: f64, fenceHigh: f64): Float64Array {
  const len = sorted.length;
  const temp: f64[] = [];

  for (let i = 0; i < len; i++) {
    if (sorted[i] < fenceLow || sorted[i] > fenceHigh) {
      temp.push(sorted[i]);
    }
  }

  const result = new Float64Array(temp.length);
  for (let i = 0; i < temp.length; i++) {
    result[i] = temp[i];
  }
  return result;
}

// =============================================================================
// Transforms
// =============================================================================

/** Natural logarithm transform */
export function logs(data: Float64Array): Float64Array {
  const len = data.length;
  const result = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = Math.log(data[i]);
  }
  return result;
}

/** Square root transform */
export function roots(data: Float64Array): Float64Array {
  const len = data.length;
  const result = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = Math.sqrt(data[i]);
  }
  return result;
}

/** Inverse (1/x) transform */
export function inverse(data: Float64Array): Float64Array {
  const len = data.length;
  const result = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = 1 / data[i];
  }
  return result;
}

// =============================================================================
// Hanning Filter
// =============================================================================

/** Hanning filter (running weighted average) */
export function hanning(data: Float64Array): Float64Array {
  const len = data.length;
  if (len < 2) {
    const result = new Float64Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = data[i];
    }
    return result;
  }

  const result = new Float64Array(len);
  result[0] = data[0];
  result[len - 1] = data[len - 1];

  for (let i = 1; i < len - 1; i++) {
    result[i] = (data[i] + data[i + 1]) / 2;
  }

  return result;
}

// =============================================================================
// Smooth (Tukey's 3RSSH)
// =============================================================================

/** Running median of 3 */
function smoothMedianPass(data: Float64Array): Float64Array {
  const len = data.length;
  if (len <= 2) {
    const result = new Float64Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = data[i];
    }
    return result;
  }

  const result = new Float64Array(len);
  result[0] = data[0];
  result[len - 1] = data[len - 1];

  for (let i = 1; i < len - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];
    // Median of three
    if (prev <= curr) {
      if (curr <= next) {
        result[i] = curr;
      } else if (prev <= next) {
        result[i] = next;
      } else {
        result[i] = prev;
      }
    } else {
      if (prev <= next) {
        result[i] = prev;
      } else if (curr <= next) {
        result[i] = next;
      } else {
        result[i] = curr;
      }
    }
  }

  return result;
}

/** Smooth endpoints */
function smoothExtremes(data: Float64Array): Float64Array {
  const len = data.length;
  if (len <= 2) {
    const result = new Float64Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = data[i];
    }
    return result;
  }

  const result = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = data[i];
  }

  // Head
  const first = data[0];
  const second = data[1];
  const third = data[2];
  const tmpHead = second - 2 * (third - second);
  // Median of three
  if (first <= second) {
    if (second <= tmpHead) {
      result[0] = second;
    } else if (first <= tmpHead) {
      result[0] = tmpHead;
    } else {
      result[0] = first;
    }
  } else {
    if (first <= tmpHead) {
      result[0] = first;
    } else if (second <= tmpHead) {
      result[0] = tmpHead;
    } else {
      result[0] = second;
    }
  }

  // Tail
  const ante = data[len - 3];
  const pen = data[len - 2];
  const last = data[len - 1];
  const tmpTail = pen - 2 * (ante - pen);
  if (last <= pen) {
    if (pen <= tmpTail) {
      result[len - 1] = pen;
    } else if (last <= tmpTail) {
      result[len - 1] = tmpTail;
    } else {
      result[len - 1] = last;
    }
  } else {
    if (last <= tmpTail) {
      result[len - 1] = last;
    } else if (pen <= tmpTail) {
      result[len - 1] = tmpTail;
    } else {
      result[len - 1] = pen;
    }
  }

  return result;
}

/** Tukey's 3RSSH smoothing */
export function smooth(data: Float64Array): Float64Array {
  let result = data;

  // 3 passes of running median
  for (let i = 0; i < 3; i++) {
    result = smoothMedianPass(result);
  }

  // Smooth extremes
  result = smoothExtremes(result);

  // 3 more passes
  for (let i = 0; i < 3; i++) {
    result = smoothMedianPass(result);
  }

  // Final extremes
  result = smoothExtremes(result);

  // One more median pass
  for (let i = 0; i < 3; i++) {
    result = smoothMedianPass(result);
  }

  return result;
}
