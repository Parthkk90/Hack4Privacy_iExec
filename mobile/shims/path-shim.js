// Path shim for React Native

export const sep = '/';
export const delimiter = ':';

export const basename = (path, ext) => {
  const parts = path.split(/[\\/]/);
  let base = parts[parts.length - 1] || '';
  if (ext && base.endsWith(ext)) {
    base = base.slice(0, -ext.length);
  }
  return base;
};

export const dirname = (path) => {
  const parts = path.split(/[\\/]/);
  parts.pop();
  return parts.join('/') || '/';
};

export const extname = (path) => {
  const base = basename(path);
  const idx = base.lastIndexOf('.');
  return idx > 0 ? base.slice(idx) : '';
};

export const join = (...paths) => {
  return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
};

export const resolve = (...paths) => {
  return '/' + join(...paths).replace(/^\/+/, '');
};

export const normalize = (path) => {
  return path.replace(/\/+/g, '/');
};

export const isAbsolute = (path) => path.startsWith('/');

export const parse = (path) => ({
  root: isAbsolute(path) ? '/' : '',
  dir: dirname(path),
  base: basename(path),
  ext: extname(path),
  name: basename(path, extname(path)),
});

export const format = (pathObject) => {
  return join(pathObject.dir, pathObject.base);
};

export default {
  sep,
  delimiter,
  basename,
  dirname,
  extname,
  join,
  resolve,
  normalize,
  isAbsolute,
  parse,
  format,
};
