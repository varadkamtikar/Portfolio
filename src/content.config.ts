import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/projects' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    featured: z.boolean(),
    roleRank: z.object({ ds: z.number(), da: z.number() }),
    stack: z.array(z.string()),
    repo: z.string().url(),
    live: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
});

export const collections = { projects };
