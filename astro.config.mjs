// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercelAdapter from '@astrojs/vercel';
// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), tailwind()],
  site: 'https://scriptora-rho.vercel.app/',

  server: {
    port: 3000,
    host: true
  },
  adapter: vercelAdapter(),
});