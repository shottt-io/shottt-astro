// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

const isVercel = !!process.env.VERCEL;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isVercel
    ? vercel({
        isr: {
          bypassToken: process.env.VERCEL_BYPASS_TOKEN || 'local-fallback-bypass-token',
          exclude: [
            /^\/api\/.+/,
            /^\/admin\/.+/,
          ]
        }
      })
    : node({
        mode: 'standalone'
      }),
  security: {
    checkOrigin: false,
  }
});

