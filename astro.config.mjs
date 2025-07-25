import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// import vercel from '@astrojs/vercel';
import netlify from '@astrojs/netlify';
export default defineConfig({
  integrations: [react(), tailwind(), sitemap()],
  site: 'https://mindmine.netlify.app/',
  // adapter: vercel({ edge: false })  // <-- CRUCIAL
  adapter: netlify(),
  trailingSlash: 'never'
});