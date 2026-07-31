import { Schema, model, Types, HydratedDocument } from 'mongoose';

export interface IMessage {
    chat?: Types.ObjectId;
    group?: Types.ObjectId;
    sender: Types.ObjectId;
    recipient?: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type IHMessage = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
    {
        chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
        group: { type: Schema.Types.ObjectId, ref: 'Group' },
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true, trim: true, maxlength: 5000 },
    },
    { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 });
messageSchema.index({ group: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', messageSchema);
