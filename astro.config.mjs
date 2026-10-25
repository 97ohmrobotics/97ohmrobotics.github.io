// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://97ohmrobotics.github.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  i18n: {
    // Англійська з'явиться пізніше: додати 'en' сюди і папки src/content/*/en/.
    locales: ['uk'],
    defaultLocale: 'uk',
    routing: { prefixDefaultLocale: false },
  },
});
