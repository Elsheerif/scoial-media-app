import { z } from 'zod';

export const updateUserSchema = {
    body: z.object({
        username: z.string().optional(),
        email: z.string().email().optional(),
        age: z.number().positive().optional(),
        gender: z.enum(['male', 'female']).optional(),
        phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
        profilePicture: z.string().url().optional(),
        coverPicture: z.string().url().optional(),
    }),
};

export const updateFcmTokenSchema = {
    body: z.object({
        fcmToken: z.string().min(1).max(4096),
    }),
};
