import { Schema, model, Types, HydratedDocument } from 'mongoose';

export interface INotification {
    title: string;
    message: string;
    type: 'info' | 'alert' | 'message';
    createdBy: Types.ObjectId;
    recipients: Types.ObjectId[];
    readBy: Types.ObjectId[];
    payload?: Record<string, unknown>;
    createdAt: Date;
}

export type IHNotification = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['info', 'alert', 'message'], default: 'info' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        payload: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = model<INotification>('Notification', notificationSchema);
