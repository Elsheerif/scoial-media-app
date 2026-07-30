export interface UpdateUserDto {
    username?: string;
    email?: string;
    age?: number;
    gender?: 'male' | 'female';
    phoneNumber?: string;
    profilePicture?: string;
    coverPicture?: string;
}

export interface UpdateFcmTokenDto {
    fcmToken: string;
}
