// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: 'https://ncrmro.com',
	// Drafts live under /drafts/* behind auth; keep them out of the public sitemap.
	integrations: [react(), mdx(), sitemap({ filter: (page) => !page.includes('/drafts/') })],

	vite: {
		plugins: [tailwindcss()],
		// Dev server is reached over the tailnet / LAN by machine
		// hostname (e.g. ncrmro-laptop-14); allow any Host header.
		server: {
			allowedHosts: true,
		},
	},

	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],

	adapter: cloudflare(),
});
