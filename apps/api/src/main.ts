import { Logger } from '@nestjs/common';
import { bootstrapExpress } from './bootstrap';
import { config, demoAuthEnabled, githubConfigured, usingPostgres } from './config';

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
