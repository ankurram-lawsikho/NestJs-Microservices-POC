import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RegistrationModule,
  ],
})
export class AppModule {}
