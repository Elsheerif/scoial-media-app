import express from 'express';
import authService from './auth.service.js';
import successResponse from '../common/responces/success.responds.js';
import { loginDto } from './auth.dto.js';
import { sighnupschema, loginschema } from './auth.validation.js';
import { validation } from '../middlewares/validation.middleware.ts.js';

const Router = express.Router();

Router.get('/', (req: express.Request, res: express.Response) => {
    return successResponse({ res }, 200, 'Auth route');
});

Router.post('/signup', validation({ body: sighnupschema.body }), async (req: express.Request, res: express.Response) => {
    const result = await authService.signUp(req.body);
    return successResponse({ res }, 201, 'User created successfully', result);
});

Router.post('/login', validation({ body: loginschema.body }), async (req: express.Request, res: express.Response) => {
    const result = await authService.login(req.body);
    return successResponse<loginDto>({ res }, 200, 'User logged in successfully', result);
});

Router.get('/confirm', async (req: express.Request, res: express.Response) => {
    const token = String(req.query.token || '');
    await authService.confirmEmail(token);
    return successResponse({ res }, 200, 'Email confirmed');
});

Router.post('/resend-confirmation', async (req: express.Request, res: express.Response) => {
    const { email } = req.body;
    await authService.resendConfirmation(email);
    return successResponse({ res }, 200, 'Confirmation email sent');
});

Router.post('/forgot-password', async (req: express.Request, res: express.Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return successResponse({ res }, 200, 'Password reset email sent');
});

Router.post('/reset-password', async (req: express.Request, res: express.Response) => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return successResponse({ res }, 200, 'Password updated');
});

Router.post('/logout', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return successResponse({ res }, 200, 'Logged out');
});

Router.post('/social-login', async (req: express.Request, res: express.Response) => {
    const { email, username, provider, picture } = req.body;
    const result = await authService.socialLogin({ email, username, provider, picture });
    return successResponse({ res }, 200, 'Social login success', result);
});

export default Router;