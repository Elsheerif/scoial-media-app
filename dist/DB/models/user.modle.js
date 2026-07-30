import { Schema, model } from 'mongoose';
import { RoleEnum } from "../../common/enums/user.enums.js";
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
    role: { type: String, enum: Object.values(RoleEnum), default: RoleEnum.USER }
});
const User = model('User', userSchema);
export { User };
