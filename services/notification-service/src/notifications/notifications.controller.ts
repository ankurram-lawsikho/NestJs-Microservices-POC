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
}
