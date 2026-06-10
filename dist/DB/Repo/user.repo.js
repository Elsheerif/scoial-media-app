import DBrepo from "./db.repo.js";
import { User } from "../models/user.modle.js";
class UserRepo extends DBrepo {
    constructor() {
        super(User);
    }
    async checkUserExist(id) {
        return (await this.findOne({ filter: { _id: id } })) !== null;
    }
}
export default UserRepo;
