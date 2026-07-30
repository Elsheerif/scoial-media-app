import nodemailer from 'nodemailer';
import { MAIL_USER, MAIL_PASS } from '../config/config.service.js';

class MailService {
    private transporter: any;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASS,
            },
        });
    }

    async sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
        if (!MAIL_USER || !MAIL_PASS) {
            console.warn('Mail service not configured, skipping send for', to);
            return { accepted: [], rejected: [to], envelope: { to, from: MAIL_USER } };
        }

        try {
            const info = await this.transporter.sendMail({
                from: MAIL_USER,
                to,
                subject,
                html,
            });
            return info;
        } catch (err) {
            console.warn('Mail send failed, continuing for development:', err);
            return { accepted: [], rejected: [to], envelope: { to, from: MAIL_USER } };
        }
    }
}

export default new MailService();