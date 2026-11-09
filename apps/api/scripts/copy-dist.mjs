/**
 * Copies the compiled NestJS output into the serverless function directory.
 *
 * Vercel ships each function from the directory that contains its entry file,
 * so a `require('../dist/...')` from `api/index.js` points outside the
 * function root and is dropped from the bundle. Keeping a copy at
 * `api/dist/` keeps the runtime require inside the packaged tree, where the
 * dependency tracer can follow it.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const source = resolve(appRoot, 'dist');
const target = resolve(appRoot, 'api', 'dist');

if (!existsSync(source)) {
  console.error('[copy-dist] dist/ is missing - run nest build first');
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

console.log('[copy-dist] copied dist/ into api/dist/ for the serverless bundle');
