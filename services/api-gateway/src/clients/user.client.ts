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

  onModuleDestroy() {
    this.client.close();
  }
}
