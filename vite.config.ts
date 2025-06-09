import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    server: {
      host: true,
      strictPort: true,
      open: true,
      proxy: {
        // handle fallback for SPA
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5250',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      },
      fs: {
        // Allow serving files from one level up from the package root
        allow: ['..']
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react', 'react-hot-toast'],
          },
        },
      },
    },
    
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-hot-toast',
        '@tanstack/react-table',
      ],
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },

    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  };
});
