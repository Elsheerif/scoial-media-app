import { Model } from 'mongoose';
import DBrepo from './db.repo.js';
import { Comment, IComment } from '../models/comment.model.js';

class CommentRepo extends DBrepo<IComment> {
    constructor() {
        super(Comment as Model<IComment>);
    }
}

export default CommentRepo;
