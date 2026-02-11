import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  banner: ({ format }) => {
    // Only add shebang to cli.js
    return format === 'cjs' ? {} : {};
  },
});
