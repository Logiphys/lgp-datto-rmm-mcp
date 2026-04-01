import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

await build({
  entryPoints: [resolve(root, 'apps/mcp-server/src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: resolve(root, 'dist/index.js'),
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    'import.meta.SHEBANG': 'true',
  },
  external: [],
  minify: false,
  sourcemap: false,
  alias: {
    'datto-rmm-api': resolve(root, 'packages/api/src/index.ts'),
  },
  plugins: [{
    name: 'strip-shebang',
    setup(b) {
      b.onLoad({ filter: /index\.ts$/ }, async (args) => {
        const fs = await import('fs');
        let contents = fs.readFileSync(args.path, 'utf8');
        contents = contents.replace(/^#!.*\n/, '');
        return { contents, loader: 'ts' };
      });
    },
  }],
});

console.log('Bundle created: dist/index.js');