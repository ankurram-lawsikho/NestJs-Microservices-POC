export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export declare class UserResponseDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class NotificationRequestDto {
    userId: string;
    type: string;
    message: string;
}
export declare class NotificationResponseDto {
    id: string;
    userId: string;
    type: string;
    message: string;
    status: 'sent' | 'failed';
    timestamp: Date;
}
