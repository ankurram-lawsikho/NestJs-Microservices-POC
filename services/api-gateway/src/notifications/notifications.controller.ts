import { Controller, Get, Post, Body, Param, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationClient } from '../clients/notification.client';
import { NotificationRequestDto, NotificationResponseDto } from '@microservices/shared';

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationClient: NotificationClient) {}

  // Simple CRUD Routes
  @Post('send')
  async sendNotification(@Body() notificationDto: NotificationRequestDto): Promise<NotificationResponseDto> {
    this.logger.log(`API Gateway: Sending notification to user: ${notificationDto.userId}`);
    try {
      return await this.notificationClient.sendNotification(notificationDto);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw new HttpException(`Failed to send notification: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:id')
  async getNotificationStatus(@Param('id') id: string): Promise<NotificationResponseDto | null> {
    this.logger.log(`API Gateway: Getting notification status for ID: ${id}`);
    try {
      return await this.notificationClient.getNotificationStatus(id);
    } catch (error) {
      this.logger.error(`Failed to get notification status: ${error.message}`);
      throw new HttpException(`Failed to get notification status: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:userId')
  async getNotificationsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '10',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`API Gateway: Getting notifications for user: ${userId}`);
    try {
      return await this.notificationClient.getNotificationsByUser(userId, parseInt(limit));
    } catch (error) {
      this.logger.error(`Failed to get notifications by user: ${error.message}`);
      throw new HttpException(`Failed to get notifications by user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    this.logger.log(`API Gateway: Advanced notification search with filters`);
    
    try {
      const filters = {
        userId,
        type,
        status,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      return await this.notificationClient.getNotificationsWithAdvancedQuery(filters);
    } catch (error) {
      this.logger.error(`Failed to search notifications: ${error.message}`);
      throw new HttpException(`Failed to search notifications: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    this.logger.log(`API Gateway: Getting notification statistics`);
    try {
      return await this.notificationClient.getNotificationStats();
    } catch (error) {
      this.logger.error(`Failed to get notification stats: ${error.message}`);
      throw new HttpException(`Failed to get notification stats: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('failed/list')
  async getFailedNotifications(): Promise<NotificationResponseDto[]> {
    this.logger.log(`API Gateway: Getting failed notifications`);
    try {
      return await this.notificationClient.getFailedNotifications();
    } catch (error) {
      this.logger.error(`Failed to get failed notifications: ${error.message}`);
      throw new HttpException(`Failed to get failed notifications: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('retry/failed')
  async retryFailedNotifications(): Promise<{
    retried: number;
    successful: number;
    failed: number;
  }> {
    this.logger.log(`API Gateway: Retrying failed notifications`);
    try {
      return await this.notificationClient.retryFailedNotifications();
    } catch (error) {
      this.logger.error(`Failed to retry notifications: ${error.message}`);
      throw new HttpException(`Failed to retry notifications: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('test/email')
  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log(`API Gateway: Testing email connection`);
    try {
      return await this.notificationClient.testEmailConnection();
    } catch (error) {
      this.logger.error(`Failed to test email connection: ${error.message}`);
      throw new HttpException(`Failed to test email connection: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list/all')
  async getAllNotifications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: 'pending' | 'sent' | 'failed',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`API Gateway: Getting all notifications with pagination`);
    
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      
      return await this.notificationClient.getNotificationsWithAdvancedQuery({
        status,
        limit: limitNum,
        offset,
      });
    } catch (error) {
      this.logger.error(`Failed to get all notifications: ${error.message}`);
      throw new HttpException(`Failed to get all notifications: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('by-type/:type')
  async getNotificationsByType(
    @Param('type') type: string,
    @Query('limit') limit: string = '20',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`API Gateway: Getting notifications by type: ${type}`);
    
    try {
      return await this.notificationClient.getNotificationsWithAdvancedQuery({
        type,
        limit: parseInt(limit),
      });
    } catch (error) {
      this.logger.error(`Failed to get notifications by type: ${error.message}`);
      throw new HttpException(`Failed to get notifications by type: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('date-range')
  async getNotificationsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: string = '50',
  ): Promise<NotificationResponseDto[]> {
    this.logger.log(`API Gateway: Getting notifications by date range`);
    
    try {
      return await this.notificationClient.getNotificationsWithAdvancedQuery({
        dateFrom: new Date(startDate),
        dateTo: new Date(endDate),
        limit: parseInt(limit),
      });
    } catch (error) {
      this.logger.error(`Failed to get notifications by date range: ${error.message}`);
      throw new HttpException(`Failed to get notifications by date range: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
