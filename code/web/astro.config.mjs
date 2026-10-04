// @ts-check

import { fileURLToPath } from 'node:url';
import { cacheCloudflare } from '@astrojs/cloudflare/cache';
import { defineDocumentConfig } from '@quiescent/server/documents';
import configuration from './quiescent.config.json' with { type: 'json' };
defineDocumentConfig(configuration);
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: 'https://ncrmro.com',
	output: 'server',
	session: false,
	cache: { provider: cacheCloudflare() },
	image: { endpoint: { route: '/_image', entrypoint: './src/writing/image-endpoint.ts' }, service: { entrypoint: '@astrojs/cloudflare/image-service-workerd' } },
	redirects: {
		'/posts/the-bottom-turtle-is-a-yubikey/':
			'/posts/bootstrapping-nixos-secrets-before-first-boot/',
		'/posts/sops-secrets-with-a-yubikey/':
			'/posts/bootstrapping-nixos-secrets-before-first-boot/',
	},

	// Bind every interface, not just loopback — the dev server is reached from
	// other machines by hostname (ncrmro-workstation, ncrmro-laptop-14), and a
	// 127.0.0.1 binding refuses those connections before allowedHosts is ever
	// consulted.
	server: {
		host: '0.0.0.0',
	},

	vite: {
		plugins: [tailwindcss()],
		resolve: { alias: { 'quiescent:runtime': fileURLToPath(new URL('./src/runtime/cloudflare.ts', import.meta.url)) } },
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

	adapter: cloudflare({ imageService: 'custom' }),
});
