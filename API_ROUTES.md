# 🚀 API Routes Documentation

## 📍 **Service Endpoints Overview**

| Service | HTTP Port | Base URL | Purpose |
|---------|-----------|----------|---------|
| **API Gateway** | 4004 | `http://localhost:4004` | External API, orchestration |
| **User Service** | 4000 | `http://localhost:4000` | User management, direct access |
| **Notification Service** | 4002 | `http://localhost:4002` | Notifications, direct access |

---

## 🌐 **API Gateway Routes**

### **Base URL**: `http://localhost:4004`

#### **User Registration (Orchestrated)**
```bash
curl -X POST http://localhost:4004/registration \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

#### **User Management**
```bash
# Create User
curl -X POST http://localhost:4004/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "password123"
  }'

# Advanced User Search
curl "http://localhost:4004/users/search/advanced?search=John&limit=5"

# User Statistics
curl http://localhost:4004/users/stats/overview

# Find Similar Users
curl http://localhost:4004/users/search/similar/John

# Users Created Between Dates
curl "http://localhost:4004/users/created/between?startDate=2024-01-01&endDate=2024-03-31"

# Get All Users (Paginated)
curl "http://localhost:4004/users/list/all?page=1&limit=10"

# Users with Notifications (JOIN Query) - NEW!
curl http://localhost:4004/users/with-notifications

# Get User by ID
curl http://localhost:4004/users/1

# Get User by Email
curl http://localhost:4004/users/email/jane.smith@example.com
```

#### **Notification Management**
```bash
# Send Notification
curl -X POST http://localhost:4004/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "type": "welcome",
    "message": "Welcome to our platform!"
  }'

# Get Notification Status
curl http://localhost:4004/notifications/status/notif-123

# Get Notifications by User
curl "http://localhost:4004/notifications/user/1?limit=10"

# Advanced Notification Search
curl "http://localhost:4004/notifications/search/advanced?status=sent&limit=10"

# Notification Statistics
curl http://localhost:4004/notifications/stats/overview

# Get Failed Notifications
curl http://localhost:4004/notifications/failed/list

# Retry Failed Notifications
curl -X POST http://localhost:4004/notifications/retry/failed

# Test Email Connection
curl http://localhost:4004/notifications/test/email

# Get All Notifications (Paginated)
curl "http://localhost:4004/notifications/list/all?page=1&limit=10"

# Get Notifications by Type
curl "http://localhost:4004/notifications/by-type/welcome?limit=5"

# Get Notifications by Date Range
curl "http://localhost:4004/notifications/date-range?startDate=2024-01-01&endDate=2024-01-31&limit=10"
```

---

## 👤 **User Service Routes (Direct Access)**

### **Base URL**: `http://localhost:4000`

#### **User Management**
```bash
# Create User
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@example.com",
    "password": "password123"
  }'

# Advanced User Search
curl "http://localhost:4000/users/search/advanced?search=Alice&limit=5"

# User Statistics
curl http://localhost:4000/users/stats/overview

# Find Similar Users
curl http://localhost:4000/users/search/similar/Alice

# Users Created Between Dates
curl "http://localhost:4000/users/created/between?startDate=2024-01-01&endDate=2024-03-31"

# Get All Users (Paginated)
curl "http://localhost:4000/users/list/all?page=1&limit=10"

# Users with Notifications (JOIN Query) - NEW!
curl http://localhost:4000/users/with-notifications

# Get User by ID
curl http://localhost:4000/users/1

# Get User by Email
curl http://localhost:4000/users/email/alice.johnson@example.com
```

---

## 📧 **Notification Service Routes (Direct Access)**

### **Base URL**: `http://localhost:4002`

#### **Notification Management**
```bash
# Send Notification
curl -X POST http://localhost:4002/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "type": "welcome",
    "message": "Welcome to our platform!"
  }'

# Get Notification Status
curl http://localhost:4002/notifications/status/notif-123

# Get Notifications by User
curl "http://localhost:4002/notifications/user/1?limit=10"

# Advanced Notification Search
curl "http://localhost:4002/notifications/search/advanced?status=sent&limit=10"

# Notification Statistics
curl http://localhost:4002/notifications/stats/overview

# Get Failed Notifications
curl http://localhost:4002/notifications/failed/list

# Retry Failed Notifications
curl -X POST http://localhost:4002/notifications/retry/failed

# Test Email Connection
curl http://localhost:4002/notifications/test/email

# Get All Notifications (Paginated)
curl "http://localhost:4002/notifications/list/all?page=1&limit=10"

# Get Notifications by Type
curl "http://localhost:4002/notifications/by-type/welcome?limit=5"

# Get Notifications by Date Range
curl "http://localhost:4002/notifications/date-range?startDate=2024-01-01&endDate=2024-01-31&limit=10"
```

