// URL shim for React Native
// Provides basic URL parsing for Node's url module

export function parse(urlString) {
  try {
    const url = new URL(urlString);
    return {
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      href: url.href,
    };
  } catch (e) {
    return {};
  }
}

export function format(urlObject) {
  if (typeof urlObject === 'string') return urlObject;
  const { protocol, hostname, port, pathname, search, hash } = urlObject;
  let url = '';
  if (protocol) url += protocol + '//';
  if (hostname) url += hostname;
  if (port) url += ':' + port;
  if (pathname) url += pathname;
  if (search) url += search;
  if (hash) url += hash;
  return url;
}

export function resolve(from, to) {
  try {
    return new URL(to, from).href;
  } catch (e) {
    return to;
  }
}

export const URL = globalThis.URL;
export const URLSearchParams = globalThis.URLSearchParams;

export default {
  parse,
  format,
  resolve,
  URL,
  URLSearchParams,
};
