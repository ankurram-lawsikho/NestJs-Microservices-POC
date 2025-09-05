import { Injectable, Logger } from '@nestjs/common';
import { UserClient } from '../clients/user.client';
import { NotificationClient } from '../clients/notification.client';
import { CreateUserDto, UserRegistrationSummary } from '@microservices/shared';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly userClient: UserClient,
    private readonly notificationClient: NotificationClient,
  ) {}

  async registerUserWithNotification(createUserDto: CreateUserDto): Promise<UserRegistrationSummary> {
    const startTime = Date.now();
    this.logger.log(`Starting user registration process for: ${createUserDto.email}`);

    try {
      // Step 1: Create user
      this.logger.log('Step 1: Creating user...');
      const user = await this.userClient.createUser(createUserDto);
      this.logger.log(`User created successfully with ID: ${user.id}`);

      // Step 2: Send welcome notification
      this.logger.log('Step 2: Sending welcome notification...');
      const notification = await this.notificationClient.sendNotification({
        userId: user.id.toString(),
        type: 'welcome',
        message: `Welcome ${user.firstName}! Your account has been created successfully.`,
      });
      this.logger.log(`Welcome notification sent: ${notification.id}`);

      const totalTime = Date.now() - startTime;
      this.logger.log(`Registration process completed in ${totalTime}ms`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
        notification: {
          id: notification.id,
          status: notification.status,
        },
        totalTime,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      this.logger.error(`Registration process failed after ${totalTime}ms: ${error.message}`);
      throw error;
    }
  }
}
