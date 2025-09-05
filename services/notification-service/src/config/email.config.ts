import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'ankurram2002@gmail.com',
    pass: process.env.EMAIL_PASS || 'jdrl klci heby zkkp',
  },
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'ankurram2002@gmail.com',
  templates: {
    welcome: {
      subject: 'Welcome to Our Platform!',
      template: 'welcome',
    },
    notification: {
      subject: 'New Notification',
      template: 'notification',
    },
  },
}));
