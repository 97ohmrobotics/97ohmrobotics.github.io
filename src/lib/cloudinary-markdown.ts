import type { HastPluginDefinition } from 'satteri';
import { imgAttrs } from './image';

/** Фото з Cloudinary всередині тексту (![опис](https://res.cloudinary.com/…)) теж отримують srcset і стиснення. */
export const cloudinaryImages: HastPluginDefinition = {
  name: 'cloudinary-images',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      const src = node.properties.src;
      if (typeof src !== 'string') return;
      for (const [key, value] of Object.entries(imgAttrs(src, '(min-width: 800px) 800px, 100vw'))) {
        ctx.setProperty(node, key, value);
      }
      ctx.setProperty(node, 'loading', 'lazy');
      ctx.setProperty(node, 'decoding', 'async');
    },
  },
};
