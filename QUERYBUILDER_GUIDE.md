# 🔍 QueryBuilder Guide for NestJS Microservices

## **📊 What is QueryBuilder?**

QueryBuilder is a powerful TypeORM feature that allows you to write complex database queries using a fluent, chainable API. It's perfect for:

- **Complex WHERE conditions**
- **JOINs and relationships**
- **Aggregations and GROUP BY**
- **Raw SQL functions**
- **Dynamic query building**

---

## **🚀 QueryBuilder vs Repository Methods**

### **Repository Methods (Simple):**
```typescript
// Basic queries
const user = await this.usersRepository.findOne({
  where: { email: 'user@example.com' }
});
```

### **QueryBuilder (Advanced):**
```typescript
// Complex queries with conditions, joins, aggregations
const users = await this.usersRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.notifications', 'notification')
  .where('user.createdAt > :date', { date: new Date('2024-01-01') })
  .andWhere('user.status = :status', { status: 'active' })
  .orderBy('user.createdAt', 'DESC')
  .limit(10)
  .getMany();
```

---

## **🛠️ QueryBuilder Methods Available**

### **1. Basic Query Building**
```typescript
const queryBuilder = this.repository
  .createQueryBuilder('alias')  // Create query builder with alias
  .select(['alias.field1', 'alias.field2'])  // Select specific fields
  .where('alias.field = :value', { value: 'test' })  // WHERE condition
  .andWhere('alias.field2 > :number', { number: 10 })  // AND condition
  .orWhere('alias.field3 = :value', { value: 'other' })  // OR condition
  .orderBy('alias.field', 'DESC')  // ORDER BY
  .limit(10)  // LIMIT
  .offset(20)  // OFFSET
  .getMany();  // Execute query
```

### **2. Joins**
```typescript
const users = await this.usersRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.notifications', 'notification')
  .innerJoin('user.profile', 'profile')
  .where('notification.status = :status', { status: 'sent' })
  .getMany();
```

### **3. Aggregations**
```typescript
const stats = await this.usersRepository
  .createQueryBuilder('user')
  .select([
    'COUNT(*) as totalUsers',
    'AVG(user.age) as averageAge',
    'MAX(user.createdAt) as lastUser'
  ])
  .getRawOne();
```

### **4. Group By**
```typescript
const usersByMonth = await this.usersRepository
  .createQueryBuilder('user')
  .select([
    "TO_CHAR(user.createdAt, 'YYYY-MM') as month",
    'COUNT(*) as count'
  ])
  .groupBy("TO_CHAR(user.createdAt, 'YYYY-MM')")
  .orderBy("TO_CHAR(user.createdAt, 'YYYY-MM')", 'ASC')
  .getRawMany();
```

---

## **📋 Examples from Your Services**

### **User Service QueryBuilder Methods:**

#### **1. Advanced User Search**
```typescript
async getUsersWithAdvancedQuery(filters: {
  search?: string;
  createdAfter?: Date;
  limit?: number;
  offset?: number;
}): Promise<UserResponseDto[]> {
  const queryBuilder = this.usersRepository
    .createQueryBuilder('user')
    .select([
      'user.id',
      'user.firstName',
      'user.lastName', 
      'user.email',
      'user.createdAt',
      'user.updatedAt'
    ])
    .where('1=1'); // Base condition

  // Dynamic filters
  if (filters.search) {
    queryBuilder.andWhere(
      '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  if (filters.createdAfter) {
    queryBuilder.andWhere('user.createdAt >= :createdAfter', {
      createdAfter: filters.createdAfter
    });
  }

  // Pagination
  if (filters.limit) queryBuilder.limit(filters.limit);
  if (filters.offset) queryBuilder.offset(filters.offset);

  queryBuilder.orderBy('user.createdAt', 'DESC');
  return await queryBuilder.getMany();
}
```

