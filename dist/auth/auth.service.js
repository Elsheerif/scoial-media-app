import { ConflictException } from "../common/exceptions/domain.exceptions.js";
import UserRepo from "../DB/Repo/user.repo.js";
class AuthService {
    _userRepo = new UserRepo();
    constructor() { }
    async signUp(body) {
        const { email } = body;
        const isEmail = await this._userRepo.findOne({ filter: { email } });
        if (isEmail) {
            throw new ConflictException("email already exist");
        }
        const [user] = await this._userRepo.create({ data: [body] });
        return user;
    }
    login(body) {
        return body;
    }
}
export default new AuthService;
