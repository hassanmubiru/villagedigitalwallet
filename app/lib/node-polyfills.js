'use client'

/**
 * This file provides browser-compatible versions of Node.js built-in modules
 * that are required by ContractKit but not available in the browser.
 * It's used by the Next.js webpack config to provide polyfills.
 */

// Empty implementations for Node.js specific modules
export const fs = {};
export const net = {};
export const tls = {};

// Simple implementation for path module functionality
export const path = {
  join: (...parts) => parts.join('/').replace(/\/\//g, '/'),
  resolve: (...parts) => parts.join('/').replace(/\/\//g, '/'),
  dirname: (path) => {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  },
};

// Empty implementation for os module
export const os = {
  homedir: () => '/',
  tmpdir: () => '/tmp',
  platform: () => 'browser',
};

// Minimal http implementations
export const http = {
  request: () => {
    throw new Error('http.request is not supported in browser environment');
  },
};

export const https = {
  request: () => {
    throw new Error('https.request is not supported in browser environment');
  },
};

// Export default empty objects
export default {
  fs,
  net,
  tls,
  path,
  os,
  http,
  https,
};
