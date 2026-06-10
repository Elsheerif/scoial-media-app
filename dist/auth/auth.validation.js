import { z } from 'zod';
import { commonValidationFields } from '../middlewares/validation.middleware.ts.js';
const sighnupschema = {
    body: z.object({
        username: commonValidationFields.username,
        email: commonValidationFields.email,
        password: commonValidationFields.password,
        confirmPassword: commonValidationFields.confirmPassword,
        age: commonValidationFields.age,
        gender: commonValidationFields.gender,
        phoneNumber: commonValidationFields.phoneNumber
    })
};
export default sighnupschema;
