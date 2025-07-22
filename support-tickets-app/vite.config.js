import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'
const isDocker = process.env.DOCKER === 'true';
export default defineConfig({
  base: '/', 
  plugins: [
    react(),
    federation({
      name: 'supportTickets',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx'
      },
      remotes: {
        'react-shell': isDocker
    ? 'http://react-shell:4173/assets/remoteEntry.js'
    : 'http://localhost:4173/assets/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
        axios: { singleton: true }
      }
    })
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: false,
    minify: false,
    rollupOptions: {
      external: ['react-shell/AuthContext'], 
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  },
  server: {
    port: 4174,
    cors: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: ['react-shell'] // ✅ Required to treat it as remote!
  }
})
