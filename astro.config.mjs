// @ts-check
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// Astro does not load .env into this file, so read it the way Vite does.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

const site =
  env.SITE_URL ||
  (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4321');

export default defineConfig({
  site,
  integrations: [
    react(),
    {
      // /roadmap exists only while KOOKEE_ROADMAP is not "false"; a static site has no other way to drop a page.
      name: 'kookee-roadmap',
      hooks: {
        'astro:config:setup': ({ injectRoute }) => {
          if (env.KOOKEE_ROADMAP !== 'false') {
            injectRoute({ pattern: '/roadmap', entrypoint: './src/routes/roadmap.astro' });
          }
        },
      },
    },
    {
      // The status pages exist only while KOOKEE_STATUS is "true". They render in the browser, so a
      // static build never shows an old status, and an incident that starts after it has a page.
      name: 'kookee-status',
      hooks: {
        'astro:config:setup': ({ injectRoute }) => {
          if (env.KOOKEE_STATUS === 'true') {
            injectRoute({ pattern: '/status', entrypoint: './src/routes/status.astro' });
            injectRoute({ pattern: '/status/incident', entrypoint: './src/routes/status-incident.astro' });
          }
        },
      },
    },
  ],
});
