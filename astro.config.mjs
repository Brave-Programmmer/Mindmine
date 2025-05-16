// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  site: 'https://livre.com',
  output: 'server',
  server: {
    port: 3000,
    host: true
  }
});
