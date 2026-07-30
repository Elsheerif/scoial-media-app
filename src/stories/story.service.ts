import StoryRepo from '../DB/Repo/story.repo.js';
import { CreateStoryDto, UpdateStoryDto } from './story.dto.js';
import { notfoundexception, unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';

class StoryService {
    private storyRepo = new StoryRepo();

    public async createStory(payload: CreateStoryDto, userId: string) {
        const [story] = await this.storyRepo.create({ data: [{
            user: userId,
            mediaUrl: payload.mediaUrl,
            type: payload.type || 'image',
            caption: payload.caption,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        }] });
        return story;
    }

    public async getActiveStories(limit = 50) {
        return await this.storyRepo.find({ filter: { expiresAt: { $gt: new Date() } }, options: { sort: { createdAt: -1 }, limit: Math.min(Math.max(limit, 1), 100), populate: { path: 'user', select: 'username profilePicture' } } });
    }

    public async getUserStories(userId: string) {
        return await this.storyRepo.find({ filter: { user: userId, expiresAt: { $gt: new Date() } }, options: { sort: { createdAt: -1 }, populate: { path: 'user', select: 'username profilePicture' } } });
    }

    public async updateStory(storyId: string, payload: UpdateStoryDto, requesterId: string, role: string) {
        const story = await this.storyRepo.findById(storyId);
        if (!story) throw new notfoundexception('Story not found');
        if (story.user.toString() !== requesterId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only the owner or admin can update this story');
        }
        const updated = await this.storyRepo.findByIdAndUpdate(storyId, payload);
        if (!updated) throw new notfoundexception('Story not found after update');
        return updated;
    }

    public async deleteStory(storyId: string, requesterId: string, role: string) {
        const story = await this.storyRepo.findById(storyId);
        if (!story) throw new notfoundexception('Story not found');
        if (story.user.toString() !== requesterId && role !== 'ADMIN') {
            throw new unauthorizedrequestexception('Only the owner or admin can delete this story');
        }
        const result = await this.storyRepo.deleteOne({ _id: storyId } as any);
        if (result.deletedCount === 0) throw new notfoundexception('Story not found');
        return true;
    }
}

export default new StoryService();