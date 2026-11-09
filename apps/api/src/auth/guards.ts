import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { config } from '../config';
import { STORE, type Store } from '../domain/store';
import type { RequestWithUser } from './current-user.decorator';
import { SessionService } from './session.service';

export function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.split('=');
    if (key?.trim() === name) return decodeURIComponent(rest.join('=').trim());
  }
  return null;
}

/**
 * Runs on every request (registered as APP_GUARD). Attaches the signed-in user
 * when a valid session cookie (or bearer token) is present, and stays silent
 * otherwise so public pages keep working for anonymous visitors.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    @Inject(STORE) private readonly store: Store,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const header = request.headers.authorization;
    const bearer = header?.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null;
    const token = readCookie(request.headers.cookie, config.sessionCookie) ?? bearer;

    request.user = null;
    if (!token) return true;

    const userId = await this.sessions.verifySession(token);
    if (!userId) return true;

    request.user = await this.store.findUserById(userId);
    return true;
  }
}

/** Use on routes that require a signed-in user. */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('Sign in with GitHub to do that.');
    }
    return true;
  }
}
