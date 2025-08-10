import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  server: {
    port: 5003, // So that the Local Server can run backend and frontend on the same port
    strictPort: true,
  },

  plugins: [
    vue(
      { template: { transformAssetUrls } }
    ),
    quasar({
      autoImportComponentCase: 'pascal'
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
