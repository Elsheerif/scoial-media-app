import { Schema, model } from 'mongoose';
const userSchema = new Schema({
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
const User = model('User', userSchema);
export { User };
