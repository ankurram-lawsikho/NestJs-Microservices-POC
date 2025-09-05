# 🚀 NestJS Microservices POC - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Services Description](#services-description)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Communication Patterns](#communication-patterns)
9. [Setup & Installation](#setup--installation)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

### **Project Name**: NestJS Microservices POC
### **Purpose**: A proof-of-concept microservices architecture demonstrating user management and notification systems
### **Architecture Pattern**: Event-driven microservices with API Gateway
### **Communication**: TCP-based inter-service communication with HTTP external access

### **Key Features**:
- ✅ User registration and management
- ✅ Real-time email notifications
- ✅ Advanced database queries with JOIN operations
- ✅ Event-driven architecture
- ✅ API Gateway for external access
- ✅ Comprehensive error handling and logging
- ✅ TypeORM with PostgreSQL
- ✅ Nodemailer integration for email services

---

## 🏗️ Architecture

### **High-Level Architecture**

```
┌─────────────────┐    HTTP     ┌─────────────────┐
│   External      │ ──────────► │   API Gateway   │
│   Clients       │             │   (Port 4004)   │
└─────────────────┘             └─────────────────┘
                                        │
                                        │ TCP
                                        ▼
                                ┌─────────────────┐
                                │  Orchestration  │
                                │   & Routing     │
                                └─────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
            │   User      │    │Notification │    │   Email     │
            │  Service    │    │  Service    │    │  Service    │
            │ (Port 4000) │    │ (Port 4002) │    │ (Nodemailer)│
            └─────────────┘    └─────────────┘    └─────────────┘
                    │                   │
                    │                   │
                    ▼                   ▼
            ┌─────────────┐    ┌─────────────┐
            │ PostgreSQL  │    │ PostgreSQL  │
            │   Database  │    │   Database  │
            └─────────────┘    └─────────────┘
```

### **Communication Flow**

1. **External Request** → API Gateway (HTTP)
2. **API Gateway** → Microservices (TCP)
3. **Microservices** → Database (TypeORM)
4. **Event Emission** → Cross-service communication
5. **Email Service** → External SMTP (Gmail)

---

## 🛠️ Technology Stack

### **Backend Framework**
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment

### **Database**
- **PostgreSQL** - Primary database
- **TypeORM** - Object-Relational Mapping

### **Communication**
- **TCP** - Inter-service communication
- **HTTP** - External API access
- **RabbitMQ** - Message queuing (optional)

### **Email Service**
- **Nodemailer** - Email sending library
- **Gmail SMTP** - Email provider

### **Development Tools**
- **npm** - Package management
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📁 Project Structure

```
nest-microservices-poc-2/
├── packages/
│   └── shared/                    # Shared utilities and DTOs
│       ├── src/
│       │   ├── constants/
│       │   │   └── patterns.ts    # Message and event patterns
│       │   ├── dto/
│       │   │   ├── user.dto.ts    # User data transfer objects
│       │   │   └── notification.dto.ts
│       │   └── events/
│       │       └── notification-sent.event.ts
│       └── package.json
├── services/
│   ├── api-gateway/               # API Gateway Service
│   │   ├── src/
│   │   │   ├── clients/           # Service clients
│   │   │   ├── registration/      # Registration orchestration
│   │   │   ├── users/             # User proxy routes
│   │   │   ├── notifications/     # Notification proxy routes
│   │   │   └── app.module.ts
│   │   └── package.json
│   ├── user-service/              # User Management Service
│   │   ├── src/
│   │   │   ├── entities/          # Database entities
│   │   │   ├── users/             # User business logic
│   │   │   ├── events/            # Event handling
│   │   │   ├── common/            # Shared utilities
│   │   │   └── config/            # Configuration
│   │   └── package.json
│   └── notification-service/      # Notification Service
│       ├── src/
│       │   ├── entities/          # Database entities
│       │   ├── notifications/     # Notification business logic
│       │   ├── email/             # Email service
│       │   ├── events/            # Event handling
│       │   ├── clients/           # Service clients
│       │   └── config/            # Configuration
│       └── package.json
├── API_ROUTES.md                  # API documentation
├── FOLDER_STRUCTURE.md            # Detailed folder structure
├── QUERYBUILDER_GUIDE.md          # TypeORM QueryBuilder guide
└── package.json                   # Root package.json
```

---

## 🔧 Services Description

### **1. API Gateway Service (Port 4004)**

**Purpose**: Central entry point for external clients

**Responsibilities**:
- Route external HTTP requests to appropriate microservices
- Orchestrate complex workflows (user registration)
- Provide unified API interface
- Handle cross-cutting concerns (logging, error handling)

**Key Features**:
- HTTP-to-TCP request translation
- Service discovery and routing
- Request/response transformation
- Error handling and logging

**Endpoints**:
```
POST /registration          # User registration workflow
GET  /users/*              # User management routes
GET  /notifications/*      # Notification management routes
```

### **2. User Service (Port 4000)**

**Purpose**: User management and authentication

**Responsibilities**:
- User CRUD operations
- User authentication and validation
- Advanced user queries with QueryBuilder
- Event handling for user-related events

**Key Features**:
- User registration and management
- Advanced search and filtering
- User statistics and analytics
- JOIN queries with notifications
- Event-driven communication

**Database Operations**:
- Basic CRUD operations
- Advanced QueryBuilder queries
- JOIN operations with notifications table
- Statistical aggregations

### **3. Notification Service (Port 4002)**

**Purpose**: Notification management and email delivery

**Responsibilities**:
- Send notifications (email, SMS, push)
- Track notification status
- Handle failed notifications
- Retry mechanisms

**Key Features**:
- Email notifications via Nodemailer
- Notification status tracking
- Failed notification retry
- Advanced notification queries
- Gmail SMTP integration

**Email Integration**:
- HTML email templates
- SMTP configuration
- Email validation
- Delivery status tracking

---

## 🗄️ Database Schema

### **Users Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Notifications Table**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentAt TIMESTAMP NULL
);
```

### **Relationships**
- **Users** (1) ←→ (Many) **Notifications**
- Foreign Key: `notifications.userId` → `users.id`

---

## 📚 API Documentation

### **Base URLs**
- **API Gateway**: `http://localhost:4004`
- **User Service**: `http://localhost:4000`
- **Notification Service**: `http://localhost:4002`