---

## 🔗 **New JOIN Query Endpoint**

### **Users with Notifications**
This endpoint performs a LEFT JOIN between users and notifications tables to return:
- User information
- Notification count per user
- Complete list of notifications for each user

**Available on both API Gateway and User Service:**
```bash
# Via API Gateway
curl http://localhost:4004/users/with-notifications

# Via User Service (Direct)
curl http://localhost:4000/users/with-notifications
```

**Response Example:**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "notificationCount": 3,
    "notifications": [
      {
        "id": "notif-1",
        "type": "welcome",
        "message": "Welcome to our platform!",
        "status": "sent",
        "createdAt": "2024-01-15T10:31:00Z"
      },
      {
        "id": "notif-2",
        "type": "reminder",
        "message": "Don't forget to complete your profile",
        "status": "sent",
        "createdAt": "2024-01-16T09:00:00Z"
      },
      {
        "id": "notif-3",
        "type": "update",
        "message": "New features available",
        "status": "pending",
        "createdAt": "2024-01-17T14:20:00Z"
      }
    ]
  }
]
```

---

## 🚀 **Quick Start Examples**

### **1. Create a User and Send Welcome Notification**
```bash
# Step 1: Create user via API Gateway
curl -X POST http://localhost:4004/registration \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Step 2: View users with their notifications
curl http://localhost:4004/users/with-notifications
```

### **2. Advanced User Search**
```bash
# Search for users with "test" in name/email
curl "http://localhost:4004/users/search/advanced?search=test&limit=5"

# Get user statistics
curl http://localhost:4004/users/stats/overview
```

### **3. Notification Management**
```bash
# Send a custom notification
curl -X POST http://localhost:4004/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "type": "custom",
    "message": "This is a custom notification"
  }'

# Get notification statistics
curl http://localhost:4004/notifications/stats/overview
```

### **4. Test JOIN Query Performance**
```bash
# Test the new JOIN query endpoint
curl http://localhost:4004/users/with-notifications

# Compare with individual queries
curl http://localhost:4004/users/list/all
curl http://localhost:4004/notifications/list/all
```

---

## 📊 **Route Categories**

### **CRUD Operations**
- ✅ Create, Read, Update, Delete users
- ✅ Create, Read, Update, Delete notifications
- ✅ Basic entity management

### **Advanced Queries**
- ✅ Search and filtering
- ✅ Statistical aggregations
- ✅ Date range queries
- ✅ Similar name matching

### **JOIN Operations**
- ✅ Users with notification count
- ✅ Users with notification details
- ✅ Cross-table data retrieval

### **Workflow Operations**
- ✅ User registration orchestration
- ✅ Email notification sending
- ✅ Failed notification retry

### **Monitoring & Testing**
- ✅ Service health checks
- ✅ Email connection testing
- ✅ Statistics and analytics

---

## 🔧 **Technical Details**

### **Route Ordering (Fixed)**
Routes are now properly ordered to prevent conflicts:
1. **Specific routes first** (e.g., `/users/with-notifications`)
2. **Parameterized routes last** (e.g., `/users/:id`)

### **Data Types**
- **User ID**: Integer (auto-generated)
- **Notification ID**: UUID (string)
- **User ID in Notifications**: String (matches User ID as text)

### **Error Handling**
- Comprehensive error responses
- Proper HTTP status codes
- Detailed error messages
- Request validation

---

## 📝 **Notes**

- **API Gateway (Port 4004)**: Recommended for external clients - handles orchestration and routing
- **Direct Service Access**: Use ports 4000 (User) and 4002 (Notification) for direct access
- **JOIN Query**: New endpoint `/users/with-notifications` provides efficient user-notification data retrieval
- **All endpoints support proper error handling and validation**
- **Use appropriate Content-Type headers for POST requests**
- **Route ordering has been fixed to prevent parameter conflicts**

---

## 🆕 **Recent Updates**

### **Added Features**
- ✅ **JOIN Query Endpoint**: `/users/with-notifications`
- ✅ **Route Ordering Fix**: Specific routes before parameterized routes
- ✅ **Notification Entity**: Added to User Service for JOIN operations
- ✅ **Enhanced Error Handling**: Better error messages and validation
- ✅ **Type Safety**: Proper TypeScript types throughout

### **Fixed Issues**
- ✅ **Route Mismatch**: Fixed `@Get(':id')` catching specific routes
- ✅ **NaN in JOIN Queries**: Fixed type conversion issues
- ✅ **Database Schema**: Proper entity relationships
- ✅ **Service Communication**: Improved TCP message patterns

---

**Last Updated**: [Current Date]
**Version**: 2.0.0
**Status**: Production Ready