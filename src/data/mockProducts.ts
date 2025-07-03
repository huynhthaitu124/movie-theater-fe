import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    productId: '96f0bc8b-8745-4f39-b8ze-a290bb2e4ca1',
    name: 'Báp Rang',
    stock: 100,
    price: 5000,
    image: 'https://images.pexels.com/photos/1179170/pexels-photo-1179170.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Delicious buttery popcorn perfect for movie watching',
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2025-07-03T11:57:08.740Z',
    updatedAt: '2025-07-03T11:57:08.740Z'
  },
  {
    productId: '73f8582c-0b0b-4bec-93e3-2e933d8fdf59',
    name: 'Nước Ngọt',
    stock: 200,
    price: 3000,
    image: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Refreshing soft drinks to complement your movie experience',
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2025-07-03T11:57:08.740Z',
    updatedAt: '2025-07-03T11:57:08.740Z'
  },
  {
    productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Combo Popcorn & Soda',
    stock: 50,
    price: 7500,
    image: 'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Perfect combo of popcorn and soft drink at a great price',
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2025-07-03T10:30:00.000Z',
    updatedAt: '2025-07-03T12:15:00.000Z'
  },
  {
    productId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    name: 'Chocolate Bar',
    stock: 5,
    price: 2500,
    image: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium chocolate bar for sweet moments during movies',
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2025-07-03T09:20:00.000Z',
    updatedAt: '2025-07-03T11:45:00.000Z'
  },
  {
    productId: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    name: 'Nachos & Cheese',
    stock: 0,
    price: 4500,
    image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Crispy nachos with melted cheese sauce',
    status: 'OUT_OF_STOCK',
    isActive: true,
    createdAt: '2025-07-03T08:15:00.000Z',
    updatedAt: '2025-07-03T13:30:00.000Z'
  },
  {
    productId: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    name: 'Ice Cream Cup',
    stock: 30,
    price: 3500,
    image: 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Creamy ice cream in various flavors',
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2025-07-02T16:45:00.000Z',
    updatedAt: '2025-07-03T10:20:00.000Z'
  },
  {
    productId: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
    name: 'Movie Theater Candy',
    stock: 8,
    price: 2000,
    image: 'https://images.pexels.com/photos/1395958/pexels-photo-1395958.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Assorted movie theater candies and gummies',
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2025-07-02T14:30:00.000Z',
    updatedAt: '2025-07-03T09:10:00.000Z'
  },
  {
    productId: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
    name: 'Premium Coffee',
    stock: 25,
    price: 4000,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Freshly brewed premium coffee for late night movies',
    status: 'AVAILABLE',
    isActive: false,
    createdAt: '2025-07-02T12:00:00.000Z',
    updatedAt: '2025-07-03T08:45:00.000Z'
  }
];