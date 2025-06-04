export interface Category {
    id: string;
    name: string;
    description: string;
    slug: string;
    isActive: boolean;
    movies?: string[]; // Liên kết với MovieCategories
    createdAt: string;
    updatedAt: string;
}
