import { Chat } from '../DB/models/chat.model.js';
import { Group } from '../DB/models/group.model.js';
import { Message } from '../DB/models/message.model.js';
import { User } from '../DB/models/user.modle.js';
import { notfoundexception, unauthorizedrequestexception } from '../common/exceptions/domain.exceptions.js';

const participantKey = (firstId: string, secondId: string) => [firstId, secondId].sort().join(':');

class ChatService {
    async getOrCreateChat(userId: string, otherUserId: string) {
        if (userId === otherUserId) throw new unauthorizedrequestexception('You cannot chat with yourself');
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) throw new notfoundexception('User not found');
        const key = participantKey(userId, otherUserId);
        return Chat.findOneAndUpdate(
            { participantKey: key },
            { $setOnInsert: { participants: [userId, otherUserId], participantKey: key } },
            { new: true, upsert: true }
        ).populate('participants', '-password');
    }

    async getUserChats(userId: string) {
        return Chat.find({ participants: userId }).sort({ lastMessageAt: -1, updatedAt: -1 }).populate('participants', '-password');
    }

    async getChatMessages(chatId: string, userId: string) {
        const chat = await Chat.findOne({ _id: chatId, participants: userId });
        if (!chat) throw new unauthorizedrequestexception('You are not a member of this chat');
        return Message.find({ chat: chatId }).sort({ createdAt: 1 }).populate('sender recipient', '-password');
    }

    async sendMessage(chatId: string, senderId: string, content: string) {
        const chat = await Chat.findOne({ _id: chatId, participants: senderId });
        if (!chat) throw new unauthorizedrequestexception('You are not a member of this chat');
        const recipient = chat.participants.find((id) => id.toString() !== senderId);
        if (!recipient) throw new notfoundexception('Chat recipient not found');
        const [message] = await Message.create([{ chat: chatId, sender: senderId, recipient, content }]);
        if (!message) throw new Error('Message could not be created');
        chat.lastMessageAt = new Date();
        await chat.save();
        return Message.findById(message._id).populate('sender recipient', '-password');
    }

    async createGroup(ownerId: string, name: string, memberIds: string[]) {
        const members = [...new Set([ownerId, ...memberIds])];
        const users = await User.countDocuments({ _id: { $in: members } });
        if (users !== members.length) throw new notfoundexception('One or more group members were not found');
        const group = await Group.create({ name, owner: ownerId, members });
        return Group.findById(group._id).populate('owner members', '-password');
    }

    async getUserGroups(userId: string) {
        return Group.find({ members: userId }).sort({ updatedAt: -1 }).populate('owner members', '-password');
    }

    async getGroup(groupId: string, userId: string) {
        const group = await Group.findOne({ _id: groupId, members: userId }).populate('owner members', '-password');
        if (!group) throw new unauthorizedrequestexception('You are not a member of this group');
        return group;
    }

    async getGroupMessages(groupId: string, userId: string) {
        await this.getGroup(groupId, userId);
        return Message.find({ group: groupId }).sort({ createdAt: 1 }).populate('sender', '-password');
    }

    async sendGroupMessage(groupId: string, senderId: string, content: string) {
        const group = await Group.findOne({ _id: groupId, members: senderId });
        if (!group) throw new unauthorizedrequestexception('You are not a member of this group');
        const [message] = await Message.create([{ group: groupId, sender: senderId, content }]);
        if (!message) throw new Error('Message could not be created');
        await Group.updateOne({ _id: groupId }, { $set: { updatedAt: new Date() } });
        return Message.findById(message._id).populate('sender', '-password');
    }
}

export default new ChatService();
