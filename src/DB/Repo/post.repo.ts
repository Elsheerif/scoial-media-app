import { Model } from 'mongoose';
import DBrepo from './db.repo.js';
import { Post, IPost } from '../models/post.model.js';

class PostRepo extends DBrepo<IPost> {
    constructor() {
        super(Post as Model<IPost>);
    }
}

export default PostRepo;
