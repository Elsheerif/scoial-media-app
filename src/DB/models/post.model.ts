import { Schema, model, Types, HydratedDocument } from 'mongoose';
import { IHUser } from './user.modle.js';

export interface IPost {
    author: Types.ObjectId | IHUser;
    content: string;
    media?: string[];
    privacy: 'public' | 'friends' | 'private';
    reactions: { user: Types.ObjectId; emoji: string }[];
    createdAt: Date;
    updatedAt: Date;
}

export type IHPost = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
    {
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        media: [{ type: String }],
        privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
        reactions: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                emoji: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

export const Post = model<IPost>('Post', postSchema);
