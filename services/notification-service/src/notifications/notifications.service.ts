import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationRequestDto, NotificationResponseDto } from '@microservices/shared';
import { EmailService } from '../email/email.service';
import { UserClient } from '../clients/user.client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private emailService: EmailService,
    private userClient: UserClient,
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
      
      // Send real email notification
      const emailSent = await this.sendEmailNotification(savedNotification);
      
      if (emailSent) {
        // Update status to sent
        await this.notificationsRepository.update(savedNotification.id, {
          status: 'sent',
          sentAt: new Date(),
        });
      } else {
        // Update status to failed
        await this.notificationsRepository.update(savedNotification.id, {
          status: 'failed',
        });
        throw new Error('Failed to send email notification');
      }

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

  private async sendEmailNotification(notification: Notification): Promise<boolean> {
    try {
      // Get user's email from user service
      const userEmail = await this.getUserEmail(notification.userId);
      
      if (!userEmail) {
        this.logger.error(`No email found for user: ${notification.userId}`);
        return false;
      }
      
      this.logger.log(`Sending email notification: ${notification.type} to ${userEmail}`);
      
      if (notification.type === 'welcome') {
        // Extract first name from message or use default
        const firstName = this.extractFirstNameFromMessage(notification.message) || 'User';
        return await this.emailService.sendWelcomeEmail(userEmail, firstName);
      } else {
        return await this.emailService.sendNotificationEmail(
          userEmail, 
          notification.message, 
          notification.type
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      return false;
    }
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      this.logger.log(`Getting email for user ID: ${userId}`);
      
      // Call user service to get user details
      const user = await this.userClient.getUser(parseInt(userId));
      
      if (!user) {
        this.logger.warn(`User not found for ID: ${userId}`);
        return null;
      }
      
      this.logger.log(`Found user email: ${user.email}`);
      return user.email;
      
    } catch (error) {
      this.logger.error(`Failed to get user email for userId ${userId}:`, error);
      return 'email-not-found@email.com';
    }
  }

  private extractFirstNameFromMessage(message: string): string | null {
    // Simple extraction - look for "Welcome [Name]" pattern
    const match = message.match(/Welcome\s+(\w+)/i);
    return match ? match[1] : null;
  }

  async testEmailConnection(): Promise<boolean> {
    return await this.emailService.testConnection();
  }

  // QueryBuilder Examples for Notifications
  async getNotificationsWithAdvancedQuery(filters: {
    userId?: string;
    type?: string;
    status?: 'pending' | 'sent' | 'failed';
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<NotificationResponseDto[]> {
    this.logger.log('Fetching notifications with advanced query');

    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .select([
        'notification.id',
        'notification.userId',
        'notification.type',
        'notification.message',
        'notification.status',
        'notification.createdAt',
        'notification.sentAt'
      ])
      .where('1=1'); // Base condition

    // Add filters
    if (filters.userId) {
      queryBuilder.andWhere('notification.userId = :userId', { userId: filters.userId });
    }

    if (filters.type) {
      queryBuilder.andWhere('notification.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('notification.status = :status', { status: filters.status });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('notification.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('notification.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Add pagination
    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    // Order by creation date
    queryBuilder.orderBy('notification.createdAt', 'DESC');

    const notifications = await queryBuilder.getMany();
    
    return notifications.map(notification => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      status: notification.status as 'sent' | 'failed',
      timestamp: notification.createdAt,
    }));
  }

  async getNotificationStats(): Promise<{
    totalNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    pendingNotifications: number;
    notificationsByType: Array<{ type: string; count: number }>;
    notificationsByDay: Array<{ day: string; count: number }>;
  }> {
    this.logger.log('Fetching notification statistics');

    // Total notifications
    const totalNotifications = await this.notificationsRepository
      .createQueryBuilder('notification')
      .getCount();

    // Notifications by status
    const statusStats = await this.notificationsRepository
      .createQueryBuilder('notification')
      .select(['notification.status', 'COUNT(*) as count'])
      .groupBy('notification.status')
      .getRawMany();

    const sentNotifications = statusStats.find(s => s.notification_status === 'sent')?.count || 0;
    const failedNotifications = statusStats.find(s => s.notification_status === 'failed')?.count || 0;
    const pendingNotifications = statusStats.find(s => s.notification_status === 'pending')?.count || 0;

    // Notifications by type
    const notificationsByType = await this.notificationsRepository
      .createQueryBuilder('notification')
      .select(['notification.type', 'COUNT(*) as count'])
      .groupBy('notification.type')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    // Notifications by day (last 30 days)
    const notificationsByDay = await this.notificationsRepository
      .createQueryBuilder('notification')
      .select([
        "TO_CHAR(notification.createdAt, 'YYYY-MM-DD') as day",
        'COUNT(*) as count'
      ])
      .where('notification.createdAt >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      })
      .groupBy("TO_CHAR(notification.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(notification.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return {
      totalNotifications,
      sentNotifications: parseInt(sentNotifications),
      failedNotifications: parseInt(failedNotifications),
      pendingNotifications: parseInt(pendingNotifications),
      notificationsByType: notificationsByType.map(row => ({
        type: row.notification_type,
        count: parseInt(row.count)
      })),
      notificationsByDay: notificationsByDay.map(row => ({
        day: row.day,
        count: parseInt(row.count)
      }))
    };
  }

  async getFailedNotifications(): Promise<NotificationResponseDto[]> {
    this.logger.log('Fetching failed notifications');

    const notifications = await this.notificationsRepository
      .createQueryBuilder('notification')
      .select([
        'notification.id',
        'notification.userId',
        'notification.type',
        'notification.message',
        'notification.status',
        'notification.createdAt',
        'notification.sentAt'
      ])
      .where('notification.status = :status', { status: 'failed' })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();

    return notifications.map(notification => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      status: notification.status as 'sent' | 'failed',
      timestamp: notification.createdAt,
    }));
  }

  async getNotificationsByUser(userId: string, limit: number = 10): Promise<NotificationResponseDto[]> {
    this.logger.log(`Fetching notifications for user: ${userId}`);

    const notifications = await this.notificationsRepository
      .createQueryBuilder('notification')
      .select([
        'notification.id',
        'notification.userId',
        'notification.type',
        'notification.message',
        'notification.status',
        'notification.createdAt',
        'notification.sentAt'
      ])
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return notifications.map(notification => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      status: notification.status as 'sent' | 'failed',
      timestamp: notification.createdAt,
    }));
  }

  async retryFailedNotifications(): Promise<{ retried: number; successful: number; failed: number }> {
    this.logger.log('Retrying failed notifications');

    const failedNotifications = await this.getFailedNotifications();
    let successful = 0;
    let failed = 0;

    for (const notification of failedNotifications) {
      try {
        const emailSent = await this.sendEmailNotification(notification as any);
        
        if (emailSent) {
          await this.notificationsRepository.update(notification.id, {
            status: 'sent',
            sentAt: new Date(),
          });
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        this.logger.error(`Failed to retry notification ${notification.id}:`, error);
        failed++;
      }
    }

    return {
      retried: failedNotifications.length,
      successful,
      failed
    };
  }

}
