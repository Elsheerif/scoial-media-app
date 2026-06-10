import type { loginDto, signupDto } from "./auth.dto.js";
import { ConflictException } from "../common/exceptions/domain.exceptions.js";
import UserRepo from "../DB/Repo/user.repo.js";
import { IHUser } from "../DB/models/user.modle.js";
class AuthService {
    private _userRepo = new UserRepo();

    constructor() { }
    public async signUp(body: signupDto): Promise<IHUser> {

        const { email } = body;
        const isEmail = await this._userRepo.findOne({ filter: { email } });
        if (isEmail) {
            throw new ConflictException("email already exist");
        }
        const [user] = await this._userRepo.create({ data: [body] });








        return user!;
    }


    public login(body: loginDto): loginDto {
        return body;

    }
}

export default new AuthService;