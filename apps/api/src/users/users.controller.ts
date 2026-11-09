import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import type { PublicUser } from '@lets-contribute/shared';
import { STORE, type Store } from '../domain/store';

@Controller('users')
export class UsersController {
  constructor(@Inject(STORE) private readonly store: Store) {}

  @Get(':login')
  async profile(@Param('login') login: string): Promise<PublicUser> {
    const user = await this.store.getPublicUser(login);
    if (!user) throw new NotFoundException('No contributor with that handle.');
    return user;
  }
}
