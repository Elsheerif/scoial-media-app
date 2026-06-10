import type { Response } from "express";


function successResponse<T>({ res }: { res: Response }, statusCode: number, message: string, data?: T) {
    return res.status(statusCode).json({
        message,
        result: data
    });
} 



export default successResponse;