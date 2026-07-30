import { Model } from 'mongoose';
import DBrepo from './db.repo.js';
import { Story, IStory } from '../models/story.model.js';

class StoryRepo extends DBrepo<IStory> {
    constructor() {
        super(Story as Model<IStory>);
    }
}

export default StoryRepo;
