// Фото з людьми зберігаються не в репозиторії, а в Cloudinary наставника:
// звідти їх можна видалити назавжди, а з історії git — ні.
// Тут лише ім'я хмари (cloud name), не ключ API. Воно й так видно в кожному посиланні.
export const CLOUDINARY_CLOUD = 'lyceum97media';

const UPLOAD = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/`;

// Посилання, яке дає кнопка Copy URL у Cloudinary:
// https://res.cloudinary.com/<cloud>/image/upload/v1729871234/journal/robotour/field.jpg
// Посилання з уже вписаними перетвореннями (w_800,c_fill/…) не приймаємо: перетворення ставить сайт.
const CLOUDINARY_URL = new RegExp(
  `^${UPLOAD.replace(/[.]/g, '\\.')}((?:v\\d+/)?[^?#,]+\\.(?:jpe?g|png|webp|avif|heic))$`,
  'i',
);

export const isCloudinary = (src: string) => CLOUDINARY_URL.test(src);

const WIDTHS = [480, 800, 1200, 1600, 2000];

/**
 * URL потрібної ширини. f_auto віддає WebP/AVIF, q_auto підбирає якість,
 * а будь-яке перетворення в Cloudinary стирає EXIF, зокрема GPS.
 */
export function cloudinaryUrl(src: string, width: number, format = 'auto') {
  const m = src.match(CLOUDINARY_URL);
  if (!m) return src;
  return `${UPLOAD}f_${format},q_auto,c_limit,w_${width}/${m[1]}`;
}

/** Атрибути для <img>: для Cloudinary — srcset із кількома розмірами, для решти — як є. */
export function imgAttrs(src: string, sizes = '100vw') {
  if (!isCloudinary(src)) return { src };
  return {
    src: cloudinaryUrl(src, 1200),
    srcset: WIDTHS.map((w) => `${cloudinaryUrl(src, w)} ${w}w`).join(', '),
    sizes,
  };
}

/** Для og:image соцмережам потрібен звичайний JPEG. */
export const ogImageUrl = (src: string) => (isCloudinary(src) ? cloudinaryUrl(src, 1200, 'jpg') : src);
