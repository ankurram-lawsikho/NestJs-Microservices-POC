# 📁 Microservices Project Structure

## 🏗️ **Root Project Structure**

```
nest-microservices-poc-2/
├── 📁 packages/                    # Shared packages across services
├── 📁 services/                    # Individual microservices
├── 📁 node_modules/               # Root dependencies
├── 📄 package.json                # Root package configuration
├── 📄 package-lock.json           # Dependency lock file
├── 📄 README.md                   # Project documentation
├── 📄 API_ROUTES.md               # API routes documentation
├── 📄 PROJECT_DOCUMENTATION.md    # Complete project documentation
├── 📄 QUERYBUILDER_GUIDE.md       # QueryBuilder documentation
└── 📄 FOLDER_STRUCTURE.md         # This file
```

---

## 📦 **Packages Directory**

### **Purpose**: Shared code and utilities used across multiple microservices

```
packages/
└── 📁 shared/                     # Shared package for common code
    ├── 📁 dist/                   # Compiled JavaScript output
    ├── 📁 src/                    # TypeScript source code
    │   ├── 📁 constants/          # Shared constants and patterns
    │   ├── 📁 dto/               # Data Transfer Objects
    │   ├── 📁 events/            # Event definitions
    │   └── 📄 index.ts           # Main export file
    ├── 📄 package.json           # Package configuration
    └── 📄 tsconfig.json          # TypeScript configuration
```

### **📁 packages/shared/src/constants/**
- **Purpose**: Centralized message and event patterns
- **Files**:
  - `patterns.ts` - Message patterns for request-response communication
  - **Updated**: Added new JOIN query patterns for advanced operations

### **📁 packages/shared/src/dto/**
- **Purpose**: Data Transfer Objects for service communication
- **Files**:
  - `user.dto.ts` - User-related DTOs with validation decorators
  - `notification.dto.ts` - Notification-related DTOs

### **📁 packages/shared/src/events/**
- **Purpose**: Event definitions for event-driven communication
- **Files**:
  - `notification-sent.event.ts` - Notification sent event structure

---

## 🔧 **Services Directory**

### **Purpose**: Individual microservices with their own business logic

```
services/
├── 📁 api-gateway/                # API Gateway Service
├── 📁 user-service/               # User Management Service
└── 📁 notification-service/       # Notification Service
```

---

## 🌐 **API Gateway Service**

### **Purpose**: Central entry point for external clients, handles orchestration and routing

```
services/api-gateway/
├── 📁 src/                        # Source code
│   ├── 📁 clients/               # Service clients for TCP communication
│   │   ├── 📄 user.client.ts     # User service client
│   │   └── 📄 notification.client.ts # Notification service client
│   ├── 📁 registration/          # Registration orchestration
│   │   ├── 📄 registration.controller.ts
│   │   ├── 📄 registration.service.ts
│   │   └── 📄 registration.module.ts
│   ├── 📁 users/                 # User proxy routes
│   │   ├── 📄 users.controller.ts # HTTP routes for user operations
│   │   └── 📄 users.module.ts    # User module configuration
│   ├── 📁 notifications/         # Notification proxy routes
│   │   ├── 📄 notifications.controller.ts # HTTP routes for notifications
│   │   └── 📄 notifications.module.ts # Notification module
│   ├── 📁 common/                # Shared utilities
│   │   ├── 📁 filters/           # Exception filters
│   │   └── 📁 interceptors/      # Request/response interceptors
│   ├── 📄 app.module.ts          # Main application module
│   └── 📄 main.ts                # Application entry point
├── 📄 package.json               # Dependencies and scripts
└── 📄 tsconfig.json              # TypeScript configuration
```

### **📁 services/api-gateway/src/clients/**
- **Purpose**: TCP clients for inter-service communication
- **Files**:
  - `user.client.ts` - **Updated**: Added JOIN query client methods
  - `notification.client.ts` - **Updated**: Added advanced query methods

### **📁 services/api-gateway/src/users/**
- **Purpose**: HTTP proxy routes for user operations
- **Files**:
  - `users.controller.ts` - **Updated**: Fixed route ordering, added JOIN query route
  - `users.module.ts` - Module configuration

### **📁 services/api-gateway/src/notifications/**
- **Purpose**: HTTP proxy routes for notification operations
- **Files**:
  - `notifications.controller.ts` - HTTP routes for notifications
  - `notifications.module.ts` - Module configuration

