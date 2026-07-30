import Redis from 'ioredis';
import { REDIS_URL } from '../config/config.service.js';

class RedisService {
    private client: any = null;

    connect(): any {
        if (!this.client) {
            const RedisCtor: any = (Redis as unknown) as any;
            this.client = new RedisCtor(REDIS_URL);
        }
        return this.client;
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        const client = this.connect();
        if (ttlSeconds) {
            await client.set(key, value, 'EX', ttlSeconds);
        } else {
            await client.set(key, value);
        }
    }

    async get(key: string) {
        const client = this.connect();
        return await client.get(key);
    }

    async del(key: string) {
        const client = this.connect();
        return await client.del(key);
    }
}

export default new RedisService();