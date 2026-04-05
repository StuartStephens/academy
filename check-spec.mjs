import { promises as fs } from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'curriculum');
const MIN_PUBLISHED_PUBLIC = 8;

const ALLOWED_STATUS = new Set(['draft', 'published']);
const ALLOWED_VISIBILITY = new Set(['public', 'unlisted']);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    throw new Error('Missing frontmatter block');
  }

  const frontmatterRaw = match[1];
  const lines = frontmatterRaw.split('\n');
  const data = {};
  let currentArrayKey = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const arrayMatch = line.match(/^\s*-\s+(.*)$/);
    if (arrayMatch && currentArrayKey) {
      data[currentArrayKey].push(arrayMatch[1].trim());
      continue;
    }

    currentArrayKey = null;
    const keyValueMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!keyValueMatch) {
      throw new Error(`Invalid frontmatter line: "${line}"`);
    }

    const [, key, valueRaw] = keyValueMatch;
    const value = valueRaw.trim();

    if (value === '') {
      data[key] = [];
      currentArrayKey = key;
      continue;
    }

    data[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return data;
}

function toSlug(filename) {
  return filename.replace(/\.(md|mdx)$/i, '');
}

function isValidDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime());
}

async function run() {
  const errors = [];
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    errors.push('No curriculum markdown files found.');
  }

  const seenSlugs = new Set();
  let publishedPublicCount = 0;

  for (const filename of files) {
    const filePath = path.join(CONTENT_DIR, filename);
    const source = await fs.readFile(filePath, 'utf8');
    const slug = toSlug(filename);

    if (seenSlugs.has(slug)) {
      errors.push(`${filename}: Duplicate slug derived from filename (${slug}).`);
    } else {
      seenSlugs.add(slug);
    }

    let frontmatter;
    try {
      frontmatter = parseFrontmatter(source);
    } catch (error) {
      errors.push(`${filename}: ${error.message}`);
      continue;
    }

    const requiredFields = ['title', 'summary', 'status', 'visibility', 'updatedAt'];
    for (const field of requiredFields) {
      const value = frontmatter[field];
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`${filename}: Missing required frontmatter field "${field}".`);
      }
    }

    if (!ALLOWED_STATUS.has(frontmatter.status)) {
      errors.push(`${filename}: status must be one of draft|published.`);
    }

    if (!ALLOWED_VISIBILITY.has(frontmatter.visibility)) {
      errors.push(`${filename}: visibility must be one of public|unlisted.`);
    }

    if (typeof frontmatter.updatedAt === 'string' && !isValidDate(frontmatter.updatedAt)) {
      errors.push(`${filename}: updatedAt must be a valid date.`);
    }

    if (frontmatter.tags !== undefined) {
      if (!Array.isArray(frontmatter.tags)) {
        errors.push(`${filename}: tags must be an array of strings when present.`);
      } else if (frontmatter.tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
        errors.push(`${filename}: tags must contain non-empty strings only.`);
      }
    }

    const body = source.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
    if (!body) {
      errors.push(`${filename}: Body content is empty.`);
    }

    if (frontmatter.status === 'published' && frontmatter.visibility === 'public') {
      publishedPublicCount += 1;
    }
  }

  if (publishedPublicCount < MIN_PUBLISHED_PUBLIC) {
    errors.push(
      `Expected at least ${MIN_PUBLISHED_PUBLIC} published public entries; found ${publishedPublicCount}.`
    );
  }

  if (errors.length > 0) {
    console.error('Spec check failed:\n');
    for (const issue of errors) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log('Spec check passed.');
  console.log(`- Checked files: ${files.length}`);
  console.log(`- Published public entries: ${publishedPublicCount}`);
}

run().catch((error) => {
  console.error('Spec check crashed:');
  console.error(error);
  process.exit(1);
});
