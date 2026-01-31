import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(async ({ command }) => {
  let plugins = [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ]

  if (command === 'build') {
     // Workaround for Deno: @netlify/serverless-functions-api tries to polyfill window.caches
     // which is read-only in Deno, causing a crash.
     try {
       // @ts-ignore
       if (typeof window !== 'undefined' && window.caches) {
          // @ts-ignore
          delete window.caches
       }
     } catch (e) {
       console.warn('Failed to patch window.caches for Netlify build:', e)
     }

     const { default: netlify } = await import('@netlify/vite-plugin-tanstack-start')
     plugins.push(netlify())
  }

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins,
  }
})

export default config
