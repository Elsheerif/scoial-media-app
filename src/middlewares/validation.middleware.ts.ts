import { Request, Response, NextFunction } from 'express';
import { badrequestexception } from '../common/exceptions/domain.exceptions.js';
import { z, ZodType} from 'zod';

type keyReqType= keyof Request;

export function validation(validationSchema:Record<keyReqType, ZodType>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: any[] = [];

        for (const key of Object.keys(validationSchema)as keyReqType[]) {
            const validationResult = validationSchema[key].safeParse(
                req[key as keyof Request]
            );

            if (!validationResult.success) {
                validationErrors.push(...validationResult.error.issues);
            }
        }

        if (validationErrors.length > 0) {
            return next(
                new badrequestexception('Validation failed', {
                    errors: validationErrors
                })
            );
        }

        next();
    };
}

export const commonValidationFields = {
         username: z.string(),
        email: z.string().regex(
            /^[^\s@]+@[^\s@]+.[^\s@]+$/,
            "Invalid email format"
        ),
        password: z.string().regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/,
            "Password must contain uppercase, lowercase, number, special character, and be at least 8 characters long"
        ).refine((data) => {
            const hasUpperCase = /[A-Z]/.test(data);
            const hasLowerCase = /[a-z]/.test(data);
            const hasNumber = /\d/.test(data);
            const hasSpecialChar = /[@$!%*?&.#]/.test(data);
            return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        }, "Password must contain uppercase, lowercase, number, and special character"),
        confirmPassword: z.string(),
        age: z.number().positive(),
        gender: z.enum(["male", "female"]),
        phoneNumber: z.string().regex(
            /^\+?[1-9]\d{1,14}$/,
            "Invalid phone number format"
        )
}