// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { cloudinaryImages } from './src/lib/cloudinary-markdown.ts';

export default defineConfig({
  site: 'https://97ohmrobotics.github.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [cloudinaryImages] }),
  },
  i18n: {
    // Англійська з'явиться пізніше: додати 'en' сюди і папки src/content/*/en/.
    locales: ['uk'],
    defaultLocale: 'uk',
    routing: { prefixDefaultLocale: false },
  },
});
