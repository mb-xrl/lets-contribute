import { Injectable } from '@nestjs/common';
import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config';

export type SessionPayload = {
  sub: string;
};

export type StatePayload = {
  kind: 'oauth';
  next: string;
};

@Injectable()
export class SessionService {
  private readonly key = new TextEncoder().encode(config.sessionSecret);

  async signSession(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${config.sessionTtlSeconds}s`)
      .sign(this.key);
  }

  async verifySession(token: string): Promise<string | null> {
    try {
      const { payload } = await jwtVerify<SessionPayload>(token, this.key);
      return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
    } catch {
      return null;
    }
  }

  /** Short-lived, signed OAuth `state` so the callback can't be forged. */
  async signState(next: string): Promise<string> {
    return new SignJWT({ kind: 'oauth', next })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(this.key);
  }

  async verifyState(token: string | undefined): Promise<string> {
    if (!token) return '/';
    try {
      const { payload } = await jwtVerify<StatePayload>(token, this.key);
      const next = typeof payload.next === 'string' ? payload.next : '/';
      // Only allow same-site paths to avoid open redirects.
      return next.startsWith('/') && !next.startsWith('//') ? next : '/';
    } catch {
      return '/';
    }
  }
}
