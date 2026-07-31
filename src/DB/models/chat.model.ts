import { Schema, model, Types, HydratedDocument } from 'mongoose';

export interface IChat {
    participants: Types.ObjectId[];
    participantKey: string;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type IHChat = HydratedDocument<IChat>;

const chatSchema = new Schema<IChat>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        participantKey: { type: String, required: true, unique: true, index: true },
        lastMessageAt: { type: Date },
    },
    { timestamps: true }
);

export const Chat = model<IChat>('Chat', chatSchema);
