import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CreateUserDto, UserResponseDto, MESSAGE_PATTERNS } from '@microservices/shared';
import { Observable, timeout, catchError, throwError } from 'rxjs';

@Injectable()
export class UserClient {
  private readonly logger = new Logger(UserClient.name);
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 4001,
      },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Sending create user request to user service: ${createUserDto.email}`);
    
    return this.client
      .send<UserResponseDto>(MESSAGE_PATTERNS.CREATE_USER, createUserDto)
      .pipe(
        timeout(10000), // 10 second timeout
        catchError((error) => {
          this.logger.error(`Failed to create user: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getUser(id: number): Promise<UserResponseDto | null> {
    this.logger.log(`Sending get user request to user service: ${id}`);
    
    return this.client
      .send<UserResponseDto>(MESSAGE_PATTERNS.GET_USER, { id })
      .pipe(
        timeout(5000), // 5 second timeout
        catchError((error) => {
          this.logger.error(`Failed to get user: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getUserById(id: number): Promise<UserResponseDto | null> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    this.logger.log(`Sending get user by email request to user service: ${email}`);
    
    return this.client
      .send<UserResponseDto>(MESSAGE_PATTERNS.GET_USER_BY_EMAIL, { email })
      .pipe(
        timeout(5000),
        catchError((error) => {
          this.logger.error(`Failed to get user by email: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getUsersWithAdvancedQuery(filters: {
    search?: string;
    createdAfter?: Date;
    limit?: number;
    offset?: number;
  }): Promise<UserResponseDto[]> {
    this.logger.log(`Sending advanced user search request to user service`);
    
    return this.client
      .send<UserResponseDto[]>(MESSAGE_PATTERNS.GET_USERS_WITH_ADVANCED_QUERY, filters)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to search users: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    usersThisMonth: number;
    usersByMonth: Array<{ month: string; count: number }>;
  }> {
    this.logger.log(`Sending get user stats request to user service`);
    
    return this.client
      .send(MESSAGE_PATTERNS.GET_USER_STATS, {})
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get user stats: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async findUsersWithSimilarNames(name: string): Promise<UserResponseDto[]> {
    this.logger.log(`Sending find similar users request to user service: ${name}`);
    
    return this.client
      .send<UserResponseDto[]>(MESSAGE_PATTERNS.FIND_USERS_WITH_SIMILAR_NAMES, { name })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to find similar users: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getUsersCreatedBetween(startDate: Date, endDate: Date): Promise<UserResponseDto[]> {
    this.logger.log(`Sending get users by date range request to user service`);
    
    return this.client
      .send<UserResponseDto[]>(MESSAGE_PATTERNS.GET_USERS_CREATED_BETWEEN, { startDate, endDate })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get users by date range: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  async getUsersWithNotifications(): Promise<Array<UserResponseDto & { notificationCount: number; notifications: Array<{ id: string; type: string; message: string; status: string; createdAt: Date }> }>> {
    this.logger.log(`Sending get users with notifications request to user service`);
    
    return this.client
      .send(MESSAGE_PATTERNS.GET_USERS_WITH_NOTIFICATIONS, {})
      .pipe(
        timeout(15000), // Longer timeout for JOIN query
        catchError((error) => {
          this.logger.error(`Failed to get users with notifications: ${error.message}`);
          return throwError(() => error);
        }),
      )
      .toPromise();
  }

  onModuleDestroy() {
    this.client.close();
  }
}
