import { Model } from 'mongoose';
import DBrepo from './db.repo.js';
import { Notification, INotification } from '../models/notification.model.js';

class NotificationRepo extends DBrepo<INotification> {
    constructor() {
        super(Notification as Model<INotification>);
    }
}

export default NotificationRepo;
