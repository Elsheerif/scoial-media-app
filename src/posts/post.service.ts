import { Post } from '../DB/models/post.model.js';
import { Comment } from '../DB/models/comment.model.js';
import { User } from '../DB/models/user.modle.js';
import { Notification } from '../DB/models/notification.model.js';
import { Story } from '../DB/models/story.model.js';
import PostRepo from '../DB/Repo/post.repo.js';
import CommentRepo from '../DB/Repo/comment.repo.js';
import { CreatePostDto, UpdatePostDto } from './post.dto.js';
import { notfoundexception, unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';

class PostService {
    private postRepo = new PostRepo();
    private commentRepo = new CommentRepo();

    public async createPost(payload: CreatePostDto, authorId: string) {
        const [created] = await this.postRepo.create({ data: [{ ...payload, author: authorId }] });
        return created;
    }

    public async getPostById(postId: string) {
        const post = await this.postRepo.findById(postId);
        if (!post) throw new notfoundexception('Post not found');
        return post;
    }

    public async getFeed(userId: string, limit = 20) {
        const safeLimit = Math.min(Math.max(limit, 1), 50);
        return await Post.find({
            $or: [
                { privacy: 'public' },
                { author: userId },
            ],
        }).sort({ createdAt: -1 }).limit(safeLimit).populate('author', 'username profilePicture coverPicture');
    }

    public async getProfilePosts(userId: string, limit = 30) {
        const safeLimit = Math.min(Math.max(limit, 1), 50);
        return await Post.find({ author: userId }).sort({ createdAt: -1 }).limit(safeLimit).populate('author', 'username profilePicture coverPicture');
    }

    public async getDashboard() {
        const [usersCount, postsCount, commentsCount, notificationsCount, storiesCount] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Comment.countDocuments(),
            Notification.countDocuments(),
            Story.countDocuments({ expiresAt: { $gt: new Date() } }),
        ]);

        const topPosts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('author', 'username profilePicture');

        return {
            totals: { usersCount, postsCount, commentsCount, notificationsCount, activeStories: storiesCount },
            topPosts,
        };
    }

    public async updatePost(postId: string, payload: UpdatePostDto, requesterId: string, role: string) {
        const post = await this.getPostById(postId);
        if (post.author.toString() !== requesterId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only the author or admin can update this post');
        }
        const updated = await this.postRepo.findByIdAndUpdate(postId, payload as any);
        if (!updated) throw new notfoundexception('Post not found after update');
        return updated;
    }

    public async deletePost(postId: string, requesterId: string, role: string) {
        const post = await this.getPostById(postId);
        if (post.author.toString() !== requesterId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only the author or admin can delete this post');
        }
        await this.commentRepo.deleteMany({ post: postId } as any);
        const result = await this.postRepo.deleteOne({ _id: postId } as any);
        if (result.deletedCount === 0) throw new notfoundexception('Post not found');
        return true;
    }

    public async reactToPost(postId: string, userId: string, emoji: string) {
        const post = await this.getPostById(postId);
        const existingReactionIndex = post.reactions.findIndex((reaction) => reaction.user.toString() === userId);
        if (existingReactionIndex >= 0) {
            const currentReaction = post.reactions[existingReactionIndex];
            if (!currentReaction) throw new Error('Reaction could not be resolved');
            if (currentReaction.emoji === emoji) {
                post.reactions.splice(existingReactionIndex, 1);
            } else {
                currentReaction.emoji = emoji;
            }
        } else {
            post.reactions.push({ user: userId as any, emoji });
        }
        await post.save();
        return post;
    }
}

export default new PostService();