// Zlib shim for React Native
// Provides empty/mock exports for Node's zlib module

export const gzip = (data, callback) => {
  if (callback) callback(null, data);
  return data;
};

export const gunzip = (data, callback) => {
  if (callback) callback(null, data);
  return data;
};

export const deflate = (data, callback) => {
  if (callback) callback(null, data);
  return data;
};

export const inflate = (data, callback) => {
  if (callback) callback(null, data);
  return data;
};

export const createGzip = () => ({ pipe: () => {} });
export const createGunzip = () => ({ pipe: () => {} });
export const createDeflate = () => ({ pipe: () => {} });
export const createInflate = () => ({ pipe: () => {} });

export default {
  gzip,
  gunzip,
  deflate,
  inflate,
  createGzip,
  createGunzip,
  createDeflate,
  createInflate,
};
