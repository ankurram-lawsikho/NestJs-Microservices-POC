import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NotificationRequestDto, NotificationResponseDto, MESSAGE_PATTERNS } from '@microservices/shared';
import { Observable, timeout, catchError, throwError } from 'rxjs';

@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 4003,
      },
    });
  }

  async sendNotification(notificationDto: NotificationRequestDto): Promise<NotificationResponseDto> {
    this.logger.log(`Sending notification request to notification service: ${notificationDto.userId}`);
    
    return this.client
      .send<NotificationResponseDto>(MESSAGE_PATTERNS.SEND_NOTIFICATION, notificationDto)
      .pipe(
        timeout(10000), // 10 second timeout
        catchError((error) => {
          this.logger.error(`Failed to send notification: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getNotificationStatus(id: string): Promise<NotificationResponseDto | null> {
    this.logger.log(`Sending get notification status request to notification service: ${id}`);
    
    return this.client
      .send<NotificationResponseDto>(MESSAGE_PATTERNS.GET_NOTIFICATION_STATUS, { id })
      .pipe(
        timeout(5000), // 5 second timeout
        catchError((error) => {
          this.logger.error(`Failed to get notification status: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  onModuleDestroy() {
    this.client.close();
  }
}
