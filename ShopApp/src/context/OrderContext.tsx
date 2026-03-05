import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Order, CartItemDetailed, OrderItem } from '../types';
import { useAuth } from './AuthContext';

interface OrderContextType {
    orders: Order[];
    isLoading: boolean;
    stats: { totalRevenue: number; orderCount: number } | null;
    fetchOrders: () => Promise<void>;
    fetchStats: (period?: '24h' | '7d' | '30d' | 'all') => Promise<void>;
    checkout: (items: CartItemDetailed[], total: number) => Promise<boolean>;
    getRevenueByPeriod: (period: 'day' | 'month' | 'year') => Promise<{ period: string; amount: number }[]>;
    getTopSpenders: () => Promise<{ name: string; email: string; totalSpent: number; orderCount: number }[]>;
    getTopProducts: () => Promise<{ name: string; quantity: number }[]>;
    getActiveUsersCount: () => Promise<number>;
    fetchOrderItems: (orderId: number) => Promise<OrderItem[]>;
    fetchLicenses: () => Promise<any[]>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();
    const { user, isAdmin } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<{ totalRevenue: number; orderCount: number } | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!user) { setOrders([]); return; }
        setIsLoading(true);
        try {
            let rows: Order[];
            if (isAdmin) {
                rows = await db.getAllAsync<Order>(`
                    SELECT o.*, u.fullName as customerName, u.email as customerEmail
                    FROM Orders o
                    LEFT JOIN Users u ON o.userId = u.id
                    ORDER BY o.createdAt DESC
                `);
            } else {
                rows = await db.getAllAsync<Order>(
                    'SELECT * FROM Orders WHERE userId = ? ORDER BY createdAt DESC',
                    [user.id]
                );
            }
            setOrders(rows);
        } catch (e) {
            console.error('fetchOrders error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [db, user, isAdmin]);

    const fetchStats = useCallback(async (period: '24h' | '7d' | '30d' | 'all' = 'all') => {
        try {
            let query = 'SELECT COALESCE(SUM(totalAmount), 0) as totalRevenue, COUNT(*) as orderCount FROM Orders';
            const params: any[] = [];
            if (period !== 'all') {
                const d = new Date();
                if (period === '24h') d.setHours(d.getHours() - 24);
                else if (period === '7d') d.setDate(d.getDate() - 7);
                else if (period === '30d') d.setDate(d.getDate() - 30);
                query += ' WHERE createdAt >= ?';
                params.push(d.toISOString());
            }
            const result = await db.getFirstAsync<{ totalRevenue: number; orderCount: number }>(query, params);
            setStats(result || { totalRevenue: 0, orderCount: 0 });
        } catch (e) {
            console.error('fetchStats error:', e);
        }
    }, [db]);

    const checkout = async (items: CartItemDetailed[], total: number) => {
        if (!user) return false;
        try {
            const now = new Date().toISOString();
            const result = await db.runAsync(
                'INSERT INTO Orders (totalAmount, createdAt, userId) VALUES (?, ?, ?)',
                [total, now, user.id]
            );
            const orderId = result.lastInsertRowId;

            for (const item of items) {
                // 1. Create Order Item
                await db.runAsync(
                    'INSERT INTO OrderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.productId, item.quantity, item.product.price]
                );

                // 2. Auto-activation: Create License
                const licenseKey = `AI-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                const expiresAt = new Date();
                expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month validity

                await db.runAsync(
                    'INSERT INTO Licenses (userId, productId, orderId, licenseKey, activatedAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.id, item.productId, orderId, licenseKey, now, expiresAt.toISOString()]
                );
            }

            await db.runAsync('DELETE FROM Cart WHERE userId = ?', [user.id]);
            await fetchOrders();
            return true;
        } catch (e) {
            console.error('checkout error:', e);
            return false;
        }
    };

    const getRevenueByPeriod = async (period: 'day' | 'month' | 'year') => {
        const fmt = period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d';
        try {
            return await db.getAllAsync<{ period: string; amount: number }>(`
                SELECT strftime('${fmt}', createdAt) as period, SUM(totalAmount) as amount
                FROM Orders GROUP BY period ORDER BY period DESC
            `);
        } catch (e) {
            return [];
        }
    };

    const getTopSpenders = async () => {
        try {
            return await db.getAllAsync<{ name: string; email: string; totalSpent: number; orderCount: number }>(`
                SELECT u.fullName as name, u.email, SUM(o.totalAmount) as totalSpent, COUNT(o.id) as orderCount
                FROM Users u
                JOIN Orders o ON u.id = o.userId
                GROUP BY u.id
                ORDER BY totalSpent DESC
                LIMIT 5
            `);
        } catch (e) {
            return [];
        }
    };

    const getTopProducts = async () => {
        try {
            return await db.getAllAsync<{ name: string; quantity: number }>(`
                SELECT p.name, SUM(oi.quantity) as quantity
                FROM OrderItems oi
                JOIN Products p ON oi.productId = p.id
                GROUP BY p.id
                ORDER BY quantity DESC
                LIMIT 5
            `);
        } catch (e) {
            return [];
        }
    };

    const getActiveUsersCount = async () => {
        try {
            const result = await db.getFirstAsync<{ count: number }>("SELECT COUNT(DISTINCT userId) as count FROM Orders");
            return result?.count ?? 0;
        } catch (e) {
            return 0;
        }
    };

    const fetchOrderItems = async (orderId: number) => {
        try {
            return await db.getAllAsync<OrderItem>(`
                SELECT oi.*, p.name as productName
                FROM OrderItems oi
                JOIN Products p ON oi.productId = p.id
                WHERE oi.orderId = ?
            `, [orderId]);
        } catch (e) {
            console.error('fetchOrderItems error:', e);
            return [];
        }
    };

    const fetchLicenses = async () => {
        if (!user) return [];
        try {
            return await db.getAllAsync<any>(`
                SELECT l.*, p.name as productName, p.image as productImage
                FROM Licenses l
                JOIN Products p ON l.productId = p.id
                WHERE l.userId = ?
                ORDER BY l.activatedAt DESC
            `, [user.id]);
        } catch (e) {
            console.error('fetchLicenses error:', e);
            return [];
        }
    };

    React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <OrderContext.Provider value={{
            orders, isLoading, stats, fetchOrders, fetchStats, checkout,
            getRevenueByPeriod, getTopSpenders, getTopProducts, getActiveUsersCount,
            fetchOrderItems, fetchLicenses
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const ctx = useContext(OrderContext);
    if (!ctx) throw new Error('useOrder must be used within OrderProvider');
    return ctx;
}
