import { Request, Response, NextFunction } from 'express';
import TokenService from '../common/security/token.service.js';
import { unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticated = await TokenService.authenticateAccessToken(req.headers.authorization);
        (req as any).user = { id: authenticated.userId, role: authenticated.role };
        next();
    } catch (err) {
        next(new unauthorizedrequestexception((err as Error).message));
    }
}

export default authMiddleware;