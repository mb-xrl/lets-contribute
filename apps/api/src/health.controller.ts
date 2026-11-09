import { Controller, Get, Inject } from '@nestjs/common';
import { demoAuthEnabled, githubConfigured } from './config';
import { STORE, type Store } from './domain/store';

@Controller()
export class HealthController {
  constructor(@Inject(STORE) private readonly store: Store) {}

  @Get('health')
  health() {
    return {
      ok: true,
      store: this.store.kind,
      github: githubConfigured,
      demoAuth: demoAuthEnabled,
      time: new Date().toISOString(),
    };
  }
}
