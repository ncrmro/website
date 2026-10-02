import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const jobs = defineCollection({
	loader: glob({ base: './src/content/jobs', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		url: z.string().url().optional(),
		favicon: z.string().optional(),
		role: z.string(),
		type: z.string().optional(),
		start: z.string(),
		end: z.string().optional(),
		tech: z.string().optional(),
	}),
});

export const collections = { jobs };
