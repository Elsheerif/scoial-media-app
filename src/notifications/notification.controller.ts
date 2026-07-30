import express from 'express';
import notificationService from './notification.service.js';
import successResponse from '../common/responces/success.responds.js';
import { validation } from '../middlewares/validation.middleware.js';
import { createNotificationSchema } from './notification.validation.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { updateNotificationSchema } from './notification.validation.js';

const Router = express.Router();

Router.post('/', authMiddleware, adminMiddleware, validation({ body: createNotificationSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'ADMIN') {
        throw new unauthorizedrequestexception('Only admin users can send notifications');
    }
    const notification = await notificationService.createNotification(req.body, currentUser.id);
    return successResponse({ res }, 201, 'Notification created successfully', notification);
});

Router.get('/', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const notifications = await notificationService.getNotificationsForUser(currentUser.id);
    return successResponse({ res }, 200, 'Notifications fetched successfully', notifications);
});

Router.get('/admin/all', authMiddleware, adminMiddleware, async (_req: express.Request, res: express.Response) => {
    const notifications = await notificationService.getAllNotifications();
    return successResponse({ res }, 200, 'Notifications fetched successfully', notifications);
});

Router.patch('/:id', authMiddleware, adminMiddleware, validation({ body: updateNotificationSchema.body }), async (req: express.Request, res: express.Response) => {
    const notification = await notificationService.updateNotification(req.params.id as string, req.body);
    return successResponse({ res }, 200, 'Notification updated successfully', notification);
});

Router.patch('/:id/read', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const notification = await notificationService.markAsRead(req.params.id as string, currentUser.id);
    return successResponse({ res }, 200, 'Notification marked as read', notification);
});

Router.delete('/:id', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'ADMIN') {
        throw new unauthorizedrequestexception('Only admin users can delete notifications');
    }
    await notificationService.deleteNotification(req.params.id as string);
    return successResponse({ res }, 200, 'Notification deleted successfully');
});

export default Router;