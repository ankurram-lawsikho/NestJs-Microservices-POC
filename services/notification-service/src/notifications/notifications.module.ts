import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsHttpController } from './notifications-http.controller';
import { NotificationsService } from './notifications.service';
import { EventEmitterService } from '../events/event-emitter.service';
import { Notification } from '../entities/notification.entity';
import { EmailModule } from '../email/email.module';
import { UserClient } from '../clients/user.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EmailModule,
  ],
  controllers: [NotificationsController, NotificationsHttpController],
  providers: [NotificationsService, EventEmitterService, UserClient],
  exports: [NotificationsService],
})
export class NotificationsModule {}
