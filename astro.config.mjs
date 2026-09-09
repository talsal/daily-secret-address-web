// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://talsal.github.io',
	base: '/daily-secret-address-web',
	trailingSlash: 'never',
	integrations: [sitemap()],
});
