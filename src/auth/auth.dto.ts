import { z } from 'zod';
import sighnupschema from './auth.validation.js';



export interface loginDto {
    email: string;
    password: string;
}
export type signupDto = z.infer<typeof sighnupschema.body>;
