import { ApolloServer } from '@apollo/server';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import { Post } from '../DB/models/post.model.js';
import { Comment } from '../DB/models/comment.model.js';
import { User } from '../DB/models/user.modle.js';
import { Story } from '../DB/models/story.model.js';
import authService from '../auth/auth.service.js';
import userService from '../users/user.service.js';
import postService from '../posts/post.service.js';
import commentService from '../comments/comment.service.js';
import storyService from '../stories/story.service.js';
import notificationService from '../notifications/notification.service.js';
import TokenService from '../common/security/token.service.js';
import { RoleEnum } from '../common/enums/user.enums.js';
import { z } from 'zod';
import { sighnupschema, loginschema } from '../auth/auth.validation.js';
import { createPostSchema, updatePostSchema } from '../posts/post.validation.js';
import { createCommentSchema, updateCommentSchema } from '../comments/comment.validation.js';
import { createStorySchema, updateStorySchema } from '../stories/story.validation.js';
import { createNotificationSchema, updateNotificationSchema } from '../notifications/notification.validation.js';
import { updateFcmTokenSchema, updateUserSchema } from '../users/user.validation.js';
import type { CreateCommentDto, UpdateCommentDto } from '../comments/comment.dto.js';
import type { CreatePostDto, UpdatePostDto } from '../posts/post.dto.js';
import type { CreateStoryDto, UpdateStoryDto } from '../stories/story.dto.js';
import type { CreateNotificationDto, UpdateNotificationDto } from '../notifications/notification.dto.js';
import type { UpdateUserDto } from '../users/user.dto.js';
import chatService from '../chat/chat.service.js';
import { createGroupSchema, messageSchema } from '../chat/chat.validation.js';

export type GraphQLContext = { userId?: string; role?: string };

const typeDefs = `#graphql
  scalar JSON
  type User { id: ID!, username: String!, email: String!, name: String, profilePicture: String, coverPicture: String, age: Int, gender: String, provider: String!, confirmEmail: Boolean!, role: String! }
  type Reaction { user: User!, emoji: String! }
  type Post { id: ID!, content: String!, media: [String!]!, privacy: String!, author: User!, reactions: [Reaction!]!, reactionCount: Int!, comments: [Comment!]!, createdAt: String!, updatedAt: String! }
  type Comment { id: ID!, postId: ID!, text: String!, author: User!, parentCommentId: ID, replies: [Comment!]!, reactions: [Reaction!]!, reactionCount: Int!, createdAt: String!, updatedAt: String! }
  type Story { id: ID!, user: User!, mediaUrl: String!, type: String!, caption: String, expiresAt: String!, createdAt: String! }
  type Notification { id: ID!, title: String!, message: String!, type: String!, createdBy: User!, recipients: [User!]!, readBy: [User!]!, payload: JSON, createdAt: String! }
  type Chat { id: ID!, participants: [User!]!, lastMessageAt: String }
  type Group { id: ID!, name: String!, owner: User!, members: [User!]!, createdAt: String! }
  type Message { id: ID!, chatId: ID, groupId: ID, sender: User!, recipient: User, content: String!, createdAt: String! }
  type AuthPayload { accessToken: String!, refreshToken: String!, user: User! }
  type ConfirmationPayload { confirmToken: String! }
  type PasswordResetPayload { resetToken: String! }
  type ResendConfirmationPayload { resendToken: String! }
  type DashboardTotals { usersCount: Int!, postsCount: Int!, commentsCount: Int!, notificationsCount: Int!, activeStories: Int! }
  type Dashboard { totals: DashboardTotals!, topPosts: [Post!]! }
  type Query {
    me: User
    users: [User!]!
    userProfile(id: ID): User!
    post(id: ID!): Post
    posts(search: String): [Post!]!
    feed(limit: Int): [Post!]!
    profilePosts(userId: ID!, limit: Int): [Post!]!
    findPosts(keyword: String!): [Post!]!
    dashboard: Dashboard!
    comment(id: ID!): Comment
    comments(postId: ID!): [Comment!]!
    commentReplies(commentId: ID!): [Comment!]!
    activeStories(limit: Int): [Story!]!
    userStories(userId: ID!): [Story!]!
    notifications: [Notification!]!
    allNotifications: [Notification!]!
    chats: [Chat!]!
    chatMessages(chatId: ID!): [Message!]!
    groups: [Group!]!
    groupMessages(groupId: ID!): [Message!]!
  }
  type Mutation {
    signup(username: String!, email: String!, password: String!, confirmPassword: String!, age: Int, gender: String, phoneNumber: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    confirmEmail(token: String!): User!
    resendConfirmation(email: String!): ResendConfirmationPayload!
    forgotPassword(email: String!): PasswordResetPayload!
    resetPassword(token: String!, newPassword: String!): Boolean!
    logout(refreshToken: String!): Boolean!
    socialLogin(email: String!, username: String, provider: String!, picture: String): AuthPayload!
    updateUser(id: ID!, username: String, email: String, age: Int, gender: String, phoneNumber: String, profilePicture: String, coverPicture: String): User!
    updateFcmToken(fcmToken: String!): User!
    deleteUser(id: ID!): Boolean!
    createPost(content: String!, media: [String!], privacy: String): Post!
    updatePost(id: ID!, content: String, media: [String!], privacy: String): Post!
    deletePost(id: ID!): Boolean!
    reactPost(postId: ID!, emoji: String!): Post!
    createComment(postId: ID!, text: String!, parentCommentId: ID): Comment!
    updateComment(id: ID!, text: String): Comment!
    deleteComment(id: ID!): Boolean!
    reactComment(commentId: ID!, emoji: String!): Comment!
    replyToComment(commentId: ID!, text: String!): Comment!
    createStory(mediaUrl: String!, type: String, caption: String): Story!
    updateStory(id: ID!, mediaUrl: String, type: String, caption: String): Story!
    deleteStory(id: ID!): Boolean!
    createNotification(title: String!, message: String!, type: String, recipientIds: [ID!], payload: JSON, sendPush: Boolean): Notification!
    updateNotification(id: ID!, title: String, message: String, type: String, payload: JSON): Notification!
    markNotificationAsRead(id: ID!): Notification!
    deleteNotification(id: ID!): Boolean!
    createChat(userId: ID!): Chat!
    sendMessage(chatId: ID!, content: String!): Message!
    createGroup(name: String!, memberIds: [ID!]!): Group!
    sendGroupMessage(groupId: ID!, content: String!): Message!
  }
`;

