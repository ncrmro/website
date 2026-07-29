import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts live at the repository root in docs/posts/, not under the Astro app —
// they are the render target of the notes vault's publications/ directories
// (see publications/sync-posts.sh there), and the site is one consumer of them.
const blog = defineCollection({
	loader: glob({ base: '../../docs/posts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string().default(''),
		publish_date: z.coerce.date().optional(),
		published: z.boolean().default(false),
		// Set by the vault sync for pieces pushed ahead of publication; a
		// draft is never publicly listed even if published is flipped.
		draft: z.boolean().default(false),
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