#### **2. User Statistics**
```typescript
async getUserStats(): Promise<{
  totalUsers: number;
  usersThisMonth: number;
  usersByMonth: Array<{ month: string; count: number }>;
}> {
  // Total users
  const totalUsers = await this.usersRepository
    .createQueryBuilder('user')
    .getCount();

  // Users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usersThisMonth = await this.usersRepository
    .createQueryBuilder('user')
    .where('user.createdAt >= :startOfMonth', { startOfMonth })
    .getCount();

  // Users by month (last 12 months)
  const usersByMonth = await this.usersRepository
    .createQueryBuilder('user')
    .select([
      "TO_CHAR(user.createdAt, 'YYYY-MM') as month",
      'COUNT(*) as count'
    ])
    .where('user.createdAt >= :twelveMonthsAgo', {
      twelveMonthsAgo: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    })
    .groupBy("TO_CHAR(user.createdAt, 'YYYY-MM')")
    .orderBy("TO_CHAR(user.createdAt, 'YYYY-MM')", 'ASC')
    .getRawMany();

  return {
    totalUsers,
    usersThisMonth,
    usersByMonth: usersByMonth.map(row => ({
      month: row.month,
      count: parseInt(row.count)
    }))
  };
}
```

### **Notification Service QueryBuilder Methods:**

#### **1. Advanced Notification Filtering**
```typescript
async getNotificationsWithAdvancedQuery(filters: {
  userId?: string;
  type?: string;
  status?: 'pending' | 'sent' | 'failed';
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}): Promise<NotificationResponseDto[]> {
  const queryBuilder = this.notificationsRepository
    .createQueryBuilder('notification')
    .select([
      'notification.id',
      'notification.userId',
      'notification.type',
      'notification.message',
      'notification.status',
      'notification.createdAt',
      'notification.sentAt'
    ])
    .where('1=1');

  // Dynamic filters
  if (filters.userId) {
    queryBuilder.andWhere('notification.userId = :userId', { userId: filters.userId });
  }
  if (filters.type) {
    queryBuilder.andWhere('notification.type = :type', { type: filters.type });
  }
  if (filters.status) {
    queryBuilder.andWhere('notification.status = :status', { status: filters.status });
  }
  if (filters.dateFrom) {
    queryBuilder.andWhere('notification.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
  }
  if (filters.dateTo) {
    queryBuilder.andWhere('notification.createdAt <= :dateTo', { dateTo: filters.dateTo });
  }

  // Pagination
  if (filters.limit) queryBuilder.limit(filters.limit);
  if (filters.offset) queryBuilder.offset(filters.offset);

  queryBuilder.orderBy('notification.createdAt', 'DESC');
  return await queryBuilder.getMany();
}
```

#### **2. Notification Statistics**
```typescript
async getNotificationStats(): Promise<{
  totalNotifications: number;
  sentNotifications: number;
  failedNotifications: number;
  pendingNotifications: number;
  notificationsByType: Array<{ type: string; count: number }>;
  notificationsByDay: Array<{ day: string; count: number }>;
}> {
  // Total notifications
  const totalNotifications = await this.notificationsRepository
    .createQueryBuilder('notification')
    .getCount();

  // Notifications by status
  const statusStats = await this.notificationsRepository
    .createQueryBuilder('notification')
    .select(['notification.status', 'COUNT(*) as count'])
    .groupBy('notification.status')
    .getRawMany();

  // Notifications by type
  const notificationsByType = await this.notificationsRepository
    .createQueryBuilder('notification')
    .select(['notification.type', 'COUNT(*) as count'])
    .groupBy('notification.type')
    .orderBy('COUNT(*)', 'DESC')
    .getRawMany();

  // Notifications by day (last 30 days)
  const notificationsByDay = await this.notificationsRepository
    .createQueryBuilder('notification')
    .select([
      "TO_CHAR(notification.createdAt, 'YYYY-MM-DD') as day",
      'COUNT(*) as count'
    ])
    .where('notification.createdAt >= :thirtyDaysAgo', {
      thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    })
    .groupBy("TO_CHAR(notification.createdAt, 'YYYY-MM-DD')")
    .orderBy("TO_CHAR(notification.createdAt, 'YYYY-MM-DD')", 'ASC')
    .getRawMany();

  return {
    totalNotifications,
    sentNotifications: parseInt(statusStats.find(s => s.notification_status === 'sent')?.count || '0'),
    failedNotifications: parseInt(statusStats.find(s => s.notification_status === 'failed')?.count || '0'),
    pendingNotifications: parseInt(statusStats.find(s => s.notification_status === 'pending')?.count || '0'),
    notificationsByType: notificationsByType.map(row => ({
      type: row.notification_type,
      count: parseInt(row.count)
    })),
    notificationsByDay: notificationsByDay.map(row => ({
      day: row.day,
      count: parseInt(row.count)
    }))
  };
}
```

