// Stream shim for React Native
// Provides empty exports for Node's stream module

export class Readable {
  constructor() {}
  pipe() { return this; }
  on() { return this; }
  read() { return null; }
}

export class Writable {
  constructor() {}
  write() { return true; }
  end() {}
  on() { return this; }
}

export class Transform extends Readable {
  constructor() { super(); }
}

export class Duplex extends Readable {
  constructor() { super(); }
  write() { return true; }
  end() {}
}

export default {
  Readable,
  Writable,
  Transform,
  Duplex,
};
