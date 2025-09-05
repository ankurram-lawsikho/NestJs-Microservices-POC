import { Controller, Get, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationRequestDto, NotificationResponseDto } from '@microservices/shared';

@Controller('notifications')
export class NotificationsHttpController {
  private readonly logger = new Logger(NotificationsHttpController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // Simple CRUD Routes
  @Post('send')
  async sendNotification(@Body() notificationDto: NotificationRequestDto): Promise<NotificationResponseDto> {
    this.logger.log(`HTTP: Sending notification to user: ${notificationDto.userId}`);
    return await this.notificationsService.sendNotification(notificationDto);
  }

  @Get('status/:id')
  async getNotificationStatus(@Param('id') id: string): Promise<NotificationResponseDto | null> {
    this.logger.log(`HTTP: Getting notification status for ID: ${id}`);
    return await this.notificationsService.getNotificationStatus(id);
  }

  @Get('user/:userId')
  async getNotificationsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '10',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`HTTP: Getting notifications for user: ${userId}`);
    return await this.notificationsService.getNotificationsByUser(userId, parseInt(limit));
  }

  // Advanced QueryBuilder Routes
  @Get('search/advanced')
  async getNotificationsWithAdvancedQuery(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('status') status?: 'pending' | 'sent' | 'failed',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`HTTP: Advanced notification search with filters`);
    
    const filters = {
      userId,
      type,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return await this.notificationsService.getNotificationsWithAdvancedQuery(filters);
  }

  @Get('stats/overview')
  async getNotificationStats(): Promise<{
    totalNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    pendingNotifications: number;
    notificationsByType: Array<{ type: string; count: number }>;
    notificationsByDay: Array<{ day: string; count: number }>;
  }> {
    this.logger.log(`HTTP: Getting notification statistics`);
    return await this.notificationsService.getNotificationStats();
  }

  @Get('failed/list')
  async getFailedNotifications(): Promise<NotificationResponseDto[]> {
    this.logger.log(`HTTP: Getting failed notifications`);
    return await this.notificationsService.getFailedNotifications();
  }

  @Post('retry/failed')
  async retryFailedNotifications(): Promise<{
    retried: number;
    successful: number;
    failed: number;
  }> {
    this.logger.log(`HTTP: Retrying failed notifications`);
    return await this.notificationsService.retryFailedNotifications();
  }

  @Get('test/email')
  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log(`HTTP: Testing email connection`);
    
    try {
      const result = await this.notificationsService.testEmailConnection();
      return {
        success: result,
        message: result ? 'Email connection test successful' : 'Email connection test failed'
      };
    } catch (error) {
      return {
        success: false,
        message: `Email test failed: ${error.message}`
      };
    }
  }

  @Get('list/all')
  async getAllNotifications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: 'pending' | 'sent' | 'failed',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`HTTP: Getting all notifications with pagination`);
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    return await this.notificationsService.getNotificationsWithAdvancedQuery({
      status,
      limit: limitNum,
      offset,
    });
  }

  @Get('by-type/:type')
  async getNotificationsByType(
    @Param('type') type: string,
    @Query('limit') limit: string = '20',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`HTTP: Getting notifications by type: ${type}`);
    
    return await this.notificationsService.getNotificationsWithAdvancedQuery({
      type,
      limit: parseInt(limit),
    });
  }

  @Get('date-range')
  async getNotificationsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: string = '50',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`HTTP: Getting notifications by date range`);
    
    return await this.notificationsService.getNotificationsWithAdvancedQuery({
      dateFrom: new Date(startDate),
      dateTo: new Date(endDate),
      limit: parseInt(limit),
    });
  }

}
