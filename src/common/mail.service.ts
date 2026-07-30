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
        const info = await this.transporter.sendMail({
            from: MAIL_USER,
            to,
            subject,
            html,
        });
        return info;
    }
}

export default new MailService();