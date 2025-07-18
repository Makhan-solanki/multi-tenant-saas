import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'react-shell',
      filename: 'remoteEntry.js',
      exposes: {
        './AuthContext': './src/contexts/AuthContext.jsx'
      },
      remotes: {
        supportTickets: 'http://localhost:4174/assets/remoteEntry.js'
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
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  },
  server: {
    port: 4173,
    cors: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
