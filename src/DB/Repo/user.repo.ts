import { CreateOptions, Model } from "mongoose";
import DBrepo from "./db.repo.js";
import IUser from "../models/user.modle.js";
import { ObjectId } from "mongodb";
import { User } from "../models/user.modle.js";


class UserRepo extends DBrepo<IUser> {
    constructor() {
        super(User);
    }
    async checkUserExist(id: ObjectId): Promise<boolean> {

        return (await this.findOne({ filter: { _id: id } })) !== null;








    }


}
export default UserRepo;