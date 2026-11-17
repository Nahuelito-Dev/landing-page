// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { URL_SITIO } from './src/config/sitio.ts';

// https://astro.build/config
export default defineConfig({
  site: URL_SITIO,
  integrations: [react(), sitemap({ filter: (pagina) => !pagina.includes('/gracias') && !pagina.includes('/pedido-no-enviado') })],
  // Geist se descarga al compilar y se sirve desde el mismo sitio, con métricas de respaldo
  // para que el cambio de fuente no mueva el texto.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: [500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
