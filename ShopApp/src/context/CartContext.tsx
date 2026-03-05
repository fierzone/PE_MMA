import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { CartItemDetailed } from '../types';
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

    // ─── Đảm bảo SQL Context ổn định ──────────────────────────────────────────
    const initSqlEnv = useCallback(async () => {
        try {
            await db.execAsync('PRAGMA foreign_keys = ON;');
        } catch (e) {
            console.warn('[CartContext] Failed to init SQL settings:', e);
        }
    }, [db]);

    const fetchCart = useCallback(async () => {
        if (!user?.id) {
            setCartItems([]);
            return;
        }
        try {
            await initSqlEnv();
            const uid = Number(user.id);
            const rows = await db.getAllAsync<{
                cartId: number; cartQty: number; prodId: number;
                prodName: string; prodDesc: string; prodPrice: number;
                prodImage: string; prodTier: string;
            }>(`
                SELECT
                    c.id        AS cartId,
                    c.quantity  AS cartQty,
                    p.id        AS prodId,
                    p.name      AS prodName,
                    p.description AS prodDesc,
                    p.price     AS prodPrice,
                    p.image     AS prodImage,
                    p.tier      AS prodTier
                FROM Cart c
                JOIN Products p ON c.productId = p.id
                WHERE c.userId = ?
                ORDER BY c.id DESC
            `, [uid]);

            const items: CartItemDetailed[] = rows.map(r => ({
                id: r.cartId,
                productId: r.prodId,
                quantity: r.cartQty,
                product: {
                    id: r.prodId,
                    name: r.prodName,
                    description: r.prodDesc,
                    price: r.prodPrice,
                    image: r.prodImage,
                    tier: r.prodTier as any,
                },
            }));
            setCartItems(items);
        } catch (e: any) {
            // Nếu bảng chưa được tạo (khi dùng useSuspense={false}), bỏ qua lỗi fetch đầu tiên
            if (!e.message?.includes('no such table')) {
                console.error('[CartContext] fetchCart error:', e);
            }
        }
    }, [db, user, initSqlEnv]);

    const addToCart = useCallback(async (productId: number, quantity = 1) => {
        if (!user?.id) throw new Error('Vui lòng đăng nhập.');

        const uid = Number(user.id);
        const pid = Number(productId);

        console.log(`[Cart] Adding to cart: userId=${uid}, productId=${pid}, qty=${quantity}`);

        try {
            await initSqlEnv();

            // ─── VALIDATION ───
            // Kiểm tra xem sản phẩm có thực sự tồn tại trong DB hiện tại không
            const product = await db.getFirstAsync<{ id: number }>('SELECT id FROM Products WHERE id = ?', [pid]);
            if (!product) {
                console.error('[Cart] Product ID not found in DB:', pid);
                throw new Error('Sản phẩm không còn tồn tại trong hệ thống.');
            }

            // Kiểm tra xem User có thực sự tồn tại trong DB hiện tại không
            const userInDb = await db.getFirstAsync<{ id: number }>('SELECT id FROM Users WHERE id = ?', [uid]);
            if (!userInDb) {
                console.error('[Cart] User ID not found in DB:', uid);
                throw new Error('Thông tin người dùng không hợp lệ. Vui lòng đăng xuất và đăng nhập lại.');
            }

            // ─── DB OPERATION ───
            const existing = await db.getFirstAsync<{ id: number; quantity: number }>(
                'SELECT id, quantity FROM Cart WHERE userId = ? AND productId = ?',
                [uid, pid]
            );

            if (existing) {
                await db.runAsync(
                    'UPDATE Cart SET quantity = ? WHERE id = ?',
                    [existing.quantity + quantity, existing.id]
                );
                console.log('[Cart] Updated existing item quantity');
            } else {
                await db.runAsync(
                    'INSERT INTO Cart (userId, productId, quantity) VALUES (?, ?, ?)',
                    [uid, pid, quantity]
                );
                console.log('[Cart] Inserted new item to cart');
            }

            await fetchCart();
        } catch (e: any) {
            console.error('[CartContext] addToCart failed:', e);
            throw e;
        }
    }, [db, user, fetchCart, initSqlEnv]);

    const updateCartItemQuantity = useCallback(async (id: number, delta: number) => {
        if (!user?.id) return;
        const cid = Number(id);
        try {
            await initSqlEnv();
            const row = await db.getFirstAsync<{ quantity: number }>('SELECT quantity FROM Cart WHERE id = ?', [cid]);
            if (row) {
                const newQty = row.quantity + delta;
                if (newQty <= 0) {
                    await db.runAsync('DELETE FROM Cart WHERE id = ?', [cid]);
                } else {
                    await db.runAsync('UPDATE Cart SET quantity = ? WHERE id = ?', [newQty, cid]);
                }
                await fetchCart();
            }
        } catch (e) {
            console.error('[CartContext] updateCartItemQuantity error:', e);
        }
    }, [db, user, fetchCart, initSqlEnv]);

    const removeFromCart = useCallback(async (id: number) => {
        if (!user?.id) return;
        try {
            await initSqlEnv();
            await db.runAsync('DELETE FROM Cart WHERE id = ?', [id]);
            fetchCart();
        } catch (e) {
            console.error('[CartContext] removeFromCart error:', e);
        }
    }, [db, user, fetchCart, initSqlEnv]);

    const clearCart = useCallback(async () => {
        if (!user?.id) return;
        try {
            await initSqlEnv();
            await db.runAsync('DELETE FROM Cart WHERE userId = ?', [Number(user.id)]);
            setCartItems([]);
        } catch (e) {
            console.error('[CartContext] clearCart error:', e);
        }
    }, [db, user, initSqlEnv]);

    React.useEffect(() => {
        if (user) fetchCart();
        else setCartItems([]);
    }, [user, fetchCart]);

    const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, totalPrice,
            fetchCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
