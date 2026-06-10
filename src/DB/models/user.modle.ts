import { Schema, model, connect } from 'mongoose';
import { HydratedDocument } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IUser {
    username: string;
    email: string;
    password: string;
    provider: 'local' | 'google';
    confirmEmail: boolean;
    profilePicture?: string;
    coverPicture?: string;
    age?: number;
    phoneNumber?: string;
    gender?: string;
    role: string;
}

export type IHUser = HydratedDocument<IUser>; 

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    provider: { type: String, enum: ['local', 'google'], required: true },
    confirmEmail: { type: Boolean, default: false },
    profilePicture: { type: String },
    coverPicture: { type: String },
    age: { type: Number },
    phoneNumber: { type: String },
    gender: { type: String },
    role: { type: String, default: 'user' }

});

// 3. Create a Model.
const User = model<IUser>('User', userSchema);

export default IUser;
export { User };