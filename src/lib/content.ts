import { getCollection } from 'astro:content';

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
  body: string;
};

function normalizeSlug(slug: string) {
  return slug.replace(/^\/+|\/+$/g, '');
}

export async function getCurriculums() {
  const entries = await getCollection('curriculum');

  return entries
    .map((entry) => ({
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
      body: entry.body,
    }))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getPublicCurriculums() {
  const curriculums = await getCurriculums();
  return curriculums.filter(
    (item) => item.status === 'published' && item.visibility === 'public' && !item.slug.includes('/')
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
