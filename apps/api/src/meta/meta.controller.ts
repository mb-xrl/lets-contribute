import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { PublicUser, RepoPreview, Stats, TagCount } from '@lets-contribute/shared';
import { STORE, type Store } from '../domain/store';
import { GitHubService } from '../github/github.service';

@Controller('meta')
export class MetaController {
  constructor(
    @Inject(STORE) private readonly store: Store,
    private readonly github: GitHubService,
  ) {}

  @Get('stats')
  stats(): Promise<Stats> {
    return this.store.stats();
  }

  @Get('tags')
  tags(): Promise<TagCount[]> {
    return this.store.listTags();
  }

  @Get('contributors')
  contributors(@Query('limit') limit?: string): Promise<PublicUser[]> {
    const parsed = Number(limit);
    return this.store.listContributors(Number.isFinite(parsed) ? Math.min(24, parsed) : 8);
  }

  /** Live GitHub metadata preview for the composer. Returns null when unavailable. */
  @Get('repo-preview')
  async repoPreview(@Query('input') input: string): Promise<{ repo: RepoPreview | null }> {
    if (!input) return { repo: null };
    return { repo: await this.github.repoPreview(input) };
  }
}
