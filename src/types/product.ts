export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'food' | 'drink' | 'snack';
    image?: string;
    status: 'available' | 'out-of-stock' | 'discontinued';
    createdAt: string;
    updatedAt: string;
}

export interface Combo {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    products: ComboProduct[];
    status: 'available' | 'out-of-stock' | 'discontinued';
    createdAt: string;
    updatedAt: string;
}

export interface ComboProduct {
    comboId: string;
    productId: string;
    quantity: number;
}
