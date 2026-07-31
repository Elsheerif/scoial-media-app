import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import successResponse from '../common/responces/success.responds.js';
import chatService from './chat.service.js';
import { createGroupSchema, messageSchema } from './chat.validation.js';

const router = express.Router();

router.post('/:userId', authMiddleware, async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 201, 'Chat created successfully', await chatService.getOrCreateChat(user.id, req.params.userId as string));
});

router.get('/', authMiddleware, async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 200, 'Chats fetched successfully', await chatService.getUserChats(user.id));
});

router.get('/:chatId/messages', authMiddleware, async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 200, 'Chat messages fetched successfully', await chatService.getChatMessages(req.params.chatId as string, user.id));
});

router.post('/:chatId/messages', authMiddleware, validation({ body: messageSchema }), async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 201, 'Message sent successfully', await chatService.sendMessage(req.params.chatId as string, user.id, req.body.content));
});

export default router;
