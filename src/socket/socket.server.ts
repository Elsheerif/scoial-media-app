import type { Server as HttpServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import TokenService from '../common/security/token.service.js';
import chatService from '../chat/chat.service.js';
import { chatJoinSchema, groupJoinSchema, messageSchema, typingSchema } from '../chat/chat.validation.js';

const errorPayload = (error: unknown) => ({
    message: error instanceof Error ? error.message : 'Socket request failed',
});

export function createSocketServer(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: { origin: true, credentials: true },
    });

    io.use(async (socket, next) => {
        try {
            const authToken = typeof socket.handshake.auth?.token === 'string'
                ? socket.handshake.auth.token
                : socket.handshake.headers.authorization;
            const authenticated = await TokenService.authenticateAccessToken(authToken);
            socket.data.userId = authenticated.userId;
            socket.data.role = authenticated.role;
            next();
        } catch (error) {
            next(new Error(error instanceof Error ? error.message : 'Authentication failed'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId as string;
        socket.join(`user:${userId}`);

        socket.on('chat:join', async (payload: unknown, acknowledge?: (response: unknown) => void) => {
            try {
                const { chatId } = chatJoinSchema.parse(payload);
                await chatService.getChatMessages(chatId, userId);
                socket.join(`chat:${chatId}`);
                acknowledge?.({ ok: true, room: `chat:${chatId}` });
            } catch (error) {
                acknowledge?.({ ok: false, error: errorPayload(error) });
            }
        });

        socket.on('chat:send', async (payload: unknown, acknowledge?: (response: unknown) => void) => {
            try {
                const { chatId, content } = chatJoinSchema.extend({ content: messageSchema.shape.content }).parse(payload);
                const message = await chatService.sendMessage(chatId, userId, content);
                io.to(`chat:${chatId}`).emit('message:new', message);
                const recipient = (message as any)?.recipient;
                if (recipient) io.to(`user:${recipient._id?.toString() ?? recipient.toString()}`).emit('notification:new_message', message);
                acknowledge?.({ ok: true, message });
            } catch (error) {
                acknowledge?.({ ok: false, error: errorPayload(error) });
            }
        });

        socket.on('group:join', async (payload: unknown, acknowledge?: (response: unknown) => void) => {
            try {
                const { groupId } = groupJoinSchema.parse(payload);
                await chatService.getGroup(groupId, userId);
                socket.join(`group:${groupId}`);
                acknowledge?.({ ok: true, room: `group:${groupId}` });
            } catch (error) {
                acknowledge?.({ ok: false, error: errorPayload(error) });
            }
        });

        socket.on('group:send', async (payload: unknown, acknowledge?: (response: unknown) => void) => {
            try {
                const { groupId, content } = groupJoinSchema.extend({ content: messageSchema.shape.content }).parse(payload);
                const message = await chatService.sendGroupMessage(groupId, userId, content);
                io.to(`group:${groupId}`).emit('group_message:new', message);
                const group = await chatService.getGroup(groupId, userId);
                for (const member of group.members as any[]) {
                    if (member._id.toString() !== userId) io.to(`user:${member._id.toString()}`).emit('notification:new_group_message', message);
                }
                acknowledge?.({ ok: true, message });
            } catch (error) {
                acknowledge?.({ ok: false, error: errorPayload(error) });
            }
        });

        socket.on('chat:typing', (payload: unknown) => {
            const { chatId, isTyping } = chatJoinSchema.extend(typingSchema.shape).parse(payload);
            socket.to(`chat:${chatId}`).emit('chat:typing', { userId, isTyping });
        });

        socket.on('group:typing', (payload: unknown) => {
            const { groupId, isTyping } = groupJoinSchema.extend(typingSchema.shape).parse(payload);
            socket.to(`group:${groupId}`).emit('group:typing', { userId, isTyping });
        });
    });

    return io;
}
