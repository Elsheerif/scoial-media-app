import UserRepo from '../DB/Repo/user.repo.js';
import { UpdateFcmTokenDto, UpdateUserDto } from './user.dto.js';
import { badrequestexception, notfoundexception, unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';
import { encryptValue } from '../common/security/encrypt.js';
import { User } from '../DB/models/user.modle.js';

class UserService {
    private userRepo = new UserRepo();

    public async getAllUsers() {
        return await User.find().select('-password');
    }

    public async getUserById(id: string) {
        const user = await this.userRepo.findById(id, '-password');
        if (!user) throw new notfoundexception('User not found');
        return user;
    }

    public async updateUser(id: string, payload: UpdateUserDto, currentUserId: string) {
        if (id !== currentUserId) throw new unauthorizedrequestexception('You may only update your own profile');
        const updatePayload: any = { ...payload };
        if (payload.phoneNumber) updatePayload.phoneNumber = encryptValue({ value: payload.phoneNumber });
        if (payload.email) {
            const existing = await this.userRepo.findOne({ filter: { email: payload.email } });
            if (existing && existing._id.toString() !== id) throw new badrequestexception('Email already exists');
        }
        const updated = await this.userRepo.findByIdAndUpdate(id, updatePayload);
        if (!updated) throw new notfoundexception('User not found');
        return updated;
    }

    public async updateFcmToken(id: string, payload: UpdateFcmTokenDto) {
        const updated = await this.userRepo.findByIdAndUpdate(id, { fcmToken: payload.fcmToken });
        if (!updated) throw new notfoundexception('User not found');
        return updated;
    }

    public async deleteUser(id: string, currentUserId: string, role: string) {
        if (id !== currentUserId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only admin can remove other users');
        }

        const result = await this.userRepo.deleteOne({ _id: id } as any);
        if (result.deletedCount === 0) throw new notfoundexception('User not found');
        return true;
    }
}

export default new UserService();