// Buffer shim for React Native
// Uses the global Buffer if available, otherwise provides minimal implementation

export const Buffer = globalThis.Buffer || class Buffer {
  constructor(arg, encoding) {
    if (typeof arg === 'number') {
      this.data = new Uint8Array(arg);
    } else if (typeof arg === 'string') {
      const encoder = new TextEncoder();
      this.data = encoder.encode(arg);
    } else if (arg instanceof Uint8Array) {
      this.data = arg;
    } else if (Array.isArray(arg)) {
      this.data = new Uint8Array(arg);
    }
    this.length = this.data?.length || 0;
  }

  static from(data, encoding) {
    return new Buffer(data, encoding);
  }

  static alloc(size) {
    return new Buffer(size);
  }

  static allocUnsafe(size) {
    return new Buffer(size);
  }

  static isBuffer(obj) {
    return obj instanceof Buffer;
  }

  static concat(list) {
    const totalLength = list.reduce((acc, buf) => acc + buf.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    list.forEach(buf => {
      result.set(buf.data || buf, offset);
      offset += buf.length;
    });
    return new Buffer(result);
  }

  toString(encoding) {
    const decoder = new TextDecoder(encoding || 'utf-8');
    return decoder.decode(this.data);
  }

  slice(start, end) {
    return new Buffer(this.data.slice(start, end));
  }
};

export default { Buffer };
