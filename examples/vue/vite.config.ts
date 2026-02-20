import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Allow <go-snap> custom element (web component from gosnap-widget)
          isCustomElement: (tag) => tag === 'go-snap',
        },
      },
    }),
  ],
})
