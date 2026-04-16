import type { TypedObject } from 'astro-portabletext/types';
import { toPlainText } from 'astro-portabletext/utils';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getSanityClient, isSanityConfigured } from './sanity';
import { headingId } from './slug';

export type CurriculumStatus = 'draft' | 'published';
export type CurriculumVisibility = 'public' | 'unlisted';
export type CurriculumCategory =
  | 'health-biology'
  | 'nature-outdoors'
  | 'mathematics'
  | 'cooking'
  | 'engineering-technology'
  | 'trades-materials-craft'
  | 'history-society-belief'
  | 'strategy-games';

type Heading = {
  depth: number;
  slug: string;
  text: string;
  key?: string;
};

export type Curriculum = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: CurriculumStatus;
  visibility: CurriculumVisibility;
  updatedAt: Date;
  category?: CurriculumCategory;
  homepageOrder?: number;
  tags: string[];
  body: TypedObject[];
  bodyText: string;
  isTopLevel: boolean;
  parentId?: string;
  headings: Heading[];
  readingMinutes: number;
  legacyEntry?: LegacyCurriculum;
};

type SanityReference = {
  _ref?: string;
};

type SanitySlug = {
  current?: string;
};

type SanityCurriculum = {
  _id: string;
  _type: 'curriculum';
  title?: string;
  summary?: string;
  status?: CurriculumStatus;
  visibility?: CurriculumVisibility;
  updatedAt?: string;
  category?: CurriculumCategory;
  homepageOrder?: number;
  tags?: string[];
  slug?: SanitySlug;
  parent?: SanityReference;
  body?: TypedObject[];
};

type LegacyCurriculum = CollectionEntry<'curriculum'>;

const curriculumQuery = `
  *[_type == "curriculum" && defined(slug.current)] {
    _id,
    _type,
    title,
    summary,
    status,
    visibility,
    updatedAt,
    category,
    homepageOrder,
    tags,
    slug,
    parent,
    body
  }
`;

function normalizeSlug(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

function isCategory(value: unknown): value is CurriculumCategory {
  return (
    value === 'health-biology' ||
    value === 'nature-outdoors' ||
    value === 'mathematics' ||
    value === 'cooking' ||
    value === 'engineering-technology' ||
    value === 'trades-materials-craft' ||
    value === 'history-society-belief' ||
    value === 'strategy-games'
  );
}

function isStatus(value: unknown): value is CurriculumStatus {
  return value === 'draft' || value === 'published';
}

function isVisibility(value: unknown): value is CurriculumVisibility {
  return value === 'public' || value === 'unlisted';
}

function extractHeadings(body: TypedObject[]) {
  const headings: Heading[] = [];

  for (const node of body) {
    if (node._type !== 'block') {
      continue;
    }

    const candidate = node as TypedObject & { style?: unknown };
    const style = typeof candidate.style === 'string' ? candidate.style : 'normal';
    const headingMatch = /^h([1-6])$/.exec(style);

    if (!headingMatch) {
      continue;
    }

    const text = toPlainText([node]).trim();
    if (!text) {
      continue;
    }

    headings.push({
      depth: Number(headingMatch[1]),
      slug: headingId(text, node._key),
      text,
      key: node._key,
    });
  }

  return headings;
}

function extractMarkdownHeadings(body: string) {
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();
  const lines = body.split('\n');
  let insideCodeFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('```')) {
      insideCodeFence = !insideCodeFence;
      continue;
    }

    if (insideCodeFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) {
      continue;
    }

    const depth = match[1].length;
    const text = match[2].trim();
    if (!text) {
      continue;
    }

    const baseSlug = headingId(text);
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);

    headings.push({
      depth,
      slug: count === 0 ? baseSlug : `${baseSlug}-${count + 1}`,
      text,
      key: `${baseSlug}-${count + 1}`,
    });
  }

  return headings;
}

