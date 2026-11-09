import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { StoredUser } from '../domain/store';

export type RequestWithUser = Request & { user?: StoredUser | null };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): StoredUser | null => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user ?? null;
  },
);
