// HTTP shim for React Native
// Axios doesn't actually use Node's http in React Native context

export const request = () => {
  throw new Error('http.request is not supported in React Native');
};

export const get = () => {
  throw new Error('http.get is not supported in React Native');
};

export const Agent = class Agent {
  constructor() {}
};

export const globalAgent = new Agent();

export const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
export const STATUS_CODES = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

export default {
  request,
  get,
  Agent,
  globalAgent,
  METHODS,
  STATUS_CODES,
};
