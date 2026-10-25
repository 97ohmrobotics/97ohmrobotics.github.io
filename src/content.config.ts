import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Файли лежать у src/content/<колекція>/<мова>/<назва>.md.
// id запису — назва файлу без мови: «uk/olena-k.md» → «olena-k».
// Коли з'явиться англійська, id для неї буде «en/olena-k».
const DEFAULT_LOCALE = 'uk';

function fromFolder(collection: string) {
  return glob({
    pattern: '*/*.md',
    base: `./src/content/${collection}`,
    generateId: ({ entry }) => {
      const [lang, file] = entry.split('/');
      const slug = file.replace(/\.md$/, '');
      return lang === DEFAULT_LOCALE ? slug : `${lang}/${slug}`;
    },
  });
}

// Порожнє поле у frontmatter (`finished:`) приходить як null — вважаємо його відсутнім.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === null || v === '' ? undefined : v), schema.optional());

const mediaPath = z
  .string()
  .regex(/^\/media\/.+\.(jpe?g|png|webp|avif|svg)$/i, 'Шлях має починатися з /media/ і закінчуватися на .jpg, .png, .webp, .avif або .svg');

const projects = defineCollection({
  loader: fromFolder('projects'),
  schema: z
    .object({
      title: z.string().min(3),
      // Короткий опис для картки. Якщо порожньо, береться перший абзац тексту.
      summary: optional(z.string().max(200, 'Короткий опис — до 200 символів')),
      status: z.enum(['idea', 'in-progress', 'done', 'retired']),
      started: optional(z.coerce.date()),
      finished: optional(z.coerce.date()),
      cover: optional(mediaPath),
      cover_alt: optional(z.string()),
      team: z.array(reference('members')).default([]),
      hardware: z
        .object({
          controller: optional(z.string()),
          sensors: z.array(z.string()).default([]),
          actuators: z.array(z.string()).default([]),
          power: optional(z.string()),
        })
        .default({ sensors: [], actuators: [] }),
      code: optional(z.url()),
      video: optional(z.url()),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
    .refine((p) => !p.cover || p.cover_alt, {
      message: 'Якщо є cover, заповни cover_alt: опиши, що на фото',
      path: ['cover_alt'],
    })
    .refine((p) => p.status !== 'done' || p.finished, {
      message: 'Для завершеного проєкту вкажи дату finished',
      path: ['finished'],
    }),
});

const journal = defineCollection({
  loader: fromFolder('journal'),
  schema: z
    .object({
      title: z.string().min(3),
      date: z.coerce.date(),
      type: z.enum(['competition', 'devlog', 'news']),
      project: optional(reference('projects')),
      result: optional(z.string()),
      cover: optional(mediaPath),
      cover_alt: optional(z.string()),
      authors: z.array(reference('members')).default([]),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
    .refine((p) => !p.cover || p.cover_alt, {
      message: 'Якщо є cover, заповни cover_alt: опиши, що на фото',
      path: ['cover_alt'],
    })
    .refine((p) => !p.result || p.type === 'competition', {
      message: 'Поле result — тільки для type: competition',
      path: ['result'],
    }),
});

const members = defineCollection({
  loader: fromFolder('members'),
  schema: z.object({
    // Ім'я + перша літера прізвища, наприклад «Олена К.»
    name: z
      .string()
      .regex(/^\S+( \S\.)?$/u, 'Тільки ім’я і перша літера прізвища з крапкою, наприклад «Олена К.»'),
    role: z.enum(['механіка', 'електроніка', 'програмування', 'капітан', 'наставник']),
    grade: optional(z.number().int().min(1).max(12)),
    joined: z.number().int().min(2020),
    // Портрет — тільки після письмової згоди батьків. Поки порожньо → ініціали.
    avatar: optional(mediaPath),
    active: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: fromFolder('pages'),
  schema: z.object({
    title: z.string(),
    description: optional(z.string()),
    hero: optional(mediaPath),
    hero_alt: optional(z.string()),
    schedule: optional(z.string()),
    place: optional(z.string()),
    telegram: optional(z.url()),
    email: optional(z.email()),
    address: optional(z.string()),
  }),
});

export const collections = { projects, journal, members, pages };
