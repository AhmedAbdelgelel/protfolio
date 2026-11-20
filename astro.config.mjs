import { defineConfig } from 'astro/config';

// One static page, built from the résumé at build time.
// "npm run cv" regenerates src/data/cv.json from public/assets/cv/AhmedAbdelgelel.pdf first.
export default defineConfig({
  site: 'https://glgl.me',
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});
