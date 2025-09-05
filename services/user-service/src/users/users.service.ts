import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UserResponseDto } from '@microservices/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
}
