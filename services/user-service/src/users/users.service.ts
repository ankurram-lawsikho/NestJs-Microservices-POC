import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { CreateUserDto, UserResponseDto } from '@microservices/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`User created successfully with ID: ${savedUser.id}`);

    // Return user without password
    const { password, ...userResponse } = savedUser;
    return userResponse;
  }

  async getUserById(id: number): Promise<UserResponseDto | null> {
    this.logger.log(`Fetching user with ID: ${id}`);
    
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      return null;
    }

    const { password, ...userResponse } = user;
    return userResponse;
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    this.logger.log(`Fetching user with email: ${email}`);
    
    const user = await this.usersRepository.findOne({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const { password, ...userResponse } = user;
    return userResponse;
  }

  // QueryBuilder Examples
  async getUsersWithAdvancedQuery(filters: {
    search?: string;
    createdAfter?: Date;
    limit?: number;
    offset?: number;
  }): Promise<UserResponseDto[]> {
    this.logger.log('Fetching users with advanced query');

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName', 
        'user.email',
        'user.createdAt',
        'user.updatedAt'
      ])
      .where('1=1'); // Base condition

    // Add search filter
    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Add date filter
    if (filters.createdAfter) {
      queryBuilder.andWhere('user.createdAt >= :createdAfter', {
        createdAfter: filters.createdAfter
      });
    }

    // Add pagination
    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    // Order by creation date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const users = await queryBuilder.getMany();
    return users;
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    usersThisMonth: number;
    usersByMonth: Array<{ month: string; count: number }>;
  }> {
    this.logger.log('Fetching user statistics');

    // Total users count
    const totalUsers = await this.usersRepository
      .createQueryBuilder('user')
      .getCount();

    // Users created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usersThisMonth = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    // Users by month (last 12 months)
    const usersByMonth = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        "TO_CHAR(user.createdAt, 'YYYY-MM') as month",
        'COUNT(*) as count'
      ])
      .where('user.createdAt >= :twelveMonthsAgo', {
        twelveMonthsAgo: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      })
      .groupBy("TO_CHAR(user.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(user.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    return {
      totalUsers,
      usersThisMonth,
      usersByMonth: usersByMonth.map(row => ({
        month: row.month,
        count: parseInt(row.count)
      }))
    };
  }

  async findUsersWithSimilarNames(name: string): Promise<UserResponseDto[]> {
    this.logger.log(`Finding users with similar names to: ${name}`);

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.createdAt',
        'user.updatedAt'
      ])
      .where(
        'SIMILARITY(user.firstName, :name) > 0.3 OR SIMILARITY(user.lastName, :name) > 0.3',
        { name }
      )
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return users;
  }

  async getUsersCreatedBetween(startDate: Date, endDate: Date): Promise<UserResponseDto[]> {
    this.logger.log(`Fetching users created between ${startDate} and ${endDate}`);

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.createdAt',
        'user.updatedAt'
      ])
      .where('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .orderBy('user.createdAt', 'ASC')
      .getMany();

    return users;
  }

  // Single JOIN Query - Users with notification count and list of notifications
  async getUsersWithNotifications(): Promise<Array<UserResponseDto & { notificationCount: number; notifications: Array<{ id: string; type: string; message: string; status: string; createdAt: Date }> }>> {
    this.logger.log('Fetching users with notification count and notifications using JOIN');

    // Use QueryBuilder with proper JOIN
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('notifications', 'notification', 'notification."userId" = CAST(user.id AS TEXT)')
      .select([
        'user.id as id',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.email as email',
        'user.createdAt as createdAt',
        'user.updatedAt as updatedAt',
        'notification.id as notificationId',
        'notification.type as notificationType',
        'notification.message as notificationMessage',
        'notification.status as notificationStatus',
        'notification.createdAt as notificationCreatedAt'
      ])
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('notification.createdAt', 'DESC')
      .getRawMany();

    // Group notifications by user
    const userMap = new Map<number, any>();
    
    users.forEach(row => {
      const userId = parseInt(row.id, 10);
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          notificationCount: 0,
          notifications: []
        });
      }
      
      const user = userMap.get(userId);
      
      // Add notification if it exists
      if (row.notificationId) {
        user.notifications.push({
          id: row.notificationId,
          type: row.notificationType,
          message: row.notificationMessage,
          status: row.notificationStatus,
          createdAt: row.notificationCreatedAt
        });
        user.notificationCount = user.notifications.length;
      }
    });

    return Array.from(userMap.values());
  }

}
