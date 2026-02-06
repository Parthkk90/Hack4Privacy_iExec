const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: path.resolve(__dirname, 'shims/crypto-shim.js'),
  stream: path.resolve(__dirname, 'shims/stream-shim.js'),
  buffer: path.resolve(__dirname, 'shims/buffer-shim.js'),
  process: path.resolve(__dirname, 'shims/process-shim.js'),
  events: path.resolve(__dirname, 'shims/events-shim.js'),
  http: path.resolve(__dirname, 'shims/http-shim.js'),
  https: path.resolve(__dirname, 'shims/https-shim.js'),
  path: path.resolve(__dirname, 'shims/path-shim.js'),
  url: path.resolve(__dirname, 'shims/url-shim.js'),
  util: path.resolve(__dirname, 'shims/util-shim.js'),
  zlib: path.resolve(__dirname, 'shims/zlib-shim.js'),
  querystring: path.resolve(__dirname, 'shims/querystring-shim.js'),
};

module.exports = config;

