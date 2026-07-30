export interface CreateNotificationDto {
    title: string;
    message: string;
    type?: 'info' | 'alert' | 'message';
    recipientIds?: string[];
    payload?: Record<string, unknown>;
    sendPush?: boolean;
}

export interface UpdateNotificationDto {
    title?: string;
    message?: string;
    type?: 'info' | 'alert' | 'message';
    payload?: Record<string, unknown>;
}
