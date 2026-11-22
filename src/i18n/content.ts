import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './ui';

export type WorkEntry = CollectionEntry<'work'>;

/** 'relay' stays 'relay'; 'ar/relay' becomes 'relay', so a translation keeps the same URL. */
export const workSlug = (id: string): string => id.replace(/^[a-z]{2}\//, '');

/** The case studies written in one language, newest first. */
export async function workEntries(lang: Lang): Promise<WorkEntry[]> {
  const entries = await getCollection('work', ({ data }) => data.lang === lang);
  return entries.sort((a, b) => b.data.date.localeCompare(a.data.date));
}
