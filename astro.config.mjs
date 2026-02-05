import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// import vercel from '@astrojs/vercel';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 45000,
      serialize: (item) => {
        if (item.url.includes('/admin')) {
          return undefined;
        }
        return item;
      },
    }),
  ],
  site: 'https://mindmine.netlify.app/',
  // adapter: vercel({ edge: false })  // <-- CRUCIAL
  adapter: netlify({
    edgeMiddleware: true,
    imageCaching: true,
  }),
  trailingSlash: 'never',
  
  // Performance optimizations
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  
  // Vite optimizations
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
    },
    ssr: {
      external: ['class-variance-authority'],
    },
  },
});