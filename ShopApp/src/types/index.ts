export type Tier = 'Basic' | 'Pro' | 'Premium';
export type UserRole = 'admin' | 'customer';

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    password?: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    tier: Tier;
}

export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
}

export interface CartItemDetailed extends CartItem {
    product: Product;
}

export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    createdAt: string;
    customerName?: string;
    customerEmail?: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    productName?: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
}
