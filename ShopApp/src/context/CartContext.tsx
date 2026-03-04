import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { CartItemDetailed, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
    cartItems: CartItemDetailed[];
    totalPrice: number;
    fetchCart: () => Promise<void>;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    updateCartItemQuantity: (id: number, delta: number) => Promise<void>;
    removeFromCart: (id: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItemDetailed[]>([]);

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        try {
            const items = await db.getAllAsync<any>(`
        SELECT c.id as cartId, c.quantity, p.* 
        FROM Cart c 
        JOIN Products p ON c.productId = p.id
        WHERE c.userId = ?
      `, [user.id]);

            const detailedItems: CartItemDetailed[] = items.map(item => ({
                id: item.cartId,
                productId: item.id,
                quantity: item.quantity,
                product: {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    image: item.image,
                    tier: item.tier
                }
            }));

            setCartItems(detailedItems);
        } catch (e) {
            console.error('Fetch cart error:', e);
        }
    }, [db]);

    const addToCart = async (productId: number, quantity: number = 1) => {
        if (!user) return;
        try {
            const existing = await db.getFirstAsync<{ id: number, quantity: number }>(
                'SELECT id, quantity FROM Cart WHERE productId = ? AND userId = ?',
                [productId, user.id]
            );

            if (existing) {
                await db.runAsync('UPDATE Cart SET quantity = ? WHERE id = ?', [existing.quantity + quantity, existing.id]);
            } else {
                await db.runAsync('INSERT INTO Cart (userId, productId, quantity) VALUES (?, ?, ?)', [user.id, productId, quantity]);
            }
            await fetchCart();
        } catch (e) {
            console.error('Add to cart error:', e);
        }
    };

    const updateCartItemQuantity = async (id: number, delta: number) => {
        try {
            const item = await db.getFirstAsync<{ quantity: number }>('SELECT quantity FROM Cart WHERE id = ?', [id]);
            if (item) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) {
                    await db.runAsync('DELETE FROM Cart WHERE id = ?', [id]);
                } else {
                    await db.runAsync('UPDATE Cart SET quantity = ? WHERE id = ?', [newQuantity, id]);
                }
                await fetchCart();
            }
        } catch (e) {
            console.error('Update quantity error:', e);
        }
    };

    const removeFromCart = async (id: number) => {
        try {
            await db.runAsync('DELETE FROM Cart WHERE id = ?', [id]);
            await fetchCart();
        } catch (e) {
            console.error('Remove from cart error:', e);
        }
    };

    const clearCart = useCallback(async () => {
        if (!user) return;
        try {
            await db.runAsync('DELETE FROM Cart WHERE userId = ?', [user.id]);
            setCartItems([]);
        } catch (e) {
            console.error('Clear cart error:', e);
        }
    }, [db, user]);

    React.useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, totalPrice, fetchCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
