import { defineConfig } from 'tsup'
import pkg from './package.json'

const PKG_VERSION = JSON.stringify(pkg.version)

export default defineConfig([
  // Existing ESM/CJS build for React apps
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    external: ['react', 'react-dom', 'lucide-react'],
    treeshake: true,
    define: {
      __PKG_VERSION__: PKG_VERSION,
    },
  },
  // NEW: IIFE build for embedding (self-contained)
  {
    entry: { embed: 'src/embed.ts' },
    format: ['iife'],
    globalName: 'GoSnap',
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    minify: true,
    treeshake: true,
    // Bundle ALL dependencies for self-contained output
    noExternal: ['react', 'react-dom', 'lucide-react'],
    esbuildOptions(options) {
      options.define = {
        ...options.define,
        'process.env.NODE_ENV': '"production"',
        __PKG_VERSION__: PKG_VERSION,
      }
      // Target modern browsers (ES2020)
      options.target = 'es2020'
    },
  },
  // CLI build for Vibe Kanban sync server (Node.js)
  {
    entry: { cli: 'src/cli/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    target: 'node18',
    splitting: false,
    sourcemap: false,
    minify: false,
    treeshake: true,
    external: ['node:http', 'node:child_process', '@modelcontextprotocol/sdk'],
    banner: {
      js: '#!/usr/bin/env node',
    },
    define: {
      __PKG_VERSION__: PKG_VERSION,
    },
  },
])
