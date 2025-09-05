// Message Patterns for Request-Response communication
export const MESSAGE_PATTERNS = {
  // User Service patterns
  CREATE_USER: 'user.create',
  GET_USER: 'user.get',
  GET_USER_BY_EMAIL: 'user.getByEmail',
  GET_USERS_WITH_ADVANCED_QUERY: 'user.getWithAdvancedQuery',
  GET_USER_STATS: 'user.getStats',
  FIND_USERS_WITH_SIMILAR_NAMES: 'user.findSimilarNames',
  GET_USERS_CREATED_BETWEEN: 'user.getCreatedBetween',
  GET_USERS_WITH_NOTIFICATIONS: 'user.getWithNotifications',
  
  // Notification Service patterns
  SEND_NOTIFICATION: 'notification.send',
  GET_NOTIFICATION_STATUS: 'notification.status',
  GET_NOTIFICATIONS_BY_USER: 'notification.getByUser',
  GET_NOTIFICATIONS_WITH_ADVANCED_QUERY: 'notification.getWithAdvancedQuery',
  GET_NOTIFICATION_STATS: 'notification.getStats',
  GET_FAILED_NOTIFICATIONS: 'notification.getFailed',
  RETRY_FAILED_NOTIFICATIONS: 'notification.retryFailed',
  TEST_EMAIL: 'notification.testEmail',
  
  // Cross-service patterns
  GET_REGISTRATION_SUMMARY: 'registration.summary',
} as const;

// Event Patterns for Event-Driven communication
export const EVENT_PATTERNS = {
  USER_CREATED: 'user.created',
  NOTIFICATION_SENT: 'notification.sent',
  USER_REGISTRATION_COMPLETED: 'user.registration.completed',
} as const;
