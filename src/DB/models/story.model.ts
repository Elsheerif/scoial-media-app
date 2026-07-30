import { Schema, model, Types, HydratedDocument } from 'mongoose';

export interface IStory {
    user: Types.ObjectId;
    mediaUrl: string;
    type: 'image' | 'video';
    caption?: string;
    expiresAt: Date;
    createdAt: Date;
}

export type IHStory = HydratedDocument<IStory>;

const storySchema = new Schema<IStory>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        mediaUrl: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        caption: { type: String },
        expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 1000 * 60 * 60 * 24) },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story = model<IStory>('Story', storySchema);
