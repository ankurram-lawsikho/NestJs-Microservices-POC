// Message Patterns for Request-Response communication
export const MESSAGE_PATTERNS = {
  // User Service patterns
  CREATE_USER: 'user.create',
  GET_USER: 'user.get',
  
  // Notification Service patterns
  SEND_NOTIFICATION: 'notification.send',
  GET_NOTIFICATION_STATUS: 'notification.status',
  
  // Cross-service patterns
  GET_REGISTRATION_SUMMARY: 'registration.summary',
} as const;

// Event Patterns for Event-Driven communication
export const EVENT_PATTERNS = {
  USER_CREATED: 'user.created',
  NOTIFICATION_SENT: 'notification.sent',
  USER_REGISTRATION_COMPLETED: 'user.registration.completed',
} as const;
