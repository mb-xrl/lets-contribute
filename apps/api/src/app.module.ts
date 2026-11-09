import { Module } from '@nestjs/common';
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
      provide: STORE,
      useFactory: async (): Promise<Store> => {
        const store: Store = usingPostgres ? new PgStore() : new MemoryStore();
        if (store.kind === 'memory') {
          await store.seedIfEmpty();
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
