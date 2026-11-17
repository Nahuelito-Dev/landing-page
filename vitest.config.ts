/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Con la config de Astro: los tests pueden renderizar componentes .astro (Container API).
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
