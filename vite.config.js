import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE || 'http://127.0.0.1:8000';
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        // Dev proxy removes CORS headaches when frontend runs on 3000
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      port: 3000,
      host: true
    }
  };
});
