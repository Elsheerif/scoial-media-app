import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import successResponse from '../common/responces/success.responds.js';
import chatService from './chat.service.js';
import { createGroupSchema, messageSchema } from './chat.validation.js';

const router = express.Router();

router.post('/', authMiddleware, validation({ body: createGroupSchema }), async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 201, 'Group created successfully', await chatService.createGroup(user.id, req.body.name, req.body.memberIds));
});

router.get('/', authMiddleware, async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 200, 'Groups fetched successfully', await chatService.getUserGroups(user.id));
});

router.get('/:groupId/messages', authMiddleware, async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 200, 'Group messages fetched successfully', await chatService.getGroupMessages(req.params.groupId as string, user.id));
});

router.post('/:groupId/messages', authMiddleware, validation({ body: messageSchema }), async (req, res) => {
    const user = (req as any).user;
    return successResponse({ res }, 201, 'Group message sent successfully', await chatService.sendGroupMessage(req.params.groupId as string, user.id, req.body.content));
});

export default router;
