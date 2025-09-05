import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserClient } from '../clients/user.client';

@Module({
  controllers: [UsersController],
  providers: [UserClient],
  exports: [UserClient],
})
export class UsersModule {}
