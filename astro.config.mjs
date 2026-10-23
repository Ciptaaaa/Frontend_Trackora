// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Halaman privat, jangan masuk sitemap.
const PRIVATE_ROUTES = ['/login', '/register', '/boards'];

export default defineConfig({
  site: 'https://www.trackora.web.id',

  devToolbar: { enabled: false },

  integrations: [
    react(),
    sitemap({
      // Sitemap ikut menuliskan hreflang id / en / zh-CN.
      i18n: {
        defaultLocale: 'id',
        locales: { id: 'id', en: 'en', zh: 'zh-CN' },
      },
      // Filter menerima URL lengkap, jadi cocokkan pathname-nya.
      filter: (page) => {
        const { pathname } = new URL(page);
        return !PRIVATE_ROUTES.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        );
      },
    }),
  ],

  vite: { plugins: [tailwindcss()] },

  // `server.proxy` hanya berlaku di dev server lokal, bukan di production.
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3030', changeOrigin: true },
      '/v1': { target: 'http://localhost:3030', changeOrigin: true },
    },
  },
});
