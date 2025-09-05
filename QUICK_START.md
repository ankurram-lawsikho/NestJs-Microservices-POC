# 🚀 Quick Start Guide

## ✅ Setup Complete!

Your NestJS microservices architecture is ready! Here's what has been built:

### 🏗️ **Architecture Overview**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ API Gateway │    │ User Service│    │Notification │
│   :4004     │◄──►│  :4000/4001 │◄──►│  :4002/4003 │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │    :5432    │
                   └─────────────┘
```

### 🎯 **Services Created**
- **User Service** (4000/4001): User management with event emission
- **Notification Service** (4002/4003): Notification handling with event listening  
- **API Gateway** (4004): Orchestrates cross-service communication
- **Shared Package**: Common DTOs, interfaces, and constants

### ✨ **Key Features Implemented**
- ✅ **TCP Transport**: Lightweight microservice communication
- ✅ **MessagePattern vs EventPattern**: Request-response and event-driven patterns
- ✅ **Event Emitter Services**: Proper cross-service event communication
- ✅ **DTOs & Validation**: Cross-service validation with class-validator
- ✅ **Exception Filters**: Centralized error handling
- ✅ **Interceptors**: Logging and timeout management
- ✅ **Resilience Patterns**: Timeouts, retries, structured logging
- ✅ **Database Integration**: TypeORM with PostgreSQL
- ✅ **Docker Support**: Complete containerization setup

## 🚀 **How to Run**

### Option 1: Development Mode (Recommended)
```bash
# Start all services at once
npm run start:all

# Or start individually in separate terminals:
# Terminal 1 - User Service
npm run start:user

# Terminal 2 - Notification Service  
npm run start:notification

# Terminal 3 - API Gateway
npm run start:gateway
```

### Option 2: Docker (Alternative)
```bash
# Start with Docker Compose
docker-compose up --build
```

## 🧪 **Testing the System**

### 1. Set up PostgreSQL
```bash
# Create database
createdb microservices_db
# Or: psql -U postgres -c "CREATE DATABASE microservices_db;"
```

### 2. Copy Environment Files
```bash
cp services/user-service/env.example services/user-service/.env
cp services/notification-service/env.example services/notification-service/.env
cp services/api-gateway/env.example services/api-gateway/.env
```

### 3. Test User Registration
```bash
# Using curl (Linux/Mac)
curl -X POST http://localhost:4004/registration \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# Using PowerShell (Windows)
Invoke-WebRequest -Uri "http://localhost:4004/registration" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

### 4. Expected Response
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "notification": {
    "id": "uuid-here",
    "status": "sent"
  },
  "totalTime": 150
}
```

## 🔄 **Communication Flow**
1. **API Gateway** receives user registration request
2. **User Service** creates user and emits `USER_CREATED` event
3. **Notification Service** automatically sends welcome notification
4. Returns comprehensive registration summary with timing

## 📊 **Message & Event Patterns**

### Message Patterns (Request-Response)
- `user.create` - Create new user
- `user.get` - Retrieve user by ID
- `notification.send` - Send notification
- `notification.status` - Get notification status

### Event Patterns (Event-Driven)
- `user.created` - User creation event
- `notification.sent` - Notification sent event

## 🛠️ **Troubleshooting**

### Common Issues
1. **Port conflicts**: Ensure ports 4000-4004 are available
2. **Database connection**: Verify PostgreSQL is running
3. **Environment files**: Copy `.env.example` to `.env` in each service
4. **Dependencies**: Run `npm run install:all` if needed

### Service Ports
- User Service: HTTP 4000, TCP 4001
- Notification Service: HTTP 4002, TCP 4003  
- API Gateway: HTTP 4004
- PostgreSQL: 5432

## 🎉 **Success!**

Your NestJS microservices are now ready to demonstrate:
- **Microservice Architecture** with proper separation of concerns
- **Transport Layer** communication using TCP
- **Event-Driven Architecture** with automatic notifications
- **Resilience Patterns** including timeouts and error handling
- **Data Validation** across service boundaries
- **Database Integration** with TypeORM and PostgreSQL

This setup showcases production-ready microservices patterns that can be extended for larger applications!
