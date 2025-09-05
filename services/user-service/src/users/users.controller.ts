import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { EventEmitterService } from '../events/event-emitter.service';
import { CreateUserDto, UserResponseDto, MESSAGE_PATTERNS, EVENT_PATTERNS } from '@microservices/shared';
import { UserCreatedEvent, NotificationSentEvent } from '@microservices/shared';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitterService: EventEmitterService,
  ) {}

  @MessagePattern(MESSAGE_PATTERNS.CREATE_USER)
  async createUser(
    @Payload() createUserDto: CreateUserDto,
    @Ctx() context: RmqContext,
  ): Promise<UserResponseDto> {
    this.logger.log(`Received create user request for email: ${createUserDto.email}`);
    
    try {
      const user = await this.usersService.createUser(createUserDto);
      
      // Emit user created event
      const userCreatedEvent: UserCreatedEvent = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        timestamp: new Date(),
      };

      // Emit user created event
      await this.eventEmitterService.emitUserCreated(userCreatedEvent);
      
      this.logger.log(`User created and event emitted for user ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USER)
  async getUser(
    @Payload() data: { id: number },
    @Ctx() context: RmqContext,
  ): Promise<UserResponseDto | null> {
    this.logger.log(`Received get user request for ID: ${data.id}`);
    
    try {
      const user = await this.usersService.getUserById(data.id);
      return user;
    } catch (error) {
      this.logger.error(`Failed to get user: ${error.message}`);
      throw error;
    }
  }

  @EventPattern(EVENT_PATTERNS.NOTIFICATION_SENT)
  async handleNotificationSent(
    @Payload() notificationSentEvent: NotificationSentEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.logger.log(`Received notification sent event for user: ${notificationSentEvent.userId}, notification: ${notificationSentEvent.notificationId}`);
    
    try {
      // Handle the notification sent event
      // This could include updating user preferences, logging notification history, etc.
      this.logger.log(`Notification ${notificationSentEvent.notificationId} sent to user ${notificationSentEvent.userId} with status: ${notificationSentEvent.status}`);
      
      // You could add business logic here, such as:
      // - Update user notification preferences
      // - Log notification history
      // - Update user activity tracking
      // - Send analytics data
      
    } catch (error) {
      this.logger.error(`Failed to handle notification sent event: ${error.message}`);
      // Note: For event handlers, we typically don't throw errors as they are fire-and-forget
      // Instead, we log the error and continue processing
    }
  }

  // Additional MessagePattern handlers for API Gateway
  @MessagePattern(MESSAGE_PATTERNS.GET_USER_BY_EMAIL)
  async getUserByEmail(@Payload() data: { email: string }): Promise<UserResponseDto | null> {
    this.logger.log(`Received get user by email request: ${data.email}`);
    return await this.usersService.getUserByEmail(data.email);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USERS_WITH_ADVANCED_QUERY)
  async getUsersWithAdvancedQuery(@Payload() filters: {
    search?: string;
    createdAfter?: Date;
    limit?: number;
    offset?: number;
  }): Promise<UserResponseDto[]> {
    this.logger.log(`Received advanced user search request`);
    return await this.usersService.getUsersWithAdvancedQuery(filters);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USER_STATS)
  async getUserStats(): Promise<{
    totalUsers: number;
    usersThisMonth: number;
    usersByMonth: Array<{ month: string; count: number }>;
  }> {
    this.logger.log(`Received get user stats request`);
    return await this.usersService.getUserStats();
  }

  @MessagePattern(MESSAGE_PATTERNS.FIND_USERS_WITH_SIMILAR_NAMES)
  async findUsersWithSimilarNames(@Payload() data: { name: string }): Promise<UserResponseDto[]> {
    this.logger.log(`Received find similar users request: ${data.name}`);
    return await this.usersService.findUsersWithSimilarNames(data.name);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USERS_CREATED_BETWEEN)
  async getUsersCreatedBetween(@Payload() data: { startDate: Date; endDate: Date }): Promise<UserResponseDto[]> {
    this.logger.log(`Received get users by date range request`);
    return await this.usersService.getUsersCreatedBetween(data.startDate, data.endDate);
  }

  // Single JOIN Query MessagePattern handler
  @MessagePattern(MESSAGE_PATTERNS.GET_USERS_WITH_NOTIFICATIONS)
  async getUsersWithNotifications(): Promise<Array<UserResponseDto & { notificationCount: number; notifications: Array<{ id: string; type: string; message: string; status: string; createdAt: Date }> }>> {
    this.logger.log(`Received get users with notifications request`);
    return await this.usersService.getUsersWithNotifications();
  }

}
