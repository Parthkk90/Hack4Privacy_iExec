// HTTPS shim for React Native
// Axios doesn't actually use Node's https in React Native context

export const request = () => {
  throw new Error('https.request is not supported in React Native');
};

export const get = () => {
  throw new Error('https.get is not supported in React Native');
};

export const Agent = class Agent {
  constructor() {}
};

export const globalAgent = new Agent();

export default {
  request,
  get,
  Agent,
  globalAgent,
};