---

## 👤 **User Service**

### **Purpose**: User management, authentication, and advanced queries

```
services/user-service/
├── 📁 src/                        # Source code
│   ├── 📁 entities/              # Database entities
│   │   ├── 📄 user.entity.ts     # User database entity
│   │   └── 📄 notification.entity.ts # **NEW**: Notification entity for JOIN queries
│   ├── 📁 users/                 # User business logic
│   │   ├── 📄 users.controller.ts # TCP message handlers
│   │   ├── 📄 users-http.controller.ts # HTTP routes
│   │   ├── 📄 users.service.ts   # Business logic
│   │   └── 📄 users.module.ts    # Module configuration
│   ├── 📁 events/                # Event handling
│   │   ├── 📄 event-emitter.service.ts
│   │   └── 📄 event-emitter.module.ts
│   ├── 📁 common/                # Shared utilities
│   │   ├── 📁 filters/           # Exception filters
│   │   └── 📁 interceptors/      # Request/response interceptors
│   ├── 📁 config/                # Configuration
│   │   └── 📄 database.config.ts # **Updated**: Added Notification entity
│   ├── 📄 app.module.ts          # Main application module
│   └── 📄 main.ts                # Application entry point
├── 📄 package.json               # Dependencies and scripts
└── 📄 tsconfig.json              # TypeScript configuration
```

### **📁 services/user-service/src/entities/**
- **Purpose**: Database entity definitions
- **Files**:
  - `user.entity.ts` - User table structure
  - `notification.entity.ts` - **NEW**: Notification entity for JOIN operations

### **📁 services/user-service/src/users/**
- **Purpose**: User business logic and API endpoints
- **Files**:
  - `users.controller.ts` - **Updated**: Added JOIN query message patterns
  - `users-http.controller.ts` - **Updated**: Fixed route ordering, added JOIN query route
  - `users.service.ts` - **Updated**: Added JOIN query implementation with proper type handling
  - `users.module.ts` - **Updated**: Added Notification entity to TypeORM

### **📁 services/user-service/src/config/**
- **Purpose**: Service configuration
- **Files**:
  - `database.config.ts` - **Updated**: Added Notification entity to entities array

---

## 📧 **Notification Service**

### **Purpose**: Notification management, email delivery, and tracking

```
services/notification-service/
├── 📁 src/                        # Source code
│   ├── 📁 entities/              # Database entities
│   │   └── 📄 notification.entity.ts # Notification database entity
│   ├── 📁 notifications/         # Notification business logic
│   │   ├── 📄 notifications.controller.ts # TCP message handlers
│   │   ├── 📄 notifications-http.controller.ts # HTTP routes
│   │   ├── 📄 notifications.service.ts # Business logic
│   │   └── 📄 notifications.module.ts # Module configuration
│   ├── 📁 email/                 # Email service
│   │   ├── 📄 email.service.ts   # Nodemailer integration
│   │   ├── 📄 email.module.ts    # Email module
│   │   └── 📄 email.config.ts    # Email configuration
│   ├── 📁 events/                # Event handling
│   │   ├── 📄 event-emitter.service.ts
│   │   └── 📄 event-emitter.module.ts
│   ├── 📁 clients/               # Service clients
│   │   └── 📄 user.client.ts     # User service client
│   ├── 📁 common/                # Shared utilities
│   │   ├── 📁 filters/           # Exception filters
│   │   └── 📁 interceptors/      # Request/response interceptors
│   ├── 📁 config/                # Configuration
│   │   └── 📄 database.config.ts # Database configuration
│   ├── 📄 app.module.ts          # Main application module
│   └── 📄 main.ts                # Application entry point
├── 📄 package.json               # **Updated**: Added nodemailer dependencies
└── 📄 tsconfig.json              # TypeScript configuration
```

### **📁 services/notification-service/src/notifications/**
- **Purpose**: Notification business logic and API endpoints
- **Files**:
  - `notifications.controller.ts` - **Updated**: Added advanced query message patterns
  - `notifications-http.controller.ts` - **Updated**: Added advanced query HTTP routes
  - `notifications.service.ts` - **Updated**: Added email service integration and advanced queries
  - `notifications.module.ts` - **Updated**: Added EmailModule and UserClient

