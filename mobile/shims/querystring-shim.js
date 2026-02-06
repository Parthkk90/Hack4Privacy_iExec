// Querystring shim for React Native

export const parse = (str, sep = '&', eq = '=') => {
  const result = {};
  if (!str) return result;
  
  str.split(sep).forEach(pair => {
    const [key, value] = pair.split(eq);
    if (key) {
      result[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  });
  
  return result;
};

export const stringify = (obj, sep = '&', eq = '=') => {
  if (!obj) return '';
  
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}${eq}${encodeURIComponent(obj[key])}`)
    .join(sep);
};

export const encode = stringify;
export const decode = parse;

export default {
  parse,
  stringify,
  encode,
  decode,
};
