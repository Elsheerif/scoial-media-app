export interface CreateStoryDto {
    mediaUrl: string;
    type?: 'image' | 'video';
    caption?: string;
}

export interface UpdateStoryDto {
    mediaUrl?: string;
    type?: 'image' | 'video';
    caption?: string;
}
