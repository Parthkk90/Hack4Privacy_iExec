// Process shim for React Native

export const env = {};
export const argv = [];
export const platform = 'react-native';
export const version = '';
export const versions = {};
export const cwd = () => '/';
export const chdir = () => {};
export const exit = () => {};
export const pid = 0;
export const ppid = 0;
export const title = 'react-native';
export const arch = 'unknown';
export const release = {};
export const umask = () => 0;
export const hrtime = () => [0, 0];
export const uptime = () => 0;
export const memoryUsage = () => ({ heapTotal: 0, heapUsed: 0 });
export const nextTick = (callback, ...args) => setTimeout(() => callback(...args), 0);

export default {
  env,
  argv,
  platform,
  version,
  versions,
  cwd,
  chdir,
  exit,
  pid,
  ppid,
  title,
  arch,
  release,
  umask,
  hrtime,
  uptime,
  memoryUsage,
  nextTick,
};
