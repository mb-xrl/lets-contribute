import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthConfig } from '@lets-contribute/shared';
import { config, demoAuthEnabled, githubConfigured } from '../config';
import { STORE, type Store, type StoredUser } from '../domain/store';
import { GitHubService } from '../github/github.service';
import { CurrentUser } from './current-user.decorator';
import { DemoLoginDto, UpdateProfileDto } from './dto';
import { AuthGuard } from './guards';
import { SessionService } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessions: SessionService,
    private readonly github: GitHubService,
    @Inject(STORE) private readonly store: Store,
  ) {}

  private cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: config.isProduction,
      path: '/',
      maxAge: config.sessionTtlSeconds * 1000,
    };
  }

  @Get('config')
  async authConfig(): Promise<AuthConfig> {
    return {
      github: githubConfigured,
      demo: demoAuthEnabled,
      store: this.store.kind,
    };
  }

  @Get('github')
  async startGithub(@Query('next') next: string | undefined, @Res() res: Response) {
    if (!githubConfigured) {
      throw new ServiceUnavailableException(
        'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
      );
    }
    const state = await this.sessions.signState(next ?? '/');
    res.redirect(this.github.authorizeUrl(state));
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const next = await this.sessions.verifyState(state);
    if (error || !code) {
      res.redirect(`${config.webOrigin}/login?error=${encodeURIComponent(error ?? 'cancelled')}`);
      return;
    }

    try {
      const accessToken = await this.github.exchangeCode(code);
      const profile = await this.github.fetchProfile(accessToken);
      const user = await this.store.upsertGitHubUser(profile);
      const token = await this.sessions.signSession(user.id);
      res.cookie(config.sessionCookie, token, this.cookieOptions());
      res.redirect(`${config.webOrigin}${next}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'sign_in_failed';
      res.redirect(`${config.webOrigin}/login?error=${encodeURIComponent(reason)}`);
    }
  }

  /** Demo sign-in — only available when real GitHub OAuth is not configured. */
  @Post('demo')
  async demoLogin(@Body() _dto: DemoLoginDto, @Res({ passthrough: true }) res: Response) {
    if (!demoAuthEnabled) {
      throw new ForbiddenException('Demo sign-in is disabled on this deployment.');
    }
    const user = await this.store.createDemoUser();
    const token = await this.sessions.signSession(user.id);
    res.cookie(config.sessionCookie, token, this.cookieOptions());
    return { user: await this.store.getPublicUser(user.login) };
  }

  @Get('me')
  async me(@CurrentUser() user: StoredUser | null) {
    return { user: user ? await this.store.getPublicUser(user.login) : null };
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@Body() dto: UpdateProfileDto, @CurrentUser() user: StoredUser | null) {
    if (!user) throw new UnauthorizedException();
    await this.store.updateProfile(user.id, { bio: dto.bio, location: dto.location });
    return { user: await this.store.getPublicUser(user.login) };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(config.sessionCookie, { path: '/' });
    return { ok: true };
  }
}
