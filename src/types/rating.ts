export interface Rating {
    id: string;
    movieId: string;
    accountId: string;
    score: number;
    comment: string;
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}
