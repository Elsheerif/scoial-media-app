import { z } from 'zod';

export const createPostSchema = {
    body: z.object({
        content: z.string().min(1, 'Post content cannot be empty'),
        media: z.array(z.string().url()).optional(),
        privacy: z.enum(['public', 'friends', 'private']).optional(),
    }),
};

export const updatePostSchema = {
    body: z.object({
        content: z.string().min(1, 'Post content cannot be empty').optional(),
        media: z.array(z.string().url()).optional(),
        privacy: z.enum(['public', 'friends', 'private']).optional(),
    }),
};

export const reactSchema = {
    body: z.object({
        emoji: z.string().min(1, 'Emoji is required'),
    }),
};
