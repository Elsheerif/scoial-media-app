import express from 'express';
import commentService from './comment.service.js';
import successResponse from '../common/responces/success.responds.js';
import { validation } from '../middlewares/validation.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createCommentSchema, updateCommentSchema, reactCommentSchema } from './comment.validation.js';

const Router = express.Router({ mergeParams: true });

Router.post('/posts/:postId/comments', authMiddleware, validation({ body: createCommentSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const comment = await commentService.addComment(req.params.postId as string, req.body, currentUser.id);
    return successResponse({ res }, 201, 'Comment created successfully', comment);
});

Router.get('/posts/:postId/comments', authMiddleware, async (req: express.Request, res: express.Response) => {
    const comments = await commentService.getComments(req.params.postId as string);
    return successResponse({ res }, 200, 'Comments fetched successfully', comments);
});

Router.patch('/comments/:id', authMiddleware, validation({ body: updateCommentSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const updated = await commentService.updateComment(req.params.id as string, req.body, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'Comment updated successfully', updated);
});

Router.delete('/comments/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    await commentService.deleteComment(req.params.id as string, currentUser.id, currentUser.role);
    return successResponse({ res }, 200, 'Comment deleted successfully');
});

Router.post('/comments/:id/reactions', authMiddleware, validation({ body: reactCommentSchema.body }), async (req: express.Request, res: express.Response) => {
    const currentUser = (req as any).user;
    const comment = await commentService.reactToComment(req.params.id as string, currentUser.id, req.body.emoji);
    return successResponse({ res }, 200, 'Comment reaction updated successfully', comment);
});

export default Router;