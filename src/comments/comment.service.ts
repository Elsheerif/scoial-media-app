import CommentRepo from '../DB/Repo/comment.repo.js';
import PostRepo from '../DB/Repo/post.repo.js';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto.js';
import { notfoundexception, unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';

class CommentService {
    private commentRepo = new CommentRepo();
    private postRepo = new PostRepo();

    public async addComment(postId: string, payload: CreateCommentDto, authorId: string) {
        const post = await this.postRepo.findById(postId);
        if (!post) throw new notfoundexception('Post not found');
        const [created] = await this.commentRepo.create({ data: [{ post: postId, author: authorId, ...payload }] });
        return created;
    }

    public async getComments(postId: string) {
        const post = await this.postRepo.findById(postId);
        if (!post) throw new notfoundexception('Post not found');
        return await this.commentRepo.find({ filter: { post: postId }, options: { sort: { createdAt: 1 } } });
    }

    public async updateComment(commentId: string, payload: UpdateCommentDto, requesterId: string, role: string) {
        const comment = await this.commentRepo.findById(commentId);
        if (!comment) throw new notfoundexception('Comment not found');
        if (comment.author.toString() !== requesterId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only the author or admin can update this comment');
        }
        const updated = await this.commentRepo.findByIdAndUpdate(commentId, payload as any);
        if (!updated) throw new notfoundexception('Comment not found after update');
        return updated;
    }

    public async deleteComment(commentId: string, requesterId: string, role: string) {
        const comment = await this.commentRepo.findById(commentId);
        if (!comment) throw new notfoundexception('Comment not found');
        if (comment.author.toString() !== requesterId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only the author or admin can delete this comment');
        }
        const result = await this.commentRepo.deleteOne({ _id: commentId } as any);
        if (result.deletedCount === 0) throw new notfoundexception('Comment not found');
        return true;
    }

    public async reactToComment(commentId: string, userId: string, emoji: string) {
        const comment = await this.commentRepo.findById(commentId);
        if (!comment) throw new notfoundexception('Comment not found');
        const existingReactionIndex = comment.reactions.findIndex((reaction) => reaction.user.toString() === userId);
        if (existingReactionIndex >= 0) {
            const currentReaction = comment.reactions[existingReactionIndex];
            if (!currentReaction) throw new Error('Reaction could not be resolved');
            if (currentReaction.emoji === emoji) {
                comment.reactions.splice(existingReactionIndex, 1);
            } else {
                currentReaction.emoji = emoji;
            }
        } else {
            comment.reactions.push({ user: userId as any, emoji });
        }
        await comment.save();
        return comment;
    }
}

export default new CommentService();