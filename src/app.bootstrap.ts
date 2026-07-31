import express from 'express';
import authRouter from './auth/auth.controler.js';
import userRouter from './users/user.controller.js';
import postRouter from './posts/post.controller.js';
import commentRouter from './comments/comment.controller.js';
import notificationRouter from './notifications/notification.controller.js';
import storyRouter from './stories/story.controller.js';
import globalerrorhandling from './middlewares/globalerr.middleware.js';
import { SERVER_PORT } from './config/config.service.js';
import testDBConnection from './DB/connection.js';
import { expressMiddleware } from '@as-integrations/express5';
import { graphqlServer, graphqlContextFromToken } from './graphql/schema.js';
import { createServer } from 'node:http';
import chatRouter from './chat/chat.controller.js';
import groupRouter from './chat/group.controller.js';
import { createSocketServer } from './socket/socket.server.js';


async function bootstrap() {



    const app = express();
    app.disable('x-powered-by');
    app.set('trust proxy', 1);

    const port = SERVER_PORT

    app.use(express.json());

    testDBConnection().catch((error: unknown) => {
        console.error('Unable to connect to MongoDB:', error);
        process.exitCode = 1;
    });

    app.all('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).json({
            message: 'landing page'
        });
    });
    app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
    await graphqlServer.start();
    app.use('/graphql', expressMiddleware(graphqlServer, {
        context: async ({ req }) => graphqlContextFromToken(req.headers.authorization),
    }));
    app.use('/auth', authRouter);
    app.use('/chats', chatRouter);
    app.use('/groups', groupRouter);
    app.use('/users', userRouter);
    app.use('/posts', postRouter);
    app.use('/', commentRouter);
    app.use('/notifications', notificationRouter);
    app.use('/stories', storyRouter);

    app.use(globalerrorhandling);

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(400).json({
            error: err.message || 'Something went wrong'
        });
    });

    const httpServer = createServer(app);
    createSocketServer(httpServer);
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });


}

export default bootstrap;