### **📁 services/notification-service/src/email/**
- **Purpose**: Email service integration
- **Files**:
  - `email.service.ts` - Nodemailer service with HTML templates
  - `email.module.ts` - Email module configuration
  - `email.config.ts` - Email configuration (SMTP settings)

### **📁 services/notification-service/src/clients/**
- **Purpose**: Service clients for inter-service communication
- **Files**:
  - `user.client.ts` - **NEW**: User service client for fetching user details

---

## 🔧 **Configuration Files**

### **Root Configuration**
```
nest-microservices-poc-2/
├── 📄 package.json                # Root package configuration
├── 📄 tsconfig.json               # TypeScript configuration
└── 📄 .gitignore                  # Git ignore rules
```

### **Service Configuration**
Each service has its own configuration:
```
services/[service-name]/
├── 📄 package.json               # Service-specific dependencies
├── 📄 tsconfig.json              # TypeScript configuration
└── 📄 .env                       # Environment variables (not tracked)
```

---

## 📊 **Database Structure**

### **User Service Database**
- **Table**: `users`
- **Entity**: `User`
- **Fields**: id, firstName, lastName, email, password, createdAt, updatedAt

### **Notification Service Database**
- **Table**: `notifications`
- **Entity**: `Notification`
- **Fields**: id, userId, type, message, status, createdAt, sentAt

### **Cross-Service JOIN Operations**
- **User Service**: Can access notifications table for JOIN queries
- **Notification Service**: Can access users table via UserClient

---

## 🚀 **Recent Updates & Changes**

### **New Features Added**
- ✅ **JOIN Query Endpoint**: `/users/with-notifications`
- ✅ **Notification Entity**: Added to User Service for JOIN operations
- ✅ **Email Service**: Complete Nodemailer integration
- ✅ **Advanced Queries**: Enhanced QueryBuilder operations
- ✅ **Route Ordering Fix**: Specific routes before parameterized routes

### **Files Modified**
- ✅ **API Gateway**: Updated clients and controllers
- ✅ **User Service**: Added Notification entity, JOIN queries, fixed routes
- ✅ **Notification Service**: Enhanced with email service and advanced queries
- ✅ **Shared Package**: Added new message patterns

### **Architecture Improvements**
- ✅ **Type Safety**: Proper TypeScript types throughout
- ✅ **Error Handling**: Enhanced exception filters and interceptors
- ✅ **Service Communication**: Improved TCP message patterns
- ✅ **Database Schema**: Proper entity relationships

---

## 📝 **Development Guidelines**

### **File Naming Conventions**
- **Entities**: `*.entity.ts`
- **Controllers**: `*.controller.ts` and `*-http.controller.ts`
- **Services**: `*.service.ts`
- **Modules**: `*.module.ts`
- **Configuration**: `*.config.ts`
- **Clients**: `*.client.ts`

### **Directory Structure Rules**
1. **Entities**: Database table definitions
2. **Controllers**: HTTP and TCP request handlers
3. **Services**: Business logic implementation
4. **Modules**: Dependency injection configuration
5. **Common**: Shared utilities across the service
6. **Config**: Service-specific configuration

### **Import/Export Patterns**
- **Shared Package**: Centralized DTOs and constants
- **Service Clients**: TCP communication between services
- **Event Patterns**: Event-driven communication
- **Message Patterns**: Request-response communication

---

## 🔍 **Troubleshooting Common Issues**

### **Route Conflicts**
- **Issue**: `@Get(':id')` catching specific routes
- **Solution**: Order specific routes before parameterized routes

### **Type Mismatches**
- **Issue**: NaN in JOIN queries
- **Solution**: Proper type casting and entity relationships

### **Service Communication**
- **Issue**: TCP connection failures
- **Solution**: Check service ports and message patterns

---

## 📈 **Future Enhancements**

### **Planned Additions**
- 🔄 **Authentication Service**: JWT-based authentication
- 🔄 **File Upload Service**: File management and storage
- 🔄 **Caching Layer**: Redis integration
- 🔄 **Message Queue**: RabbitMQ for async processing

### **Architecture Improvements**
- 🔄 **Service Mesh**: Istio integration
- 🔄 **Monitoring**: Prometheus and Grafana
- 🔄 **Logging**: Centralized logging with ELK stack
- 🔄 **Testing**: Comprehensive test coverage

---

**Last Updated**: [Current Date]
**Version**: 2.0.0
**Status**: Production Ready