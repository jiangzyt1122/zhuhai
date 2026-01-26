import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'zhuhai';

export default defineConfig(({ mode }) => {
  return {
    root: 'src',
    base: mode === 'production' ? `/${repoName}/` : '/',
    build: {
      outDir: '..',
      emptyOutDir: false,
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
