import { z } from 'zod';
import { commonValidationFields } from '../middlewares/validation.middleware.js';

export const sighnupschema = {
    body: z.object({
        username: commonValidationFields.username,
        email: commonValidationFields.email,
        password: commonValidationFields.password,
        confirmPassword: commonValidationFields.confirmPassword,
        age: commonValidationFields.age.optional(),
        gender: commonValidationFields.gender.optional(),
        phoneNumber: commonValidationFields.phoneNumber.optional(),
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passwords do not match',
                path: ['confirmPassword'],
            });
        }
    })
}

export const loginschema = {
    body: z.object({
        email: commonValidationFields.email,
        password: commonValidationFields.password,
    })
}


