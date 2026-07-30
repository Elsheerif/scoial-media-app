export interface CreateCommentDto {
    text: string;
    parentComment?: string;
}

export interface UpdateCommentDto {
    text?: string;
}

export interface ReactionDto {
    emoji: string;
}
