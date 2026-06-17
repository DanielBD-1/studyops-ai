import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

/**
 * @type {import('node:module').LoadHook}
 */
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    };
  }

  if (url.endsWith('.jsx')) {
    const filePath = fileURLToPath(url);
    const source = readFileSync(filePath, 'utf8');
    const { code } = transformSync(source, {
      loader: 'jsx',
      format: 'esm',
      target: 'esnext',
      jsx: 'automatic',
    });

    return {
      format: 'module',
      shortCircuit: true,
      source: code,
    };
  }

  return nextLoad(url, context);
}
