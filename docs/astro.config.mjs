// @ts-check
import { defineConfig } from 'astro/config';
// import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  base: '/data-grid-selector',
  site: 'https://metaory.github.io',
  // integrations: [icon()],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@styles': '/src/styles',
        '@layouts': '/src/layouts',
        '@pages': '/src/pages',
        '@root': '../../'
      }
    }
  }
});
