import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth/auth.controller';
import { SessionGuard } from './auth/guards';
import { SessionService } from './auth/session.service';
import { config, usingPostgres } from './config';
import { MemoryStore } from './db/memory.store';
import { PgStore } from './db/pg.store';
import { STORE, type Store } from './domain/store';
import { GitHubService } from './github/github.service';
import { HealthController } from './health.controller';
import { MetaController } from './meta/meta.controller';
import { CommentsController, PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { ProjectsController, ProjectsService } from './projects/projects.controller';
import { UsersController } from './users/users.controller';

@Module({
  controllers: [
    HealthController,
    AuthController,
    PostsController,
    CommentsController,
    ProjectsController,
    UsersController,
    MetaController,
  ],
  providers: [
    SessionService,
    GitHubService,
    PostsService,
    ProjectsService,
    {
      // Neon when DATABASE_URL is present, in-memory otherwise (dev/preview).
      // migrate() is idempotent, so a fresh Neon database bootstraps itself on
      // the first cold start instead of needing a manual SQL step.
      provide: STORE,
      useFactory: async (): Promise<Store> => {
        const logger = new Logger('Store');
        const store: Store = usingPostgres ? new PgStore() : new MemoryStore();
        try {
          await store.migrate();
          await store.seedIfEmpty();
          logger.log(`${store.kind}: ${store.status().detail}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.error(`Store initialisation failed (${store.kind}): ${message}`);
          logger.warn('Serving requests anyway — /api/health reports the failure detail.');
        }
        return store;
      },
      inject: [],
    },
    { provide: APP_GUARD, useClass: SessionGuard },
    {
      // Keep a reachable reference so config values are validated at boot.
      provide: 'CONFIG',
      useValue: config,
    },
  ],
})
export class AppModule {}
