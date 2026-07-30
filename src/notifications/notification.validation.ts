import { z } from 'zod';

export const createNotificationSchema = {
    body: z.object({
        title: z.string().min(1, 'Notification title is required'),
        message: z.string().min(1, 'Notification message is required'),
        type: z.enum(['info', 'alert', 'message']).optional(),
        recipientIds: z.array(z.string()).optional(),
        payload: z.record(z.string(), z.any()).optional(),
        sendPush: z.boolean().optional(),
    }),
};

export const updateNotificationSchema = {
    body: z.object({
        title: z.string().min(1).optional(),
        message: z.string().min(1).optional(),
        type: z.enum(['info', 'alert', 'message']).optional(),
        payload: z.record(z.string(), z.any()).optional(),
    }).refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
};
