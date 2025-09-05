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

  async getNotificationsByUser(userId: string, limit: number = 10): Promise<NotificationResponseDto[]> {
    this.logger.log(`Sending get notifications by user request to notification service: ${userId}`);
    
    return this.client
      .send<NotificationResponseDto[]>(MESSAGE_PATTERNS.GET_NOTIFICATIONS_BY_USER, { userId, limit })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get notifications by user: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getNotificationsWithAdvancedQuery(filters: {
    userId?: string;
    type?: string;
    status?: 'pending' | 'sent' | 'failed';
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<NotificationResponseDto[]> {
    this.logger.log(`Sending advanced notification search request to notification service`);
    
    return this.client
      .send<NotificationResponseDto[]>(MESSAGE_PATTERNS.GET_NOTIFICATIONS_WITH_ADVANCED_QUERY, filters)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to search notifications: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getNotificationStats(): Promise<{
    totalNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    pendingNotifications: number;
    notificationsByType: Array<{ type: string; count: number }>;
    notificationsByDay: Array<{ day: string; count: number }>;
  }> {
    this.logger.log(`Sending get notification stats request to notification service`);
    
    return this.client
      .send(MESSAGE_PATTERNS.GET_NOTIFICATION_STATS, {})
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get notification stats: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getFailedNotifications(): Promise<NotificationResponseDto[]> {
    this.logger.log(`Sending get failed notifications request to notification service`);
    
    return this.client
      .send<NotificationResponseDto[]>(MESSAGE_PATTERNS.GET_FAILED_NOTIFICATIONS, {})
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get failed notifications: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async retryFailedNotifications(): Promise<{
    retried: number;
    successful: number;
    failed: number;
  }> {
    this.logger.log(`Sending retry failed notifications request to notification service`);
    
    return this.client
      .send(MESSAGE_PATTERNS.RETRY_FAILED_NOTIFICATIONS, {})
      .pipe(
        timeout(30000), // Longer timeout for retry operation
        catchError((error) => {
          this.logger.error(`Failed to retry notifications: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Sending test email connection request to notification service`);
    
    return this.client
      .send(MESSAGE_PATTERNS.TEST_EMAIL, {})
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to test email connection: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  onModuleDestroy() {
    this.client.close();
  }
}
