import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { UserClient } from '../clients/user.client';
import { NotificationClient } from '../clients/notification.client';

@Module({
  controllers: [RegistrationController],
  providers: [RegistrationService, UserClient, NotificationClient],
})
export class RegistrationModule {}
