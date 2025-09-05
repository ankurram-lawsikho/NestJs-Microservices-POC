# NestJS Microservices Proof of Concept

A comprehensive demonstration of NestJS microservices architecture with two core services communicating over TCP transport, featuring resilience patterns, validation, and event-driven communication.

## 🏗️ Architecture Overview

This project demonstrates a microservices architecture with the following components:

- **User Service** (Port 4000/4001): Manages user registration and data
- **Notification Service** (Port 4002/4003): Handles notification sending and tracking
- **API Gateway** (Port 4004): Orchestrates communication between services
- **Shared Package**: Common DTOs, interfaces, and constants

## 📁 Project Structure

```
nest-microservices-poc-2/
├── packages/
│   └── shared/                    # Shared utilities and types
│       ├── src/
│       │   ├── dto/               # Data Transfer Objects
│       │   ├── interfaces/        # TypeScript interfaces
│       │   ├── constants/         # Message and event patterns
│       │   └── index.ts           # Public exports
│       ├── package.json
│       └── tsconfig.json
├── services/
│   ├── user-service/              # User Management Service
│   │   ├── src/
│   │   │   ├── entities/          # TypeORM entities
│   │   │   ├── users/             # User module
│   │   │   ├── config/            # Database configuration
│   │   │   ├── common/            # Filters, interceptors, retry logic
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   ├── notification-service/      # Notification Service
│   │   ├── src/
│   │   │   ├── entities/          # TypeORM entities
│   │   │   ├── notifications/     # Notification module
│   │   │   ├── config/            # Database configuration
│   │   │   ├── common/            # Filters, interceptors
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   └── api-gateway/               # API Gateway for orchestration
│       ├── src/
│       │   ├── clients/           # Microservice clients
│       │   ├── registration/      # Registration orchestration
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── package.json
└── package.json                   # Root package with workspace scripts
```

## 🚀 Key Features Demonstrated

### 1. **Microservice Communication Patterns**
- **MessagePattern**: Request-response communication
- **EventPattern**: Event-driven communication
- **TCP Transport**: Lightweight, reliable transport layer

### 2. **Resilience Features**
- **Exception Filters**: Centralized error handling
- **Timeout Interceptors**: Request timeout management
- **Logging Interceptors**: Request/response logging
- **Retry Logic**: Exponential backoff retry patterns

### 3. **Data Validation & DTOs**
- **Class Validator**: Input validation across service boundaries
- **Class Transformer**: Data transformation
- **Shared DTOs**: Consistent data contracts

### 4. **Database Integration**
- **TypeORM**: Object-relational mapping
- **PostgreSQL**: Primary database
- **Entity Management**: User and Notification entities

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb microservices_db

# Or using psql
psql -U postgres
CREATE DATABASE microservices_db;
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all
```

### 3. Environment Configuration
Copy environment files and configure:

```bash
# User Service
cp services/user-service/env.example services/user-service/.env

# Notification Service  
cp services/notification-service/env.example services/notification-service/.env

# API Gateway
cp services/api-gateway/env.example services/api-gateway/.env
```

Update database credentials in each `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=microservices_db
```

### 4. Build All Services
```bash
# Build shared package first
cd packages/shared && npm run build && cd ../..

# Build all services
npm run build:all
```

### 5. Start Services
```bash
# Start all services concurrently
npm run start:all

# Or start individually:
npm run start:user        # User Service (4000/4001)
npm run start:notification # Notification Service (4002/4003)
cd services/api-gateway && npm run start:dev  # API Gateway (4004)
```

## 📡 Service Endpoints

### User Service (Port 4000)
- **HTTP**: `http://localhost:4000`
- **TCP**: `localhost:4001`

### Notification Service (Port 4002)
- **HTTP**: `http://localhost:4002`
- **TCP**: `localhost:4003`

### API Gateway (Port 4004)
- **HTTP**: `http://localhost:4004`

## 🧪 Testing the System

