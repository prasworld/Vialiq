#!/usr/bin/env node
/**
 * Cross-platform cleanup for Vitest residual artifacts.
 * Works on Windows, macOS, and Linux.
 */
const fs = require('fs');
const path = require('path');

const removedPaths = [];

/**
 * Recursively remove a directory or file
 */
function removeRecursive(p) {
  try {
    const stat = fs.lstatSync(p);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(p);
      for (const file of files) {
        removeRecursive(path.join(p, file));
      }
      fs.rmdirSync(p);
    } else {
      fs.unlinkSync(p);
    }
    removedPaths.push(p);
    console.log(`removed: ${p}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`error removing ${p}:`, err.message);
    }
  }
}

/**
 * Walk directory tree, skipping node_modules
 */
function walkDir(dir, callback) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules') {
        continue; // Skip node_modules subtrees
      }
      const fullPath = path.join(dir, entry.name);
      callback(fullPath, entry);
      if (entry.isDirectory()) {
        walkDir(fullPath, callback);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`error reading ${dir}:`, err.message);
    }
  }
}

// 1. Remove top-level paths
const topLevelPaths = ['.vitest', 'node_modules/.vitest'];
for (const p of topLevelPaths) {
  if (fs.existsSync(p)) {
    removeRecursive(p);
  }
}

// 2. Remove nested .vitest directories (excluding all node_modules subtrees)
walkDir('.', (fullPath, entry) => {
  if (entry.isDirectory() && entry.name === '.vitest') {
    removeRecursive(fullPath);
  }
});

// 3. Remove Vitest timestamp marker files (excluding all node_modules subtrees)
walkDir('.', (fullPath, entry) => {
  if (
    entry.isFile() &&
    /^vitest\.config\..+\.timestamp-.+$/.test(entry.name)
  ) {
    removeRecursive(fullPath);
  }
});

console.log('vitest cleanup complete');
