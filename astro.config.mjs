// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import unoCSS from '@unocss/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), unoCSS()],
});
