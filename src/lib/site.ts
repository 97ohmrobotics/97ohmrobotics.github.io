import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  name: '97 Ohm Robotics',
  nameUk: 'Робототехнічна команда «97 Ом»',
  org: 'Ліцей №97 · Дніпро',
  github: 'https://github.com/97ohmrobotics',
  repo: 'https://github.com/97ohmrobotics/97ohmrobotics.github.io',
};

export const NAV = [
  { href: '/', code: 'J1', label: 'Головна' },
  { href: '/projects/', code: 'J2', label: 'Роботи й проєкти' },
  { href: '/journal/', code: 'J3', label: 'Журнал' },
  { href: '/team/', code: 'J4', label: 'Команда' },
  { href: '/join/', code: 'J5', label: 'Приєднатися', cta: true },
] as const;

export const STATUS = {
  'in-progress': 'В роботі',
  done: 'Завершено',
  idea: 'Ідея',
  retired: 'В архіві',
} as const;

export const POST_TYPE = {
  competition: 'Змагання',
  devlog: 'Розробка',
  news: 'Новини',
} as const;

export const ROLE_GROUP = {
  механіка: 'me',
  електроніка: 'el',
  програмування: 'sw',
  капітан: 'cap',
  наставник: 'mentor',
} as const;

// Чернетки (draft: true) видно лише під час `npm run dev`.
const visible = <T extends { data: { draft: boolean } }>(e: T) =>
  import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === '1' || !e.data.draft;

export async function getProjects() {
  const all = (await getCollection('projects', ({ id }) => !id.includes('/'))).filter(visible);
  const order = { 'in-progress': 0, idea: 1, done: 2, retired: 3 } as const;
  return all.sort(
    (a, b) =>
      order[a.data.status] - order[b.data.status] ||
      (b.data.started?.valueOf() ?? 0) - (a.data.started?.valueOf() ?? 0),
  );
}

export async function getPosts() {
  const all = (await getCollection('journal', ({ id }) => !id.includes('/'))).filter(visible);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getMembers() {
  return (await getCollection('members', ({ id }) => !id.includes('/'))).filter(visible);
}

/** Анонс змагання: допис type: competition з датою в майбутньому і без результату. */
export function isUpcoming(post: CollectionEntry<'journal'>, now = new Date()) {
  return post.data.type === 'competition' && !post.data.result && post.data.date >= startOfDay(now);
}

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** 2026-10-24 */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
/** 2026-10 */
export const isoMonth = (d: Date) => d.toISOString().slice(0, 7);

export function projectSpan(p: CollectionEntry<'projects'>) {
  const { started, finished } = p.data;
  if (!started) return '—';
  return `${isoMonth(started)} → ${finished ? isoMonth(finished) : '…'}`;
}

/** Номер проєкту P-01, P-02… за датою початку (найстаріший — P-01). */
export async function projectCodes() {
  const list = (await getProjects()).slice().sort(
    (a, b) => (a.data.started?.valueOf() ?? Infinity) - (b.data.started?.valueOf() ?? Infinity) || a.id.localeCompare(b.id),
  );
  return new Map(list.map((p, i) => [p.id, `P-${String(i + 1).padStart(2, '0')}`]));
}

export function initials(name: string) {
  return name
    .replace(/\./g, '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = ['v', 'y', 'w', 'l'] as const;
/** Колір аватара залежить лише від id учасника, тож він однаковий на всіх сторінках. */
export function avatarColor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function hardwareSummary(p: CollectionEntry<'projects'>) {
  const h = p.data.hardware;
  return [h.controller, ...h.sensors.slice(0, 1), ...h.actuators.slice(-1)].filter(Boolean).join(' · ');
}

/** Перший абзац Markdown без розмітки — для карток і списків. */
export function excerpt(body = '', max = 220) {
  const para =
    body
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .find((b) => b && !/^(#|!\[|<|```|\||[-*] |\d+\. )/.test(b)) ?? '';
  const text = para
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}

export const summaryOf = (p: CollectionEntry<'projects'>) => p.data.summary ?? excerpt(p.body);
