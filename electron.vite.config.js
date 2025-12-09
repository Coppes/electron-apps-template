import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  main: {
    // Configuração para o processo principal (main)
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main.js')
        }
      }
    }
  },
  preload: {
    // Configuração para o script preload
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload.js')
        },
        output: {
          format: 'cjs'
        }
      }
    }
  },
  renderer: {
    // Configuração para o processo renderer (React)
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer')
      }
    },
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ['jsx']
          }
        }
      })
    ],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx'
        }
      }
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer]
      }
    }
  }
});
