import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    /** 'en' by default; translations live under work/<lang>/<slug>.md. */
    lang: z.enum(['en', 'ar']).default('en'),
    title: z.string(),
    year: z.number(),
    date: z.string(),
    lead: z.string(),
    metric: z.string(),
    metricNote: z.string(),
    summary: z.string(),
    order: z.number().default(0)
  })
});

export const collections = { work };
