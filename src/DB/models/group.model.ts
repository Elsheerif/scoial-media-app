import { Schema, model, Types, HydratedDocument } from 'mongoose';

export interface IGroup {
    name: string;
    owner: Types.ObjectId;
    members: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export type IHGroup = HydratedDocument<IGroup>;

const groupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true, trim: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    },
    { timestamps: true }
);

export const Group = model<IGroup>('Group', groupSchema);
