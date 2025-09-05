# Quick Setup Guide

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb microservices_db

# Or using psql
psql -U postgres
CREATE DATABASE microservices_db;
```

### 3. Install Dependencies
```bash
# Install all dependencies
npm run install:all
```

### 4. Environment Configuration
Copy environment files:
```bash
# User Service
cp services/user-service/env.example services/user-service/.env

# Notification Service  
cp services/notification-service/env.example services/notification-service/.env

# API Gateway
cp services/api-gateway/env.example services/api-gateway/.env
```

Update database credentials in each `.env` file if needed.

### 5. Build Shared Package
```bash
# Build the shared package first
cd packages/shared
npm run build
cd ../..
```

### 6. Start Services
```bash
# Start all services
npm run start:all

# Or start individually:
npm run start:user        # User Service (4000/4001)
npm run start:notification # Notification Service (4002/4003)
cd services/api-gateway && npm run start:dev  # API Gateway (4004)
```

## 🧪 Testing

### Test User Registration
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

### Expected Response
```json
{
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe"
  },
  "notification": {
    "id": "uuid-here",
    "status": "sent"
  },
  "totalTime": 150
}
```

## 🐳 Docker Alternative

If you prefer Docker:
```bash
# Start with Docker Compose
docker-compose up --build
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 4000-4004 are available
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Shared package**: Ensure the shared package is built before starting services
4. **Dependencies**: Run `npm run install:all` if you see module not found errors

### Service Ports
- User Service: HTTP 4000, TCP 4001
- Notification Service: HTTP 4002, TCP 4003  
- API Gateway: HTTP 4004
- PostgreSQL: 5432

## 📊 Architecture Overview

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

## 🎯 Key Features Demonstrated

- ✅ **Microservice Communication**: TCP transport with MessagePattern/EventPattern
- ✅ **Event-Driven Architecture**: User creation triggers notifications
- ✅ **Resilience Patterns**: Timeouts, retries, exception handling
- ✅ **Data Validation**: DTOs with class-validator across services
- ✅ **Database Integration**: TypeORM with PostgreSQL
- ✅ **Logging & Monitoring**: Structured logging with timing
- ✅ **Configuration Management**: Environment-based config
- ✅ **Docker Support**: Complete containerization setup
