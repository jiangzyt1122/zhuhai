import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const baseFromEnv = process.env.VITE_BASE || '/';
const normalizedBase = baseFromEnv.endsWith('/') ? baseFromEnv : `${baseFromEnv}/`;

export default defineConfig(({ mode }) => {
  const isOffline = mode === 'offline';
  return {
    root: 'src',
    base: isOffline ? './' : (mode === 'production' ? normalizedBase : '/'),
    build: {
      outDir: isOffline ? '../offline-dist' : '..',
      emptyOutDir: isOffline ? true : false,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  };
});
