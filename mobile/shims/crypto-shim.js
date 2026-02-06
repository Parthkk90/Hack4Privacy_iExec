// Crypto shim for React Native
// Provides empty/mock exports for Node's crypto module

export const randomBytes = (size) => {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
};

export const createHash = () => ({
  update: () => ({ digest: () => 'mock-hash' }),
});

export const createHmac = () => ({
  update: () => ({ digest: () => 'mock-hmac' }),
});

export default {
  randomBytes,
  createHash,
  createHmac,
};
