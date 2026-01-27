async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    allocateF64Array(length) {
      // assembly/index/allocateF64Array(i32) => usize
      return exports.allocateF64Array(length) >>> 0;
    },
    sort(data) {
      // assembly/index/sort(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.sort(data) >>> 0);
    },
    mean(data) {
      // assembly/index/mean(~lib/typedarray/Float64Array) => f64
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return exports.mean(data);
    },
    medianSorted(sorted) {
      // assembly/index/medianSorted(~lib/typedarray/Float64Array) => f64
      sorted = __lowerTypedArray(Float64Array, 4, 3, sorted) || __notnull();
      return exports.medianSorted(sorted);
    },
    median(data) {
      // assembly/index/median(~lib/typedarray/Float64Array) => f64
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return exports.median(data);
    },
    mode(data) {
      // assembly/index/mode(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.mode(data) >>> 0);
    },
    extremesSorted(sorted) {
      // assembly/index/extremesSorted(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      sorted = __lowerTypedArray(Float64Array, 4, 3, sorted) || __notnull();
      return __liftTypedArray(Float64Array, exports.extremesSorted(sorted) >>> 0);
    },
    extremes(data) {
      // assembly/index/extremes(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.extremes(data) >>> 0);
    },
    hingesSorted(sorted) {
      // assembly/index/hingesSorted(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      sorted = __lowerTypedArray(Float64Array, 4, 3, sorted) || __notnull();
      return __liftTypedArray(Float64Array, exports.hingesSorted(sorted) >>> 0);
    },
    iqrFromHinges(hinges) {
      // assembly/index/iqrFromHinges(~lib/typedarray/Float64Array) => f64
      hinges = __lowerTypedArray(Float64Array, 4, 3, hinges) || __notnull();
      return exports.iqrFromHinges(hinges);
    },
    fences(median, iqr, multiple) {
      // assembly/index/fences(f64, f64, f64?) => ~lib/typedarray/Float64Array
      exports.__setArgumentsLength(arguments.length);
      return __liftTypedArray(Float64Array, exports.fences(median, iqr, multiple) >>> 0);
    },
    outerFences(median, iqr, multiple) {
      // assembly/index/outerFences(f64, f64, f64?) => ~lib/typedarray/Float64Array
      exports.__setArgumentsLength(arguments.length);
      return __liftTypedArray(Float64Array, exports.outerFences(median, iqr, multiple) >>> 0);
    },
    outliers(sorted, fenceLow, fenceHigh) {
      // assembly/index/outliers(~lib/typedarray/Float64Array, f64, f64) => ~lib/typedarray/Float64Array
      sorted = __lowerTypedArray(Float64Array, 4, 3, sorted) || __notnull();
      return __liftTypedArray(Float64Array, exports.outliers(sorted, fenceLow, fenceHigh) >>> 0);
    },
    logs(data) {
      // assembly/index/logs(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.logs(data) >>> 0);
    },
    roots(data) {
      // assembly/index/roots(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.roots(data) >>> 0);
    },
    inverse(data) {
      // assembly/index/inverse(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.inverse(data) >>> 0);
    },
    hanning(data) {
      // assembly/index/hanning(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.hanning(data) >>> 0);
    },
    smooth(data) {
      // assembly/index/smooth(~lib/typedarray/Float64Array) => ~lib/typedarray/Float64Array
      data = __lowerTypedArray(Float64Array, 4, 3, data) || __notnull();
      return __liftTypedArray(Float64Array, exports.smooth(data) >>> 0);
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __liftTypedArray(constructor, pointer) {
    if (!pointer) return null;
    return new constructor(
      memory.buffer,
      __getU32(pointer + 4),
      __dataview.getUint32(pointer + 8, true) / constructor.BYTES_PER_ELEMENT
    ).slice();
  }
  function __lowerTypedArray(constructor, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__new(12, id) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    new constructor(memory.buffer, buffer, length).set(values);
    exports.__unpin(buffer);
    return header;
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU32(pointer, value) {
    try {
      __dataview.setUint32(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint32(pointer, value, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
export const {
  memory,
  allocateF64Array,
  freeMemory,
  sort,
  mean,
  medianSorted,
  median,
  medianDepth,
  mode,
  extremesSorted,
  extremes,
  hingesSorted,
  iqrFromHinges,
  fences,
  outerFences,
  outliers,
  logs,
  roots,
  inverse,
  hanning,
  smooth,
} = await (async url => instantiate(
  await (async () => {
    const isNodeOrBun = typeof process != "undefined" && process.versions != null && (process.versions.node != null || process.versions.bun != null);
    if (isNodeOrBun) { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
    else { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
  })(), {
  }
))(new URL("debug.wasm", import.meta.url));
