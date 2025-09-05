import { Controller, Get, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto } from '@microservices/shared';

@Controller('users')
export class UsersHttpController {
  private readonly logger = new Logger(UsersHttpController.name);

  constructor(private readonly usersService: UsersService) {}

  // Simple CRUD Routes
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`HTTP: Creating user with email: ${createUserDto.email}`);
    return await this.usersService.createUser(createUserDto);
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
    this.logger.log(`HTTP: Advanced user search with filters`);
    
    const filters = {
      search,
      createdAfter: createdAfter ? new Date(createdAfter) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return await this.usersService.getUsersWithAdvancedQuery(filters);
  }

  @Get('stats/overview')
  async getUserStats(): Promise<{
    totalUsers: number;
    usersThisMonth: number;
    usersByMonth: Array<{ month: string; count: number }>;
  }> {
    this.logger.log(`HTTP: Getting user statistics`);
    return await this.usersService.getUserStats();
  }

  @Get('search/similar/:name')
  async findUsersWithSimilarNames(@Param('name') name: string): Promise<UserResponseDto[]> {
    this.logger.log(`HTTP: Finding users with similar names to: ${name}`);
    return await this.usersService.findUsersWithSimilarNames(name);
  }

  @Get('created/between')
  async getUsersCreatedBetween(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<UserResponseDto[]> {
    this.logger.log(`HTTP: Getting users created between ${startDate} and ${endDate}`);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return await this.usersService.getUsersCreatedBetween(start, end);
  }

  @Get('list/all')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<UserResponseDto[]> {
    this.logger.log(`HTTP: Getting all users with pagination`);
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    return await this.usersService.getUsersWithAdvancedQuery({
      limit: limitNum,
      offset,
    });
  }

  // Single JOIN Query HTTP Route
  @Get('with-notifications')
  async getUsersWithNotifications(): Promise<Array<UserResponseDto & { notificationCount: number; notifications: Array<{ id: string; type: string; message: string; status: string; createdAt: Date }> }>> {
    this.logger.log(`HTTP: Getting users with notifications`);
    return await this.usersService.getUsersWithNotifications();
  }

  // PARAMETERIZED ROUTES MUST COME LAST
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserResponseDto | null> {
    this.logger.log(`HTTP: Getting user by email: ${email}`);
    return await this.usersService.getUserByEmail(email);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto | null> {
    this.logger.log(`HTTP: Getting user by ID: ${id}`);
    return await this.usersService.getUserById(parseInt(id));
  }

}
