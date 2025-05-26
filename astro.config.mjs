import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [react(), tailwind()],
  site: 'https://scriptora-rho.vercel.app/',
  adapter: vercel({ edge: false })  // <-- CRUCIAL
});
