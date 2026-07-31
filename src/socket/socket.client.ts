import { io, type Socket } from 'socket.io-client';

export function createRealtimeClient(url: string, accessToken: string): Socket {
    return io(url, {
        auth: { token: accessToken },
        transports: ['websocket'],
    });
}
