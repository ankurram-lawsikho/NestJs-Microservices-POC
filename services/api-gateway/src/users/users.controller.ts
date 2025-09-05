import { Controller, Get, Post, Body, Param, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { UserClient } from '../clients/user.client';
import { CreateUserDto, UserResponseDto } from '@microservices/shared';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userClient: UserClient) {}

  // Simple CRUD Routes
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`API Gateway: Creating user with email: ${createUserDto.email}`);
    try {
      return await this.userClient.createUser(createUserDto);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new HttpException(`Failed to create user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES
  // Advanced QueryBuilder Routes
  @Get('search/advanced')
  async getUsersWithAdvancedQuery(
    @Query('search') search?: string,
    @Query('createdAfter') createdAfter?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<UserResponseDto[]> {
    this.logger.log(`API Gateway: Advanced user search with filters`);
    
    try {
      const filters = {
        search,
        createdAfter: createdAfter ? new Date(createdAfter) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      return await this.userClient.getUsersWithAdvancedQuery(filters);
    } catch (error) {
      this.logger.error(`Failed to search users: ${error.message}`);
      throw new HttpException(`Failed to search users: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getUserStats(): Promise<{
    totalUsers: number;
    usersThisMonth: number;
    usersByMonth: Array<{ month: string; count: number }>;
  }> {
    this.logger.log(`API Gateway: Getting user statistics`);
    try {
      return await this.userClient.getUserStats();
    } catch (error) {
      this.logger.error(`Failed to get user stats: ${error.message}`);
      throw new HttpException(`Failed to get user stats: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search/similar/:name')
  async findUsersWithSimilarNames(@Param('name') name: string): Promise<UserResponseDto[]> {
    this.logger.log(`API Gateway: Finding users with similar names to: ${name}`);
    try {
      return await this.userClient.findUsersWithSimilarNames(name);
    } catch (error) {
      this.logger.error(`Failed to find similar users: ${error.message}`);
      throw new HttpException(`Failed to find similar users: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('created/between')
  async getUsersCreatedBetween(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<UserResponseDto[]> {
    this.logger.log(`API Gateway: Getting users created between ${startDate} and ${endDate}`);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return await this.userClient.getUsersCreatedBetween(start, end);
    } catch (error) {
      this.logger.error(`Failed to get users by date range: ${error.message}`);
      throw new HttpException(`Failed to get users by date range: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list/all')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<UserResponseDto[]> {
    this.logger.log(`API Gateway: Getting all users with pagination`);
    
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      
      return await this.userClient.getUsersWithAdvancedQuery({
        limit: limitNum,
        offset,
      });
    } catch (error) {
      this.logger.error(`Failed to get all users: ${error.message}`);
      throw new HttpException(`Failed to get all users: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Single JOIN Query Route
  @Get('with-notifications')
  async getUsersWithNotifications(): Promise<Array<UserResponseDto & { notificationCount: number; notifications: Array<{ id: string; type: string; message: string; status: string; createdAt: Date }> }>> {
    this.logger.log(`API Gateway: Getting users with notifications`);
    
    try {
      return await this.userClient.getUsersWithNotifications();
    } catch (error) {
      this.logger.error(`Failed to get users with notifications: ${error.message}`);
      throw new HttpException(`Failed to get users with notifications: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PARAMETERIZED ROUTES MUST COME LAST
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserResponseDto | null> {
    this.logger.log(`API Gateway: Getting user by email: ${email}`);
    try {
      return await this.userClient.getUserByEmail(email);
    } catch (error) {
      this.logger.error(`Failed to get user by email: ${error.message}`);
      throw new HttpException(`Failed to get user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto | null> {
    this.logger.log(`API Gateway: Getting user by ID: ${id}`);
    try {
      return await this.userClient.getUserById(parseInt(id));
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${error.message}`);
      throw new HttpException(`Failed to get user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
