import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { MicroserviceExceptionFilter } from './common/filters/microservice-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('UserService');
  
  // Create HTTP application
  const app = await NestFactory.create(AppModule);
  
  // Create microservice with resilience features
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4001,
    },
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Global exception filter for microservice
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(10000), // 10 second timeout
  );

  // Enable CORS
  app.enableCors();

  // Start both HTTP and microservice
  await app.startAllMicroservices();
  await app.listen(4000);
  
  logger.log('User Service is running on HTTP port 4000');
  logger.log('User Service microservice is running on TCP port 4001');
}

bootstrap();
