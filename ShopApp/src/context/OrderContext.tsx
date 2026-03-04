import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Order, CartItemDetailed } from '../types';
import { useAuth } from './AuthContext';

interface OrderContextType {
    orders: Order[];
    isLoading: boolean;
    stats: { totalRevenue: number; orderCount: number } | null;
    fetchOrders: () => Promise<void>;
    fetchStats: (period?: '24h' | '7d' | '30d' | 'all') => Promise<void>;
    checkout: (items: CartItemDetailed[], total: number) => Promise<boolean>;
    getRevenueByPeriod: (period: 'day' | 'month' | 'year') => Promise<{ period: string; amount: number }[]>;
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
                // Admin sees ALL orders with customer info
                rows = await db.getAllAsync<Order>(`
                    SELECT o.*, u.fullName as customerName, u.email as customerEmail
                    FROM Orders o
                    LEFT JOIN Users u ON o.userId = u.id
                    ORDER BY o.createdAt DESC
                `);
            } else {
                // Customer sees only their own orders
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
                await db.runAsync(
                    'INSERT INTO OrderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.productId, item.quantity, item.product.price]
                );
            }
            // Clear this user's cart
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

    React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <OrderContext.Provider value={{ orders, isLoading, stats, fetchOrders, fetchStats, checkout, getRevenueByPeriod }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const ctx = useContext(OrderContext);
    if (!ctx) throw new Error('useOrder must be used within OrderProvider');
    return ctx;
}