### **User Management APIs**

#### **Create User**
```http
POST /users
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### **Get User by ID**
```http
GET /users/1
```

#### **Advanced User Search**
```http
GET /users/search/advanced?search=John&limit=5
```

#### **User Statistics**
```http
GET /users/stats/overview
```

#### **Users with Notifications (JOIN Query)**
```http
GET /users/with-notifications
```

### **Notification Management APIs**

#### **Send Notification**
```http
POST /notifications/send
Content-Type: application/json

{
  "userId": "1",
  "type": "welcome",
  "message": "Welcome to our platform!"
}
```

#### **Get Notification Status**
```http
GET /notifications/status/notif-123
```

#### **Get Notifications by User**
```http
GET /notifications/user/1?limit=10
```

#### **Notification Statistics**
```http
GET /notifications/stats/overview
```

### **Registration Workflow**
```http
POST /registration
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "password123"
}
```

---

## 🔄 Communication Patterns

### **1. Request-Response Pattern**
```typescript
// Message Pattern
@MessagePattern('user.get')
async getUser(@Payload() data: { id: number }) {
  return await this.usersService.getUserById(data.id);
}
```

### **2. Event-Driven Pattern**
```typescript
// Event Pattern
@EventPattern('notification.sent')
async handleNotificationSent(@Payload() data: NotificationSentEvent) {
  // Handle notification sent event
}
```

### **3. Client-Service Communication**
```typescript
// API Gateway to User Service
const user = await this.userClient.getUserById(id);

// User Service to Notification Service
const notification = await this.notificationClient.sendNotification(data);
```

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Gmail account (for email service)

### **Installation Steps**

1. **Clone Repository**
```bash
git clone <repository-url>
cd nest-microservices-poc-2
```

2. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install service dependencies
cd services/user-service && npm install
cd ../notification-service && npm install
cd ../api-gateway && npm install
cd ../../
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb microservices_db

# Update database configuration in each service
# services/*/src/config/database.config.ts
```

