import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('gsap') || id.includes('lenis') || id.includes('nprogress')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        },
      },
    },
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://178.128.198.121/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          origin: 'https://178.128.198.121',
          referer: 'https://178.128.198.121/'
        }
      }
    },
    headers: {
    'Content-Security-Policy': `
      default-src 'self';
      connect-src 'self' https://178.128.198.121 ws: wss:;
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      worker-src 'self' blob:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https:;
      font-src 'self' data: https://fonts.gstatic.com;
      frame-src 'self' https://www.google.com https://maps.google.com;
    `.replace(/\n/g, ''),

    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
}
})