### 1. User Registration via API Gateway
```bash
curl -X POST http://localhost:4004/registration \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

### 2. Direct User Service Communication
```bash
# Create user directly
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com", 
    "password": "securepassword123"
  }'
```

## 🔄 Communication Flow

### User Registration Process:
1. **API Gateway** receives registration request
2. **User Service** creates user and emits `USER_CREATED` event
3. **Notification Service** listens to event and sends welcome notification
4. **API Gateway** returns comprehensive registration summary

### Message Patterns:
- `user.create` - Create new user
- `user.get` - Retrieve user by ID
- `notification.send` - Send notification
- `notification.status` - Get notification status

### Event Patterns:
- `user.created` - User creation event
- `notification.sent` - Notification sent event

## 🛡️ Resilience Features

### Exception Handling
- **MicroserviceExceptionFilter**: Catches and logs all microservice exceptions
- **Global Error Handling**: Consistent error responses across services

### Timeout Management
- **TimeoutInterceptor**: Configurable request timeouts
- **Client Timeouts**: Per-client timeout configuration

### Logging & Monitoring
- **LoggingInterceptor**: Request/response logging with timing
- **Structured Logging**: JSON-formatted logs with context

### Retry Logic
- **Exponential Backoff**: Configurable retry with increasing delays
- **Max Retry Limits**: Prevents infinite retry loops

## 📊 Key Learning Points

### 1. **Transport Layer Selection**
- **TCP**: Fast, reliable, good for internal communication
- **Redis/RabbitMQ**: Better for high-throughput, message queuing
- **NATS**: Lightweight, cloud-native messaging

### 2. **Message vs Event Patterns**
- **MessagePattern**: Synchronous request-response
- **EventPattern**: Asynchronous fire-and-forget

### 3. **Service Boundaries**
- **Single Responsibility**: Each service has a clear purpose
- **Data Isolation**: Services manage their own data
- **API Contracts**: Shared DTOs ensure consistency

### 4. **Configuration Management**
- **Environment Variables**: Service-specific configuration
- **ConfigModule**: Centralized configuration management

### 5. **Observables vs Promises**
- **Observables**: Better for streaming, cancellation, operators
- **Promises**: Simpler for single async operations
- **RxJS Operators**: Powerful transformation and error handling

## 🔍 File Purpose Guide

### Shared Package (`packages/shared/`)
- **`dto/user.dto.ts`**: User-related data transfer objects
- **`interfaces/events.interface.ts`**: Event type definitions
- **`constants/patterns.ts`**: Message and event pattern constants

### User Service (`services/user-service/`)
- **`entities/user.entity.ts`**: TypeORM user entity
- **`users/users.service.ts`**: User business logic
- **`users/users.controller.ts`**: Microservice message handlers
- **`common/filters/`**: Exception handling
- **`common/interceptors/`**: Logging and timeout management

### Notification Service (`services/notification-service/`)
- **`entities/notification.entity.ts`**: TypeORM notification entity
- **`notifications/notifications.service.ts`**: Notification business logic
- **`notifications/notifications.controller.ts`**: Message and event handlers

### API Gateway (`services/api-gateway/`)
- **`clients/user.client.ts`**: User service client
- **`clients/notification.client.ts`**: Notification service client
- **`registration/`**: Orchestration logic for user registration

## 🚀 Next Steps

1. **Add Authentication**: JWT-based authentication between services
2. **Implement Circuit Breaker**: Prevent cascade failures
3. **Add Health Checks**: Service health monitoring
4. **Database Migrations**: Proper migration management
5. **Docker Containerization**: Container-based deployment
6. **Monitoring & Metrics**: Prometheus/Grafana integration
7. **API Documentation**: Swagger/OpenAPI documentation

## 📚 Additional Resources

- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [TypeORM Documentation](https://typeorm.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

This project demonstrates a production-ready microservices architecture with proper separation of concerns, resilience patterns, and scalable communication patterns. Each service is independently deployable and maintainable while working together to provide a cohesive user experience.
