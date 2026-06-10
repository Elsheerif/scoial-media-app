import express from 'express';
import authService from './auth.service.js';
import successResponse from '../common/responces/success.responds.js';
import { loginDto, signupDto } from './auth.dto.js';
import { z } from 'zod';
import sighnupschema from "./auth.validation.js";

const Router = express.Router();
Router.get('/', (req: express.Request, res: express.Response) => {
    return successResponse({ res }, 200, 'Auth route');
});

Router.post('/signup',async (req: express.Request, res: express.Response) => {


   

    const result = authService.signUp(req.body);

    return successResponse({ res }, 201, 'User created successfully', result);
});

Router.post('/login', (req: express.Request, res: express.Response) => {

    const result = authService.login(req.body);
    return successResponse<loginDto>({ res }, 200, 'User logged in successfully', result);
});

export default Router;