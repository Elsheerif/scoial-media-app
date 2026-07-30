import express from 'express';
import storyService from './story.service.js';
import successResponse from '../common/responces/success.responds.js';
import { validation } from '../middlewares/validation.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createStorySchema, updateStorySchema } from './story.validation.js';

const Router = express.Router();

Router.post('/', authMiddleware, validation({ body: createStorySchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const story = await storyService.createStory(req.body, currentUser.id);
    return successResponse({ res }, 201, 'Story created successfully', story);
});

Router.get('/', authMiddleware, async (req: express.Request, res: express.Response) => {
    const stories = await storyService.getActiveStories(Number(req.query.limit as string) || 50);
    return successResponse({ res }, 200, 'Stories fetched successfully', stories);
});

Router.get('/user/:userId', authMiddleware, async (req: express.Request, res: express.Response) => {
    const stories = await storyService.getUserStories(req.params.userId as string);
    return successResponse({ res }, 200, 'User stories fetched successfully', stories);
});

Router.patch('/:id', authMiddleware, validation({ body: updateStorySchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const story = await storyService.updateStory(req.params.id as string, req.body, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'Story updated successfully', story);
});

Router.delete('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    await storyService.deleteStory(req.params.id as string, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'Story deleted successfully');
});

export default Router;