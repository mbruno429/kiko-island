import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The page shell and code live in src/. The build is one self-contained index.html that
// works offline, from file://, and inside an Android WebView.
export default defineConfig({
  root: 'src',
  base: './',
  plugins: [viteSingleFile()],
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2019', assetsInlineLimit: 100_000_000 },
});
