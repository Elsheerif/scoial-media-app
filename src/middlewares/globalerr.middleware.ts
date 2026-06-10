import express from 'express';
interface Ierroe extends Error {
    statusCode?: number;
}
function globalerrorhandling(err: Ierroe, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(err.statusCode || 500).json({
        message: err.message ,stack: err.stack,error: err.name
    });
}

export default globalerrorhandling;