// Util shim for React Native

export const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
};

export const inherits = (ctor, superCtor) => {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
  });
};

export const deprecate = (fn, msg) => fn;
export const debuglog = () => () => {};
export const inspect = (obj) => JSON.stringify(obj, null, 2);
export const format = (...args) => args.join(' ');
export const isDeepStrictEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default {
  promisify,
  inherits,
  deprecate,
  debuglog,
  inspect,
  format,
  isDeepStrictEqual,
};
