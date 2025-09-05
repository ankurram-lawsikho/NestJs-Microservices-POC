import { Controller, Post, Body, Logger } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateUserDto, UserRegistrationSummary } from '@microservices/shared';

@Controller('registration')
export class RegistrationController {
  private readonly logger = new Logger(RegistrationController.name);

  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<UserRegistrationSummary> {
    this.logger.log(`Received registration request for: ${createUserDto.email}`);
    return this.registrationService.registerUserWithNotification(createUserDto);
  }
}
