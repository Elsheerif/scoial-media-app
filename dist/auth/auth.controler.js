import express from 'express';
import authService from './auth.service.js';
import successResponse from '../common/responces/success.responds.js';
const Router = express.Router();
Router.get('/', (req, res) => {
    return successResponse({ res }, 200, 'Auth route');
});
Router.post('/signup', async (req, res) => {
    const result = authService.signUp(req.body);
    return successResponse({ res }, 201, 'User created successfully', result);
});
Router.post('/login', (req, res) => {
    const result = authService.login(req.body);
    return successResponse({ res }, 200, 'User logged in successfully', result);
});
export default Router;
