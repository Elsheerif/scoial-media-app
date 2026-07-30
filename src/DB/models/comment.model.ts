import { Schema, model, Types, HydratedDocument } from 'mongoose';

export interface IComment {
    post: Types.ObjectId;
    author: Types.ObjectId;
    text: string;
    parentComment?: Types.ObjectId;
    reactions: { user: Types.ObjectId; emoji: string }[];
    createdAt: Date;
    updatedAt: Date;
}

export type IHComment = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment>(
    {
        post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
        reactions: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                emoji: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

export const Comment = model<IComment>('Comment', commentSchema);
