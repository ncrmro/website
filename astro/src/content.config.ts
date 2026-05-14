import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string().default(''),
		publish_date: z.coerce.date().optional(),
		published: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		places: z.array(z.string()).optional(),
		heroImage: z.string().optional(),
	}),
});

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

export const collections = { blog, jobs };
