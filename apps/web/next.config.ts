import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { NextConfig } from 'next';

/**
 * The monorepo keeps a single .env at the root so one file configures both the
 * NestJS API and this app. Vercel project settings always win.
 */
function loadRootEnv() {
  const candidates = [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')];
  for (const file of new Set(candidates)) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

loadRootEnv();

const apiOrigin = (process.env.API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@lets-contribute/shared'],
  // The browser only ever talks to this app's own origin: /api/* is proxied to
  // the NestJS service server-side, which keeps session cookies first-party.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
  allowedDevOrigins: ['*.e2b.app', 'localhost:3000', '127.0.0.1:3000'],
};

export default nextConfig;
