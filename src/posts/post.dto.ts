export interface CreatePostDto {
    content: string;
    media?: string[];
    privacy?: 'public' | 'friends' | 'private';
}

export interface UpdatePostDto {
    content?: string;
    media?: string[];
    privacy?: 'public' | 'friends' | 'private';
}

export interface ReactionDto {
    emoji: string;
}
