import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    date: z.string(),
    metric: z.string(),
    metricNote: z.string(),
    summary: z.string(),
    order: z.number().default(0)
  })
});

export const collections = { work };