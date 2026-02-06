import { defineConfig } from 'tsup'

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
  },
  // NEW: IIFE build for embedding (self-contained)
  {
    entry: { embed: 'src/embed.ts' },
    format: ['iife'],
    globalName: 'ProUIFeedbacks',
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    minify: true,
    treeshake: true,
    // Bundle ALL dependencies for self-contained output
    noExternal: ['react', 'react-dom', 'lucide-react'],
    esbuildOptions(options) {
      options.define = {
        'process.env.NODE_ENV': '"production"',
      }
      // Target modern browsers (ES2020)
      options.target = 'es2020'
    },
  },
])
