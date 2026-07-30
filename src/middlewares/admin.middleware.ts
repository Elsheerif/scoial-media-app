import { Request, Response, NextFunction } from 'express';
import { unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';

export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
    const user = (req as Request & { user?: { role?: string } }).user;
    if (user?.role !== 'ADMIN') {
        return next(new unauthorizedrequestexception('Administrator access is required'));
    }
    next();
}

export default adminMiddleware;
