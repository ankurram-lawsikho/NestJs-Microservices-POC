import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EVENT_PATTERNS, UserCreatedEvent } from '@microservices/shared';

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);
  private notificationClient: ClientProxy;

  constructor() {
    // Create client to communicate with notification service
    this.notificationClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 4003,
      },
    });
  }

  async emitUserCreated(userCreatedEvent: UserCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Emitting user created event: ${JSON.stringify(userCreatedEvent)}`);
      
      // Send event to notification service
      this.notificationClient.emit(EVENT_PATTERNS.USER_CREATED, userCreatedEvent);
      
      this.logger.log(`User created event emitted successfully`);
    } catch (error) {
      this.logger.error(`Failed to emit user created event: ${error.message}`);
    }
  }

  onModuleDestroy() {
    this.notificationClient.close();
  }
}
