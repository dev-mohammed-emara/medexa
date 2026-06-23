// Force vite restart cache invalidation
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (e.g. development, production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Resolve target API URL for the local dev server proxy.
  // Note: Vite proxy settings are ONLY active during local development (npm run dev).
  // Built production assets served by netlify, vercel, nginx, etc. do NOT run a Vite dev proxy.
  // Production builds direct traffic either through platform-specific rewrites or directly to the target URL.
  const proxyTarget = env.VITE_API_URL && env.VITE_API_URL.startsWith('http')
    ? env.VITE_API_URL
    : 'https://178.128.198.121/api/v1';

  let cspConnectTarget = '';
  try {
    if (proxyTarget.startsWith('http')) {
      const parsed = new URL(proxyTarget);
      cspConnectTarget = `${parsed.protocol}//${parsed.host}`;
    }
  } catch (_e) {
    // Fallback if parsing failed
  }

  const originHeader = proxyTarget.startsWith('http') ? new URL(proxyTarget).origin : '';

  return {
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
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: originHeader ? {
            origin: originHeader,
            referer: originHeader + '/'
          } : undefined
        }
      },
      headers: {
        'Content-Security-Policy': `
          default-src 'self';
          connect-src 'self' ${cspConnectTarget} ws: wss:;
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
  };
})

