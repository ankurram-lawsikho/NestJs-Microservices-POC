import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationClient } from '../clients/notification.client';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationClient],
  exports: [NotificationClient],
})
export class NotificationsModule {}