const parseJsonLiteral = (node: any): unknown => {
  if (node.kind === Kind.STRING || node.kind === Kind.BOOLEAN) return node.value;
  if (node.kind === Kind.INT || node.kind === Kind.FLOAT) return Number(node.value);
  if (node.kind === Kind.NULL) return null;
  if (node.kind === Kind.LIST) return node.values.map(parseJsonLiteral);
  if (node.kind === Kind.OBJECT) return Object.fromEntries(node.fields.map((field: any) => [field.name.value, parseJsonLiteral(field.value)]));
  return null;
};
const jsonScalar: GraphQLScalarType = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: parseJsonLiteral,
});

const authRequired = (ctx: GraphQLContext) => {
  if (!ctx.userId) throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.userId;
};
const adminRequired = (ctx: GraphQLContext) => {
  const userId = authRequired(ctx);
  if (ctx.role !== RoleEnum.ADMIN) throw new GraphQLError('Admin privileges required', { extensions: { code: 'FORBIDDEN' } });
  return userId;
};
const id = (value: unknown) => String(value);
const inputError = (message: string) => new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
const parse = <T>(result: { success: boolean; data?: T; error?: { issues: { message: string }[] } }): T => {
  if (!result.success) throw inputError(result.error?.issues[0]?.message ?? 'Invalid input');
  return result.data as T;
};
const dateValue = (value: unknown) => value instanceof Date ? value.toISOString() : String(value ?? new Date().toISOString());
const userView = (user: any) => user && ({ ...(user.toObject?.() ?? user), id: id(user._id ?? user.id) });
const postView = (post: any) => post && ({ ...(post.toObject?.() ?? post), id: id(post._id), createdAt: dateValue(post.createdAt), updatedAt: dateValue(post.updatedAt) });
const commentView = (comment: any) => comment && ({
  ...(comment.toObject?.() ?? comment),
  id: id(comment._id),
  postId: id(comment.post),
  parentCommentId: comment.parentComment ? id(comment.parentComment) : null,
  createdAt: dateValue(comment.createdAt),
  updatedAt: dateValue(comment.updatedAt),
});
const storyView = (story: any) => story && ({ ...(story.toObject?.() ?? story), id: id(story._id), expiresAt: dateValue(story.expiresAt), createdAt: dateValue(story.createdAt) });
const notificationView = (notification: any) => notification && ({ ...(notification.toObject?.() ?? notification), id: id(notification._id), createdAt: dateValue(notification.createdAt) });
const chatView = (chat: any) => chat && ({ ...(chat.toObject?.() ?? chat), id: id(chat._id), lastMessageAt: chat.lastMessageAt ? dateValue(chat.lastMessageAt) : null });
const groupView = (group: any) => group && ({ ...(group.toObject?.() ?? group), id: id(group._id), createdAt: dateValue(group.createdAt) });
const messageView = (message: any) => message && ({ ...(message.toObject?.() ?? message), id: id(message._id), chatId: message.chat ? id(message.chat) : null, groupId: message.group ? id(message.group) : null, createdAt: dateValue(message.createdAt) });

