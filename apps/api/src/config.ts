import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Minimal .env loader (no dependency). Reads the monorepo root .env and a
 * local apps/api/.env if present. Existing process.env values always win, so
 * Vercel project settings take precedence on deploy.
 */
function loadEnvFiles() {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(__dirname, '../../.env'),
    resolve(__dirname, '../../../.env'),
  ];

  for (const file of new Set(candidates)) {
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
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

loadEnvFiles();

const env = (key: string, fallback = '') => (process.env[key] ?? fallback).trim();

const webOrigin = env('WEB_ORIGIN', 'http://localhost:3000').replace(/\/$/, '');
const apiUrl = env('API_URL', 'http://127.0.0.1:3001').replace(/\/$/, '');

export const config = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(env('PORT', '3001')),
  webOrigin,
  apiUrl,
  databaseUrl: env('DATABASE_URL'),
  sessionSecret: env('SESSION_SECRET', 'lets-contribute-dev-secret-change-me'),
  sessionCookie: 'lc_session',
  sessionTtlSeconds: 60 * 60 * 24 * 30,
  github: {
    clientId: env('GITHUB_CLIENT_ID'),
    clientSecret: env('GITHUB_CLIENT_SECRET'),
    token: env('GITHUB_TOKEN'),
    // Where GitHub sends the browser back. Must be reachable by the browser,
    // so it points at the web app which proxies /api to this service.
    callbackUrl:
      env('GITHUB_CALLBACK_URL') ||
      `${webOrigin}/api/auth/github/callback`,
  },
  demoAuth: env('DEMO_AUTH', 'auto'),
};

config.isProduction = process.env.NODE_ENV === 'production';

export const githubConfigured = Boolean(config.github.clientId && config.github.clientSecret);

/** Demo sign-in is available whenever real GitHub OAuth is not configured. */
export const demoAuthEnabled =
  config.demoAuth === 'on' ? true : config.demoAuth === 'off' ? false : !githubConfigured;

export const usingPostgres = Boolean(config.databaseUrl);