---

## **🎯 QueryBuilder Execution Methods**

### **Get Results:**
- **`getMany()`** - Returns array of entities
- **`getOne()`** - Returns single entity or null
- **`getRawMany()`** - Returns raw database results
- **`getRawOne()`** - Returns single raw result
- **`getCount()`** - Returns count of matching records

### **Get SQL:**
- **`getSql()`** - Returns the generated SQL query
- **`getParameters()`** - Returns query parameters

---

## **🔧 Advanced QueryBuilder Features**

### **1. Subqueries**
```typescript
const users = await this.usersRepository
  .createQueryBuilder('user')
  .where('user.id IN ' + 
    this.usersRepository
      .createQueryBuilder('subUser')
      .select('subUser.id')
      .where('subUser.createdAt > :date', { date: new Date() })
      .getQuery()
  )
  .getMany();
```

### **2. Raw SQL Functions**
```typescript
const users = await this.usersRepository
  .createQueryBuilder('user')
  .select([
    'user.*',
    'SIMILARITY(user.firstName, :name) as similarity'
  ])
  .where('SIMILARITY(user.firstName, :name) > 0.3', { name: 'John' })
  .orderBy('similarity', 'DESC')
  .getRawMany();
```

### **3. Conditional Query Building**
```typescript
async buildDynamicQuery(filters: any) {
  const queryBuilder = this.repository.createQueryBuilder('entity');
  
  if (filters.search) {
    queryBuilder.andWhere('entity.name ILIKE :search', { 
      search: `%${filters.search}%` 
    });
  }
  
  if (filters.dateFrom && filters.dateTo) {
    queryBuilder.andWhere('entity.createdAt BETWEEN :dateFrom AND :dateTo', {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    });
  }
  
  if (filters.status) {
    queryBuilder.andWhere('entity.status = :status', { 
      status: filters.status 
    });
  }
  
  return queryBuilder;
}
```

---

## **⚡ Performance Tips**

### **1. Use Indexes**
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

### **2. Select Only Needed Fields**
```typescript
// Good - Select only needed fields
.select(['user.id', 'user.email', 'user.firstName'])

// Bad - Select all fields
.select('user.*')
```

### **3. Use Pagination**
```typescript
// Always use pagination for large datasets
.limit(50)
.offset(page * 50)
```

### **4. Use Parameters (Prevent SQL Injection)**
```typescript
// Good - Use parameters
.where('user.email = :email', { email: userEmail })

// Bad - String concatenation (SQL injection risk)
.where(`user.email = '${userEmail}'`)
```

---

## **🧪 Testing QueryBuilder**

### **1. Unit Testing**
```typescript
describe('UsersService', () => {
  it('should find users with advanced query', async () => {
    const filters = {
      search: 'John',
      createdAfter: new Date('2024-01-01'),
      limit: 10
    };
    
    const result = await usersService.getUsersWithAdvancedQuery(filters);
    expect(result).toBeDefined();
    expect(result.length).toBeLessThanOrEqual(10);
  });
});
```

### **2. SQL Query Testing**
```typescript
// Get the generated SQL for debugging
const queryBuilder = this.repository
  .createQueryBuilder('entity')
  .where('entity.field = :value', { value: 'test' });

console.log('Generated SQL:', queryBuilder.getSql());
console.log('Parameters:', queryBuilder.getParameters());
```

---

## **🎉 Benefits of QueryBuilder**

✅ **Type Safety** - Compile-time checking of field names  
✅ **SQL Injection Protection** - Parameterized queries  
✅ **Dynamic Queries** - Build queries conditionally  
✅ **Complex Joins** - Handle relationships easily  
✅ **Aggregations** - COUNT, SUM, AVG, GROUP BY  
✅ **Raw SQL Support** - Use database-specific functions  
✅ **Performance** - Optimized query generation  
✅ **Maintainability** - Readable, chainable API  

Your microservices now have powerful QueryBuilder capabilities for complex database operations! 🚀
