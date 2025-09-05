import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationRequestDto, NotificationResponseDto } from '@microservices/shared';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async sendNotification(notificationDto: NotificationRequestDto): Promise<NotificationResponseDto> {
    this.logger.log(`Sending notification to user ${notificationDto.userId}: ${notificationDto.type}`);
    
    try {
      // Create notification record
      const notification = this.notificationsRepository.create({
        userId: notificationDto.userId,
        type: notificationDto.type,
        message: notificationDto.message,
        status: 'pending',
      });

      const savedNotification = await this.notificationsRepository.save(notification);
      
      // Simulate sending notification (in real app, this would call external service)
      await this.simulateNotificationSending(savedNotification.id);
      
      // Update status to sent
      await this.notificationsRepository.update(savedNotification.id, {
        status: 'sent',
        sentAt: new Date(),
      });

      this.logger.log(`Notification sent successfully: ${savedNotification.id}`);
      
      return {
        id: savedNotification.id,
        userId: savedNotification.userId,
        type: savedNotification.type,
        message: savedNotification.message,
        status: 'sent',
        timestamp: savedNotification.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      
      // Update status to failed if notification was created
      if (notificationDto.userId) {
        await this.notificationsRepository.update(
          { userId: notificationDto.userId, status: 'pending' },
          { status: 'failed' }
        );
      }
      
      throw error;
    }
  }

  async getNotificationStatus(id: string): Promise<NotificationResponseDto | null> {
    this.logger.log(`Getting notification status for ID: ${id}`);
    
    const notification = await this.notificationsRepository.findOne({
      where: { id }
    });

    if (!notification) {
      return null;
    }

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      status: notification.status as 'sent' | 'failed',
      timestamp: notification.createdAt,
    };
  }

  private async simulateNotificationSending(notificationId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Simulated notification service failure');
    }
  }
}
