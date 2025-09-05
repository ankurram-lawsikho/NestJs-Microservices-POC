import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EVENT_PATTERNS, NotificationSentEvent } from '@microservices/shared';

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);
  private userClient: ClientProxy;

  constructor() {
    // Create client to communicate with user service
    this.userClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 4001,
      },
    });
  }

  async emitNotificationSent(notificationSentEvent: NotificationSentEvent): Promise<void> {
    try {
      this.logger.log(`Emitting notification sent event: ${JSON.stringify(notificationSentEvent)}`);
      
      // Send event to user service (or any other interested service)
      this.userClient.emit(EVENT_PATTERNS.NOTIFICATION_SENT, notificationSentEvent);
      
      this.logger.log(`Notification sent event emitted successfully`);
    } catch (error) {
      this.logger.error(`Failed to emit notification sent event: ${error.message}`);
    }
  }

  onModuleDestroy() {
    this.userClient.close();
  }
}
