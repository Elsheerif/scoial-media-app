import express from 'express';
import userService from './user.service.js';
import successResponse from '../common/responces/success.responds.js';
import { validation } from '../middlewares/validation.middleware.js';
import { updateFcmTokenSchema, updateUserSchema } from './user.validation.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const Router = express.Router();

Router.get('/', authMiddleware, async (req: express.Request, res: express.Response) => {
    const users = await userService.getAllUsers();
    return successResponse({ res }, 200, 'Users fetched successfully', users);
});

Router.get('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
    const user = await userService.getUserById(req.params.id as string);
    return successResponse({ res }, 200, 'User fetched successfully', user);
});

Router.get('/me/profile', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const user = await userService.getUserById(currentUser.id);
    return successResponse({ res }, 200, 'Profile fetched successfully', user);
});

Router.patch('/:id', authMiddleware, validation({ body: updateUserSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const updatedUser = await userService.updateUser(req.params.id as string, req.body, currentUser.id);
    return successResponse({ res }, 200, 'User updated successfully', updatedUser);
});

Router.patch('/me/fcm-token', authMiddleware, validation({ body: updateFcmTokenSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const user = await userService.updateFcmToken(currentUser.id, req.body);
    return successResponse({ res }, 200, 'FCM token updated successfully', user);
});

Router.delete('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    await userService.deleteUser(req.params.id as string, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'User removed successfully');
});

export default Router;