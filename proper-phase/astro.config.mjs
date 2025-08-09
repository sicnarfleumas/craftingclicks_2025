// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@case-studies': fileURLToPath(new URL('./src/assets/case-studies', import.meta.url)),
      }
    },
    ssr: {
      noExternal: ["swiper"]
    }
  }
});