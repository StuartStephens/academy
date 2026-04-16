export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function headingId(text: string, key?: string) {
  const base = slugifyHeading(text) || 'section';

  if (!key) {
    return base;
  }

  const suffix = key.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return suffix ? `${base}-${suffix}` : base;
}
