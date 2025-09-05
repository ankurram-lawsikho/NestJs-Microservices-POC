export interface UserCreatedEvent {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  timestamp: Date;
}

export interface NotificationSentEvent {
  notificationId: string;
  userId: string;
  type: string;
  status: 'sent' | 'failed';
  timestamp: Date;
}

export interface UserRegistrationSummary {
  user: {
    id: number;
    email: string;
    name: string;
  };
  notification: {
    id: string;
    status: string;
  };
  totalTime: number;
}
