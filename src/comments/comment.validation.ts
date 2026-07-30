import { z } from 'zod';

export const createCommentSchema = {
    body: z.object({
        text: z.string().min(1, 'Comment text cannot be empty'),
        parentComment: z.string().optional(),
    }),
};

export const updateCommentSchema = {
    body: z.object({
        text: z.string().min(1, 'Comment text cannot be empty').optional(),
    }),
};

export const reactCommentSchema = {
    body: z.object({
        emoji: z.string().min(1, 'Emoji is required'),
    }),
};
