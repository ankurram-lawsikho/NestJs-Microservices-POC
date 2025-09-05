import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { EventEmitterService } from '../events/event-emitter.service';
import { NotificationRequestDto, NotificationResponseDto, MESSAGE_PATTERNS, EVENT_PATTERNS } from '@microservices/shared';
import { UserCreatedEvent, NotificationSentEvent } from '@microservices/shared';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitterService: EventEmitterService,
  ) {}

  @MessagePattern(MESSAGE_PATTERNS.SEND_NOTIFICATION)
  async sendNotification(
    @Payload() notificationDto: NotificationRequestDto,
    @Ctx() context: RmqContext,
  ): Promise<NotificationResponseDto> {
    this.logger.log(`Received send notification request for user: ${notificationDto.userId}`);
    
    try {
      const result = await this.notificationsService.sendNotification(notificationDto);
      
      // Emit notification sent event
      const notificationSentEvent: NotificationSentEvent = {
        notificationId: result.id,
        userId: result.userId,
        type: result.type,
        status: result.status,
        timestamp: new Date(),
      };

      // Emit notification sent event
      await this.eventEmitterService.emitNotificationSent(notificationSentEvent);
      
      this.logger.log(`Notification sent and event emitted: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_NOTIFICATION_STATUS)
  async getNotificationStatus(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ): Promise<NotificationResponseDto | null> {
    this.logger.log(`Received get notification status request for ID: ${data.id}`);
    
    try {
      const result = await this.notificationsService.getNotificationStatus(data.id);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get notification status: ${error.message}`);
      throw error;
    }
  }

  @EventPattern(EVENT_PATTERNS.USER_CREATED)
  async handleUserCreated(
    @Payload() userCreatedEvent: UserCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.logger.log(`Handling user created event for user: ${userCreatedEvent.userId}`);
    
    try {
      // Send welcome notification
      const welcomeNotification: NotificationRequestDto = {
        userId: userCreatedEvent.userId.toString(),
        type: 'welcome',
        message: `Welcome ${userCreatedEvent.firstName}! Your account has been created successfully.`,
      };

      await this.notificationsService.sendNotification(welcomeNotification);
      this.logger.log(`Welcome notification sent for user: ${userCreatedEvent.userId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome notification: ${error.message}`);
    }
  }

  @MessagePattern('test.email')
  async testEmail(
    @Payload() data: { email: string },
    @Ctx() context: RmqContext,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received test email request for: ${data.email}`);
    
    try {
      const result = await this.notificationsService.testEmailConnection();
      return {
        success: result,
        message: result ? 'Email connection test successful' : 'Email connection test failed'
      };
    } catch (error) {
      this.logger.error(`Email test failed: ${error.message}`);
      return {
        success: false,
        message: `Email test failed: ${error.message}`
      };
    }
  }

  // Additional MessagePattern handlers for API Gateway
  @MessagePattern(MESSAGE_PATTERNS.GET_NOTIFICATIONS_BY_USER)
  async getNotificationsByUser(@Payload() data: { userId: string; limit?: number }): Promise<NotificationResponseDto[]> {
    this.logger.log(`Received get notifications by user request: ${data.userId}`);
    return await this.notificationsService.getNotificationsByUser(data.userId, data.limit || 10);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_NOTIFICATIONS_WITH_ADVANCED_QUERY)
  async getNotificationsWithAdvancedQuery(@Payload() filters: {
    userId?: string;
    type?: string;
    status?: 'pending' | 'sent' | 'failed';
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<NotificationResponseDto[]> {
    this.logger.log(`Received advanced notification search request`);
    return await this.notificationsService.getNotificationsWithAdvancedQuery(filters);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_NOTIFICATION_STATS)
  async getNotificationStats(): Promise<{
    totalNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    pendingNotifications: number;
    notificationsByType: Array<{ type: string; count: number }>;
    notificationsByDay: Array<{ day: string; count: number }>;
  }> {
    this.logger.log(`Received get notification stats request`);
    return await this.notificationsService.getNotificationStats();
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_FAILED_NOTIFICATIONS)
  async getFailedNotifications(): Promise<NotificationResponseDto[]> {
    this.logger.log(`Received get failed notifications request`);
    return await this.notificationsService.getFailedNotifications();
  }

  @MessagePattern(MESSAGE_PATTERNS.RETRY_FAILED_NOTIFICATIONS)
  async retryFailedNotifications(): Promise<{
    retried: number;
    successful: number;
    failed: number;
  }> {
    this.logger.log(`Received retry failed notifications request`);
    return await this.notificationsService.retryFailedNotifications();
  }

}
