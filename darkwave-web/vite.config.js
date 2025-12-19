import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'],
      exclude: ['process'],
      globals: {
        Buffer: true,
        global: true,
        process: false,
      },
      protocolImports: true,
    }),
  ],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        telegram: resolve(__dirname, 'telegram.html'),
        strikeagent: resolve(__dirname, 'strikeagent.html'),
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  resolve: {
    alias: {
      '@assets': '/attached_assets',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
