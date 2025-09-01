import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return defineConfig({
    envPrefix: 'REACT_APP_',
    plugins: [react(), tsconfigPaths(), svgr()],
    optimizeDeps: {
      include: ['howler'],
    },
    base: '/services',
    define: {
      'process.env': process.env,
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: parseInt(process.env.REACT_APP_APP_PORT),
      headers: {
        ...(process.env.REACT_APP_CSP && {
          'Content-Security-Policy': process.env.REACT_APP_CSP,
        }),
      },
    },
    build: {
      outDir: './build',
      target: 'es2015',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '~@fontsource': path.resolve(__dirname, 'node_modules/@fontsource'),
        '@': `${path.resolve(__dirname, './src')}`,
      },
    },
  });
};
