import express from 'express';
import postService from './post.service.js';
import successResponse from '../common/responces/success.responds.js';
import { validation } from '../middlewares/validation.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createPostSchema, updatePostSchema, reactSchema } from './post.validation.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const Router = express.Router();

Router.post('/', authMiddleware, validation({ body: createPostSchema.body }), async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const post = await postService.createPost(req.body, user.id);
    return successResponse({ res }, 201, 'Post created successfully', post);
});

Router.get('/', authMiddleware, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const feed = await postService.getFeed(user.id, Number(req.query.limit as string) || 20);
    return successResponse({ res }, 200, 'Feed fetched successfully', feed);
});

Router.get('/profile/:userId', authMiddleware, async (req: express.Request, res: express.Response) => {
    const posts = await postService.getProfilePosts(req.params.userId as string, Number(req.query.limit) || 30);
    return successResponse({ res }, 200, 'Profile posts fetched successfully', posts);
});

Router.get('/dashboard', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
    const dashboard = await postService.getDashboard();
    return successResponse({ res }, 200, 'Dashboard fetched successfully', dashboard);
});

Router.get('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
    const post = await postService.getPostById(req.params.id as string);
    return successResponse({ res }, 200, 'Post fetched successfully', post);
});

Router.patch('/:id', authMiddleware, validation({ body: updatePostSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const updated = await postService.updatePost(req.params.id as string, req.body, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'Post updated successfully', updated);
});

Router.delete('/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    await postService.deletePost(req.params.id as string, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'Post deleted successfully');
});

Router.post('/:id/reactions', authMiddleware, validation({ body: reactSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const post = await postService.reactToPost(req.params.id as string, currentUser.id, req.body.emoji);
    return successResponse({ res }, 200, 'Reaction updated successfully', post);
});

export default Router;