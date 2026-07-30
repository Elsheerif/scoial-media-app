import express from 'express';
interface Ierroe extends Error {
    statusCode?: number;
}
function globalerrorhandling(err: Ierroe, req: express.Request, res: express.Response, next: express.NextFunction) {
    const errorResponse: Record<string, unknown> = {
        message: err.message,
        error: err.name,
    };

    if ((err as any).cause?.errors) {
        errorResponse.errors = (err as any).cause.errors;
    }

    res.status(err.statusCode || 500).json(errorResponse);
}

export default globalerrorhandling;