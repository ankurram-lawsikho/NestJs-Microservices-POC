import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersHttpController } from './users-http.controller';
import { UsersService } from './users.service';
import { EventEmitterService } from '../events/event-emitter.service';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification])],
  controllers: [UsersController, UsersHttpController],
  providers: [UsersService, EventEmitterService],
  exports: [UsersService],
})
export class UsersModule {}
