import { getCollection } from 'astro:content';

export type CurriculumStatus = 'draft' | 'published';
export type CurriculumVisibility = 'public' | 'unlisted';

export type Curriculum = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: CurriculumStatus;
  visibility: CurriculumVisibility;
  updatedAt: Date;
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
      tags: entry.data.tags ?? [],
      body: entry.body,
    }))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getPublicCurriculums() {
  const curriculums = await getCurriculums();
  return curriculums.filter((item) => item.status === 'published' && item.visibility === 'public');
}

export async function getCurriculumBySlug(slug: string) {
  const curriculums = await getCurriculums();
  const normalized = normalizeSlug(slug);
  return curriculums.find((item) => item.slug === normalized);
}