const resolvers = {
  JSON: jsonScalar,
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => ctx.userId ? userView(await User.findById(ctx.userId).select('-password')) : null,
    users: async (_: unknown, __: unknown, ctx: GraphQLContext) => { authRequired(ctx); return (await userService.getAllUsers()).map(userView); },
    userProfile: async (_: unknown, args: { id?: string }, ctx: GraphQLContext) => userView(await userService.getUserById(args.id ?? authRequired(ctx))),
    post: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => { authRequired(ctx); return postView(await postService.getPostById(args.id)); },
    posts: async (_: unknown, args: { search?: string }, ctx: GraphQLContext) => { authRequired(ctx); return (await Post.find(args.search ? { content: { $regex: args.search, $options: 'i' } } : {}).sort({ createdAt: -1 })).map(postView); },
    feed: async (_: unknown, args: { limit?: number }, ctx: GraphQLContext) => (await postService.getFeed(authRequired(ctx), args.limit)).map(postView),
    profilePosts: async (_: unknown, args: { userId: string; limit?: number }, ctx: GraphQLContext) => { authRequired(ctx); return (await postService.getProfilePosts(args.userId, args.limit)).map(postView); },
    findPosts: async (_: unknown, args: { keyword: string }, ctx: GraphQLContext) => {
      authRequired(ctx);
      const keyword = args.keyword.trim();
      if (!keyword) throw inputError('Keyword is required');
      return (await Post.find({ content: { $regex: keyword, $options: 'i' } }).sort({ createdAt: -1 })).map(postView);
    },
    dashboard: async (_: unknown, __: unknown, ctx: GraphQLContext) => { adminRequired(ctx); const dashboard = await postService.getDashboard(); return { ...dashboard, topPosts: dashboard.topPosts.map(postView) }; },
    comment: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => { authRequired(ctx); return commentView(await Comment.findById(args.id)); },
    comments: async (_: unknown, args: { postId: string }, ctx: GraphQLContext) => { authRequired(ctx); return (await commentService.getComments(args.postId)).map(commentView); },
    commentReplies: async (_: unknown, args: { commentId: string }, ctx: GraphQLContext) => { authRequired(ctx); return (await Comment.find({ parentComment: args.commentId }).sort({ createdAt: 1 })).map(commentView); },
    activeStories: async (_: unknown, args: { limit?: number }, ctx: GraphQLContext) => { authRequired(ctx); return (await storyService.getActiveStories(args.limit)).map(storyView); },
    userStories: async (_: unknown, args: { userId: string }, ctx: GraphQLContext) => { authRequired(ctx); return (await storyService.getUserStories(args.userId)).map(storyView); },
    notifications: async (_: unknown, __: unknown, ctx: GraphQLContext) => (await notificationService.getNotificationsForUser(authRequired(ctx))).map(notificationView),
    allNotifications: async (_: unknown, __: unknown, ctx: GraphQLContext) => { adminRequired(ctx); return (await notificationService.getAllNotifications()).map(notificationView); },
    chats: async (_: unknown, __: unknown, ctx: GraphQLContext) => (await chatService.getUserChats(authRequired(ctx))).map(chatView),
    chatMessages: async (_: unknown, args: { chatId: string }, ctx: GraphQLContext) => (await chatService.getChatMessages(args.chatId, authRequired(ctx))).map(messageView),
    groups: async (_: unknown, __: unknown, ctx: GraphQLContext) => (await chatService.getUserGroups(authRequired(ctx))).map(groupView),
    groupMessages: async (_: unknown, args: { groupId: string }, ctx: GraphQLContext) => (await chatService.getGroupMessages(args.groupId, authRequired(ctx))).map(messageView),
  },
  User: {
    id: (u: any) => id(u._id ?? u.id),
    name: (u: any) => u.name ?? u.username,
  },
  Post: {
    id: (p: any) => id(p._id ?? p.id),
    author: async (p: any) => userView(await User.findById(p.author)),
    reactions: async (p: any) => (p.reactions ?? []).map((r: any) => ({ ...r, user: r.user })),
    reactionCount: (p: any) => (p.reactions ?? []).length,
    comments: async (p: any) => (await Comment.find({ post: p._id, parentComment: { $exists: false } })).map(commentView),
  },
  Reaction: { user: async (r: any) => userView(await User.findById(r.user)) },
  Comment: {
    id: (c: any) => id(c._id ?? c.id),
    author: async (c: any) => userView(await User.findById(c.author)),
    replies: async (c: any) => (await Comment.find({ parentComment: c._id })).map(commentView),
    reactions: (c: any) => c.reactions ?? [],
    reactionCount: (c: any) => (c.reactions ?? []).length,
  },
  Story: { user: async (s: any) => userView(await User.findById(s.user)) },
  Notification: {
    createdBy: async (n: any) => userView(await User.findById(n.createdBy)),
    recipients: async (n: any) => (await Promise.all((n.recipients ?? []).map((userId: any) => User.findById(userId)))).filter(Boolean).map(userView),
    readBy: async (n: any) => (await Promise.all((n.readBy ?? []).map((userId: any) => User.findById(userId)))).filter(Boolean).map(userView),
  },
  Chat: {
    participants: async (c: any) => (c.participants ?? []).map(userView),
  },
  Group: {
    owner: async (g: any) => userView(g.owner),
    members: async (g: any) => (g.members ?? []).map(userView),
  },
  Message: {
    sender: async (m: any) => userView(m.sender),
    recipient: async (m: any) => m.recipient ? userView(m.recipient) : null,
  },
  Mutation: {
    signup: async (_: unknown, args: any) => {
      const data = parse(sighnupschema.body.safeParse(args));
      const result = await authService.signUp(data);
      const tokens = TokenService.generateAccessAndRefreshTokens(result.user);
      return { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user: userView(result.user) };
    },
    login: async (_: unknown, args: any) => {
      const result = await authService.login(parse(loginschema.body.safeParse(args)));
      return { accessToken: result.access_token, refreshToken: result.refresh_token, user: userView(result.user) };
    },
    confirmEmail: async (_: unknown, args: { token: string }) => userView(await authService.confirmEmail(args.token)),
    resendConfirmation: async (_: unknown, args: { email: string }) => await authService.resendConfirmation(args.email),
    forgotPassword: async (_: unknown, args: { email: string }) => await authService.forgotPassword(args.email),
    resetPassword: async (_: unknown, args: { token: string; newPassword: string }) => authService.resetPassword(args.token, args.newPassword),
    logout: async (_: unknown, args: { refreshToken: string }) => authService.logout(args.refreshToken),
    socialLogin: async (_: unknown, args: any) => {
      const result = await authService.socialLogin(args);
      return { accessToken: result.access_token, refreshToken: result.refresh_token, user: userView(result.user) };
    },
    updateUser: async (_: unknown, args: any, ctx: GraphQLContext) => {
      const currentUserId = authRequired(ctx);
      const data = parse(updateUserSchema.body.safeParse(args));
      return userView(await userService.updateUser(args.id, data as UpdateUserDto, currentUserId));
    },
    updateFcmToken: async (_: unknown, args: any, ctx: GraphQLContext) => userView(await userService.updateFcmToken(authRequired(ctx), parse(updateFcmTokenSchema.body.safeParse(args)))),
    deleteUser: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => userService.deleteUser(args.id, authRequired(ctx), ctx.role ?? ''),
    createPost: async (_: unknown, args: any, ctx: GraphQLContext) => postView(await postService.createPost(parse(createPostSchema.body.safeParse(args)) as CreatePostDto, authRequired(ctx))),
    updatePost: async (_: unknown, args: any, ctx: GraphQLContext) => postView(await postService.updatePost(args.id, parse(updatePostSchema.body.safeParse(args)) as UpdatePostDto, authRequired(ctx), ctx.role ?? '')),
    deletePost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => postService.deletePost(args.id, authRequired(ctx), ctx.role ?? ''),
    reactPost: async (_: unknown, args: { postId: string; emoji: string }, ctx: GraphQLContext) => postView(await postService.reactToPost(args.postId, authRequired(ctx), parse(z.string().min(1).safeParse(args.emoji)))),
    createComment: async (_: unknown, args: any, ctx: GraphQLContext) => {
      const parsed = parse(createCommentSchema.body.safeParse({ text: args.text, parentComment: args.parentCommentId }));
      return commentView(await commentService.addComment(args.postId, parsed as CreateCommentDto, authRequired(ctx)));
    },
    updateComment: async (_: unknown, args: any, ctx: GraphQLContext) => commentView(await commentService.updateComment(args.id, parse(updateCommentSchema.body.safeParse(args)) as UpdateCommentDto, authRequired(ctx), ctx.role ?? '')),
    deleteComment: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => commentService.deleteComment(args.id, authRequired(ctx), ctx.role ?? ''),
    reactComment: async (_: unknown, args: { commentId: string; emoji: string }, ctx: GraphQLContext) => commentView(await commentService.reactToComment(args.commentId, authRequired(ctx), parse(z.string().min(1).safeParse(args.emoji)))),
    replyToComment: async (_: unknown, args: { commentId: string; text: string }, ctx: GraphQLContext) => {
      const parent = await Comment.findById(args.commentId);
      if (!parent) throw inputError('Comment not found');
      const parsed = parse(createCommentSchema.body.safeParse({ text: args.text, parentComment: args.commentId }));
      return commentView(await commentService.addComment(id(parent.post), parsed as CreateCommentDto, authRequired(ctx)));
    },
    createStory: async (_: unknown, args: any, ctx: GraphQLContext) => storyView(await storyService.createStory(parse(createStorySchema.body.safeParse(args)) as CreateStoryDto, authRequired(ctx))),
    updateStory: async (_: unknown, args: any, ctx: GraphQLContext) => storyView(await storyService.updateStory(args.id, parse(updateStorySchema.body.safeParse(args)) as UpdateStoryDto, authRequired(ctx), ctx.role ?? '')),
    deleteStory: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => storyService.deleteStory(args.id, authRequired(ctx), ctx.role ?? ''),
    createNotification: async (_: unknown, args: any, ctx: GraphQLContext) => notificationView(await notificationService.createNotification(parse(createNotificationSchema.body.safeParse(args)) as CreateNotificationDto, adminRequired(ctx))),
    updateNotification: async (_: unknown, args: any, ctx: GraphQLContext) => { adminRequired(ctx); return notificationView(await notificationService.updateNotification(args.id, parse(updateNotificationSchema.body.safeParse(args)) as UpdateNotificationDto)); },
    markNotificationAsRead: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => notificationView(await notificationService.markAsRead(args.id, authRequired(ctx))),
    deleteNotification: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => { adminRequired(ctx); return notificationService.deleteNotification(args.id); },
    createChat: async (_: unknown, args: { userId: string }, ctx: GraphQLContext) => chatView(await chatService.getOrCreateChat(authRequired(ctx), args.userId)),
    sendMessage: async (_: unknown, args: { chatId: string; content: string }, ctx: GraphQLContext) => {
      const parsedContent = parse(messageSchema.safeParse({ content: args.content }));
      return messageView(await chatService.sendMessage(args.chatId, authRequired(ctx), parsedContent.content));
    },
    createGroup: async (_: unknown, args: { name: string; memberIds: string[] }, ctx: GraphQLContext) => {
      const data = parse(createGroupSchema.safeParse(args));
      return groupView(await chatService.createGroup(authRequired(ctx), data.name, data.memberIds));
    },
    sendGroupMessage: async (_: unknown, args: { groupId: string; content: string }, ctx: GraphQLContext) => {
      const content = parse(messageSchema.safeParse({ content: args.content }));
      return messageView(await chatService.sendGroupMessage(args.groupId, authRequired(ctx), content.content));
    },
  },
};

export const graphqlServer = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

export async function graphqlContextFromToken(header?: string): Promise<GraphQLContext> {
  if (!header) return {};
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  const decoded: any = TokenService.decodeToken({ token });
  if (!decoded?.sub) throw new GraphQLError('Invalid token', { extensions: { code: 'UNAUTHENTICATED' } });
  const role = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
  const signature = TokenService.getSignature(role === RoleEnum.ADMIN ? RoleEnum.ADMIN : RoleEnum.USER).accessSignature;
  try {
    TokenService.verifyToken({ token, signature });
  } catch {
    throw new GraphQLError('Invalid or expired token', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return { userId: decoded.sub, role };
}