4. **Environment Variables**
```bash
# Create .env files for each service
# services/user-service/.env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=microservices_db

# services/notification-service/.env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=microservices_db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

5. **Start Services**
```bash
# Terminal 1 - User Service
cd services/user-service
npm run start:dev

# Terminal 2 - Notification Service
cd services/notification-service
npm run start:dev

# Terminal 3 - API Gateway
cd services/api-gateway
npm run start:dev
```

---

## 🔧 Development Workflow

### **Development Commands**

```bash
# Start all services in development mode
npm run start:dev

# Build all services
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

### **Service-Specific Commands**

```bash
# User Service
cd services/user-service
npm run start:dev    # Development mode
npm run build        # Build service
npm run start:prod   # Production mode

# Notification Service
cd services/notification-service
npm run start:dev
npm run build
npm run start:prod

# API Gateway
cd services/api-gateway
npm run start:dev
npm run build
npm run start:prod
```

### **Code Structure Guidelines**

1. **Controllers**: Handle HTTP requests and route to services
2. **Services**: Business logic and database operations
3. **Entities**: Database table definitions
4. **DTOs**: Data transfer objects for validation
5. **Clients**: Inter-service communication
6. **Events**: Event-driven communication patterns

---

## 🧪 Testing

### **Manual Testing**

1. **User Registration Flow**
```bash
curl -X POST http://localhost:4004/registration \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **JOIN Query Testing**
```bash
curl http://localhost:4004/users/with-notifications
```

3. **Email Service Testing**
```bash
curl http://localhost:4002/notifications/test/email
```

### **API Testing Tools**
- **Postman**: Import API collection
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension

---

## 🚀 Deployment

### **Production Considerations**

1. **Environment Configuration**
   - Production database credentials
   - SMTP configuration
   - Logging levels
   - Error handling

2. **Docker Deployment**
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

3. **Process Management**
   - PM2 for process management
   - Nginx for reverse proxy
   - Load balancing for high availability

---

## 🔍 Troubleshooting

### **Common Issues**

1. **Route Mismatch Error**
   - **Problem**: `@Get(':id')` catches specific routes
   - **Solution**: Order specific routes before parameterized routes

2. **NaN in JOIN Queries**
   - **Problem**: Type mismatch in database queries
   - **Solution**: Proper type casting and validation

3. **Email Service Issues**
   - **Problem**: SMTP authentication failures
   - **Solution**: Check Gmail app password and SMTP settings

4. **Database Connection Issues**
   - **Problem**: PostgreSQL connection failures
   - **Solution**: Verify database credentials and connection string

### **Debugging Tools**

1. **Logging**
   - Service-specific loggers
   - Request/response logging
   - Error tracking

2. **Database Monitoring**
   - Query performance analysis
   - Connection pool monitoring
   - Slow query identification

---

## 🔮 Future Enhancements

### **Planned Features**

1. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control
   - OAuth integration

2. **Advanced Features**
   - Real-time notifications (WebSocket)
   - File upload service
   - Caching layer (Redis)
   - Message queuing (RabbitMQ)

3. **Monitoring & Observability**
   - Health checks
   - Metrics collection
   - Distributed tracing
   - Performance monitoring

4. **Scalability**
   - Horizontal scaling
   - Load balancing
   - Database sharding
   - Microservice mesh

### **Technical Improvements**

1. **Code Quality**
   - Unit test coverage
   - Integration tests
   - E2E testing
   - Code coverage reports

2. **Security**
   - Input validation
   - SQL injection prevention
   - Rate limiting
   - CORS configuration

3. **Performance**
   - Database indexing
   - Query optimization
   - Caching strategies
   - Connection pooling

---

## 📞 Support & Contact

### **Documentation**
- **API Routes**: `API_ROUTES.md`
- **Folder Structure**: `FOLDER_STRUCTURE.md`
- **QueryBuilder Guide**: `QUERYBUILDER_GUIDE.md`

### **Development Team**
- **Lead Developer**: [Your Name]
- **Email**: [your-email@example.com]
- **Repository**: [GitHub Repository URL]

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Status**: Development/Production Ready
