import NotificationRepo from '../DB/Repo/notification.repo.js';
import UserRepo from '../DB/Repo/user.repo.js';
import { CreateNotificationDto, UpdateNotificationDto } from './notification.dto.js';
import { INotification, Notification } from '../DB/models/notification.model.js';
import { notfoundexception, unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';
import { FCM_SERVER_KEY } from '../config/config.service.js';

class NotificationService {
    private notificationRepo = new NotificationRepo();
    private userRepo = new UserRepo();

    private async sendFcmMessage(tokens: string[], title: string, body: string, payload?: Record<string, unknown>) {
        if (!FCM_SERVER_KEY || tokens.length === 0) {
            return { skipped: true };
        }

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                Authorization: `key=${FCM_SERVER_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                registration_ids: tokens,
                notification: { title, body },
                data: payload || {},
            }),
        });

        if (!response.ok) throw new Error(`FCM request failed with status ${response.status}`);
        return await response.json();
    }

    public async createNotification(payload: CreateNotificationDto, adminId: string) {
        const recipients = payload.recipientIds || [];
        const recipientIds = recipients.map((id) => id);
        const created = await this.notificationRepo.create({ data: [{
            title: payload.title,
            message: payload.message,
            type: payload.type || 'info',
            createdBy: adminId,
            recipients: recipientIds,
            readBy: [],
            payload: payload.payload,
        }] });

        const [notification] = created;
        if (!notification) {
            throw new Error('Unable to create notification');
        }
        await this.publishNotification(notification, payload.sendPush);
        return notification;
    }

    private async publishNotification(notification: INotification, sendPush = false) {
        let fcmResult: unknown = null;
        if (sendPush) {
            const users = notification.recipients.length > 0
                ? await Promise.all(notification.recipients.map((id) => this.userRepo.findById(id.toString())))
                : await this.userRepo.find();
            const tokens = users
                .filter((user) => user && (user as any).fcmToken)
                .map((user) => (user as any).fcmToken as string);
            fcmResult = await this.sendFcmMessage(tokens, notification.title, notification.message, notification.payload);
        }
        return fcmResult;
    }

    public async getNotificationsForUser(userId: string) {
        return await this.notificationRepo.find({ filter: { $or: [{ recipients: userId }, { recipients: { $size: 0 } }] }, options: { sort: { createdAt: -1 } } });
    }

    public async getAllNotifications() {
        return await this.notificationRepo.find({ options: { sort: { createdAt: -1 } } });
    }

    public async updateNotification(notificationId: string, payload: UpdateNotificationDto) {
        const updated = await this.notificationRepo.findByIdAndUpdate(notificationId, payload);
        if (!updated) throw new notfoundexception('Notification not found');
        return updated;
    }

    public async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationRepo.findById(notificationId);
        if (!notification) throw new notfoundexception('Notification not found');
        if (!notification.recipients.length || notification.recipients.map((id) => id.toString()).includes(userId)) {
            if (!notification.readBy.some((id) => id.toString() === userId)) {
                notification.readBy.push(userId as any);
                await notification.save();
            }
            return notification;
        }
        throw new unauthorizedrequestexception('You are not a recipient of this notification');
    }

    public async deleteNotification(notificationId: string) {
        const result = await this.notificationRepo.deleteOne({ _id: notificationId } as any);
        if (result.deletedCount === 0) throw new notfoundexception('Notification not found');
        return true;
    }
}

export default new NotificationService();