function toDateOrNow(value: string | undefined) {
  const date = new Date(value ?? '');
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function toReadingMinutes(plainText: string) {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

function mapCurriculumDocument(doc: SanityCurriculum, pathById: Map<string, string>): Curriculum | null {
  const slug = normalizeSlug(pathById.get(doc._id) ?? '');
  if (!slug) {
    return null;
  }

  const body = Array.isArray(doc.body) ? doc.body : [];
  const bodyText = toPlainText(body);

  return {
    id: doc._id,
    slug,
    title: doc.title?.trim() || 'Untitled',
    summary: doc.summary?.trim() || '',
    status: isStatus(doc.status) ? doc.status : 'draft',
    visibility: isVisibility(doc.visibility) ? doc.visibility : 'public',
    updatedAt: toDateOrNow(doc.updatedAt),
    category: isCategory(doc.category) ? doc.category : undefined,
    homepageOrder:
      typeof doc.homepageOrder === 'number' && Number.isFinite(doc.homepageOrder)
        ? doc.homepageOrder
        : undefined,
    tags: Array.isArray(doc.tags)
      ? doc.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
      : [],
    body,
    bodyText,
    isTopLevel: !slug.includes('/'),
    parentId: doc.parent?._ref,
    headings: extractHeadings(body),
    readingMinutes: toReadingMinutes(bodyText),
    legacyEntry: undefined,
  };
}

function mapLegacyCurriculum(entry: LegacyCurriculum): Curriculum {
  const bodyText = entry.body;

  return {
    id: entry.id,
    slug: normalizeSlug(entry.slug),
    title: entry.data.title,
    summary: entry.data.summary,
    status: entry.data.status,
    visibility: entry.data.visibility,
    updatedAt: entry.data.updatedAt,
    category: entry.data.category,
    homepageOrder: entry.data.homepageOrder,
    tags: entry.data.tags ?? [],
    body: [],
    bodyText,
    isTopLevel: !entry.slug.includes('/'),
    parentId: undefined,
    headings: extractMarkdownHeadings(bodyText),
    readingMinutes: toReadingMinutes(bodyText),
    legacyEntry: entry,
  };
}

function createSlugPathMap(docs: SanityCurriculum[]) {
  const byId = new Map<string, SanityCurriculum>();
  const slugById = new Map<string, string>();

  for (const doc of docs) {
    byId.set(doc._id, doc);
    slugById.set(doc._id, normalizeSlug(doc.slug?.current ?? ''));
  }

  const pathById = new Map<string, string>();

  const resolvePath = (id: string, stack = new Set<string>()): string => {
    if (pathById.has(id)) {
      return pathById.get(id) ?? '';
    }

    const selfSlug = slugById.get(id) ?? '';
    const doc = byId.get(id);
    if (!doc || !selfSlug) {
      pathById.set(id, '');
      return '';
    }

    if (stack.has(id)) {
      pathById.set(id, selfSlug);
      return selfSlug;
    }

    stack.add(id);

    const parentId = doc.parent?._ref;
    let path = selfSlug;

    if (parentId && byId.has(parentId)) {
      const parentPath = resolvePath(parentId, stack);
      path = parentPath ? `${parentPath}/${selfSlug}` : selfSlug;
    }

    stack.delete(id);
    pathById.set(id, path);
    return path;
  };

  for (const doc of docs) {
    resolvePath(doc._id);
  }

  return pathById;
}

async function fetchCurriculumDocuments() {
  if (!isSanityConfigured) {
    return [] as SanityCurriculum[];
  }

  const client = getSanityClient();
  return client.fetch<SanityCurriculum[]>(curriculumQuery);
}

async function fetchLegacyCurriculumDocuments() {
  const entries = await getCollection('curriculum');
  return entries;
}

let curriculumCachePromise: Promise<Curriculum[]> | undefined;

async function loadCurriculumsFresh() {
  if (isSanityConfigured) {
    const docs = await fetchCurriculumDocuments();
    const pathById = createSlugPathMap(docs);

    return docs
      .map((doc) => mapCurriculumDocument(doc, pathById))
      .filter((item): item is Curriculum => Boolean(item))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  const legacyEntries = await fetchLegacyCurriculumDocuments();

  return legacyEntries
    .map(mapLegacyCurriculum)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

async function loadCurriculums() {
  if (!import.meta.env.PROD) {
    return loadCurriculumsFresh();
  }

  if (!curriculumCachePromise) {
    curriculumCachePromise = loadCurriculumsFresh();
  }

  return curriculumCachePromise;
}

export async function getCurriculums() {
  return loadCurriculums();
}

export async function getPublicCurriculums() {
  const curriculums = await getCurriculums();
  return curriculums.filter(
    (item) => item.status === 'published' && item.visibility === 'public' && item.isTopLevel
  );
}

export type HomepageSection = {
  key: CurriculumCategory;
  title: string;
  description: string;
  items: Curriculum[];
};

const homepageSectionMeta: Record<CurriculumCategory, Omit<HomepageSection, 'items' | 'key'>> = {
  'health-biology': {
    title: 'Health & Biology',
    description: 'Body systems, public health, nutrition, care practices, and biological regulation.',
  },
  'nature-outdoors': {
    title: 'Nature & Outdoors',
    description: 'Plants, animals, geography, agriculture, and practical outdoor competence.',
  },
  mathematics: {
    title: 'Mathematics',
    description: 'Number sense, symbolic reasoning, spatial thinking, and advanced quantitative methods.',
  },
  cooking: {
    title: 'Cooking',
    description: 'Ingredient handling, heat control, preparation methods, and practical kitchen technique.',
  },
  'engineering-technology': {
    title: 'Engineering & Technology',
    description: 'Physics, chemistry, software, hardware, energy systems, measurement, and applied technical knowledge.',
  },
  'trades-materials-craft': {
    title: 'Trades, Materials & Craft',
    description: 'Hands-on work, infrastructure, built environments, materials, and making.',
  },
  'history-society-belief': {
    title: 'History, Society & Belief',
    description: 'Historical change, institutions, politics, law, taxation, and religious traditions.',
  },
  'strategy-games': {
    title: 'Strategy & Competition',
    description: 'Structured thinking through strategy, training, and competitive systems.',
  },
};

const homepageSectionOrder: CurriculumCategory[] = [
  'health-biology',
  'nature-outdoors',
  'mathematics',
  'cooking',
  'engineering-technology',
  'trades-materials-craft',
  'history-society-belief',
  'strategy-games',
];

export async function getHomepageSections() {
  const curriculums = await getPublicCurriculums();
  const sections = new Map<CurriculumCategory, Curriculum[]>();

  for (const item of curriculums) {
    if (!item.category) {
      continue;
    }

    const items = sections.get(item.category) ?? [];
    items.push(item);
    sections.set(item.category, items);
  }

  return homepageSectionOrder
    .map((key) => {
      const items = (sections.get(key) ?? []).sort((a, b) => {
        const orderA = a.homepageOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.homepageOrder ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });

      return {
        key,
        ...homepageSectionMeta[key],
        items,
      } satisfies HomepageSection;
    })
    .filter((section) => section.items.length > 0);
}

export async function getCurriculumBySlug(slug: string) {
  const curriculums = await getCurriculums();
  const normalized = normalizeSlug(slug);
  return curriculums.find((item) => item.slug === normalized);
}

export async function getPublishedCurriculumSlugs() {
  const curriculums = await getCurriculums();
  return curriculums
    .filter((item) => item.status === 'published' && item.visibility === 'public')
    .map((item) => item.slug);
}
