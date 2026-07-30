import { Request, Response, NextFunction } from 'express';
import TokenService from '../common/security/token.service.js';
import { unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';
import RedisService from '../common/redis.service.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new unauthorizedrequestexception('No token provided');
        const [, token] = authHeader.split(' ');
        if (!token) throw new unauthorizedrequestexception('Invalid token');
        const decoded: any = TokenService.decodeToken({ token });
        if (!decoded || !decoded.sub) throw new unauthorizedrequestexception('Invalid token payload');
        const jti = (decoded as any).jti || (decoded as any).jwtid;
        if (jti) {
            const blacklisted = await RedisService.get(`bl_${jti}`);
            if (blacklisted) throw new unauthorizedrequestexception('Token revoked');
        }
        (req as any).user = { id: decoded.sub, role: decoded.aud && decoded.aud[0] };
        next();
    } catch (err) {
        next(err as Error);
    }
}

export default authMiddleware;