import { z } from 'zod';

export const messageSchema = z.object({
    content: z.string().trim().min(1, 'Message content is required').max(5000),
});

export const createGroupSchema = z.object({
    name: z.string().trim().min(1).max(100),
    memberIds: z.array(z.string()).min(1),
});

export const chatJoinSchema = z.object({ chatId: z.string().min(1) });
export const groupJoinSchema = z.object({ groupId: z.string().min(1) });
export const typingSchema = z.object({ isTyping: z.boolean() });
