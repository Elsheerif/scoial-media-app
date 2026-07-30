import { z } from 'zod';

export const createStorySchema = {
    body: z.object({
        mediaUrl: z.string().url('Media URL must be a valid URL'),
        type: z.enum(['image', 'video']).optional(),
        caption: z.string().max(280).optional(),
    }),
};

export const updateStorySchema = {
    body: z.object({
        mediaUrl: z.string().url('Media URL must be a valid URL').optional(),
        type: z.enum(['image', 'video']).optional(),
        caption: z.string().max(280).optional(),
    }).refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
};
