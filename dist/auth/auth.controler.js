import express from 'express';
import authService from './auth.service.js';
import successResponse from '../common/responces/success.responds.js';
import { sighnupschema, loginschema } from './auth.validation.js';
import { validation } from '../middlewares/validation.middleware.js';
const Router = express.Router();
Router.get('/', (req, res) => {
    return successResponse({ res }, 200, 'Auth route');
});
Router.post('/signup', validation({ body: sighnupschema.body }), async (req, res) => {
    const result = await authService.signUp(req.body);
    return successResponse({ res }, 201, 'User created successfully', result);
});
Router.post('/login', validation({ body: loginschema.body }), async (req, res) => {
    const result = await authService.login(req.body);
    return successResponse({ res }, 200, 'User logged in successfully', result);
});
Router.get('/confirm', async (req, res) => {
    const token = String(req.query.token || '');
    await authService.confirmEmail(token);
    return successResponse({ res }, 200, 'Email confirmed');
});
Router.post('/resend-confirmation', async (req, res) => {
    const { email } = req.body;
    const result = await authService.resendConfirmation(email);
    return successResponse({ res }, 200, 'Confirmation email sent', result);
});
Router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return successResponse({ res }, 200, 'Password reset email sent', result);
});
Router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return successResponse({ res }, 200, 'Password updated');
});
Router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return successResponse({ res }, 200, 'Logged out');
});
Router.post('/social-login', async (req, res) => {
    const { email, username, provider, picture } = req.body;
    const result = await authService.socialLogin({ email, username, provider, picture });
    return successResponse({ res }, 200, 'Social login success', result);
});
export default Router;
