/**
 * Prepares the serverless function directory for Vercel.
 *
 * Vercel packages a function from the directory that contains its entry file,
 * so anything the runtime `require`s has to live inside `api/`:
 *
 *  - `dist/`   the compiled NestJS output
 *  - `node_modules/@lets-contribute/shared` the compiled workspace package,
 *    placed next to the function so Node resolves it from inside the bundle
 *    instead of the repo-root workspace symlink.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const repoRoot = resolve(appRoot, '..', '..');

const copies = [
  { from: resolve(appRoot, 'dist'), to: resolve(appRoot, 'api', 'dist'), label: 'dist/' },
  {
    from: resolve(repoRoot, 'packages', 'shared', 'dist'),
    to: resolve(appRoot, 'api', 'node_modules', '@lets-contribute', 'shared', 'dist'),
    label: 'packages/shared/dist/',
  },
];

for (const { from, to, label } of copies) {
  if (!existsSync(from)) {
    console.error(`[copy-dist] missing ${label} - build it first`);
    process.exit(1);
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

// The shared package needs its manifest next to dist/ for Node resolution.
const sharedManifest = resolve(appRoot, 'api', 'node_modules', '@lets-contribute', 'shared', 'package.json');
cpSync(resolve(repoRoot, 'packages', 'shared', 'package.json'), sharedManifest);

console.log('[copy-dist] serverless function directory is ready');
