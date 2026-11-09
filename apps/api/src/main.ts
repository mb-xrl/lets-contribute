// Vercel's Node.js preset looks for an entrypoint that imports nestjs before it
// will accept the project, so this import is intentional even though the
// serverless entry (`api/index.js`) does the real work on the platform.
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { bootstrapExpress } from './bootstrap';
import { config, demoAuthEnabled, githubConfigured, usingPostgres } from './config';

/** Local development entry point: boots NestJS and listens on the port. */
async function main() {
  const { express } = await bootstrapExpress();

  express.listen(config.port, '0.0.0.0', () => {
    Logger.log(
      [
        `API listening on http://localhost:${config.port}/api`,
        `store: ${usingPostgres ? 'neon postgres' : 'in-memory (set DATABASE_URL for Neon)'}`,
        `github oauth: ${githubConfigured ? 'configured' : 'not configured'}`,
        `demo sign-in: ${demoAuthEnabled ? 'enabled' : 'disabled'}`,
        `web origin: ${config.webOrigin}`,
      ].join('\n  '),
      'Bootstrap',
    );
  });
}

main().catch((error) => {
  Logger.error(error, 'Bootstrap');
  process.exit(1);
});
