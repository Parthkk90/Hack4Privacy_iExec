import { registerRootComponent } from 'expo';

// Set up global polyfills for Node.js modules BEFORE importing anything else
import process from './shims/process-shim';

global.process = process;
global.process.env = global.process.env || {};

// Polyfill Buffer if needed
if (typeof global.Buffer === 'undefined') {
  global.Buffer = {
    from: (str) => ({ toString: () => str }),
    isBuffer: () => false,
  };
}

import App from './App';

registerRootComponent(App);
