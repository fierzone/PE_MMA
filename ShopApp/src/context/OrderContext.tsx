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

    // ─── SQL Settings ────────────────────────────────────────────────────────
    const ensureSqlSettings = useCallback(async () => {
        try {
            await db.execAsync('PRAGMA foreign_keys = ON;');
        } catch (e) {
            console.warn('[OrderContext] PRAGMA error:', e);
        }
    }, [db]);

    // ─── fetchOrders ─────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        if (!user) { setOrders([]); return; }
        setIsLoading(true);
        try {
            await ensureSqlSettings();
            let rows: Order[];
            if (isAdmin) {
                // Admin: lấy ALL orders kèm thông tin khách
                rows = await db.getAllAsync<Order>(`
                    SELECT o.id, o.userId, o.totalAmount, o.createdAt,
                           u.fullName AS customerName,
                           u.email    AS customerEmail
                    FROM Orders o
                    LEFT JOIN Users u ON o.userId = u.id
                    ORDER BY o.createdAt DESC
                `);
            } else {
                // Customer: chỉ lấy đơn của mình
                rows = await db.getAllAsync<Order>(
                    'SELECT * FROM Orders WHERE userId = ? ORDER BY createdAt DESC',
                    [user.id]
                );
            }
            setOrders(rows);
        } catch (e: any) {
            if (!e.message?.includes('no such table')) {
                console.error('[Order] fetchOrders error:', e);
            }
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [db, user, isAdmin, ensureSqlSettings]);

    // ─── fetchStats ──────────────────────────────────────────────────────────
    const fetchStats = useCallback(async (period: '24h' | '7d' | '30d' | 'all' = 'all') => {
        try {
            await ensureSqlSettings();
            let query = `SELECT
                COALESCE(SUM(totalAmount), 0) AS totalRevenue,
                COUNT(*) AS orderCount
            FROM Orders`;
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
            setStats(result ?? { totalRevenue: 0, orderCount: 0 });
        } catch (e: any) {
            if (!e.message?.includes('no such table')) {
                console.error('[Order] fetchStats error:', e);
            }
        }
    }, [db, ensureSqlSettings]);

    // ─── checkout (Sử dụng Transaction để đảm bảo an toàn) ──────────────────────────
    const checkout = useCallback(async (items: CartItemDetailed[], total: number): Promise<boolean> => {
        if (!user?.id) return false;

        try {
            await ensureSqlSettings();
            const uid = Number(user.id);
            const now = new Date().toISOString();

            // Sử dụng transaction để đảm bảo tất cả hoặc không có gì
            await db.withTransactionAsync(async () => {
                // 1. Tạo Order chính
                const result = await db.runAsync(
                    'INSERT INTO Orders (userId, totalAmount, createdAt) VALUES (?, ?, ?)',
                    [uid, total, now]
                );
                const orderId = result.lastInsertRowId;

                // 2. Tạo OrderItems và Licenses
                for (const item of items) {
                    const pid = Number(item.productId);
                    await db.runAsync(
                        'INSERT INTO OrderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                        [orderId, pid, item.quantity, item.product.price]
                    );

                    const licenseKey = `AI-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                    const expiresAt = new Date();
                    expiresAt.setMonth(expiresAt.getMonth() + 1);

                    await db.runAsync(
                        'INSERT INTO Licenses (userId, productId, orderId, licenseKey, activatedAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
                        [uid, pid, orderId, licenseKey, now, expiresAt.toISOString()]
                    );
                }

                // 3. Xóa giỏ hàng của user này
                await db.runAsync('DELETE FROM Cart WHERE userId = ?', [uid]);
            });

            // 4. Reload data sau khi transaction thành công
            await fetchOrders();
            await fetchStats('all');
            return true;
        } catch (e) {
            console.error('[OrderContext] checkout failed:', e);
            return false;
        }
    }, [db, user, fetchOrders, fetchStats, ensureSqlSettings]);

    // ─── Analytics ───────────────────────────────────────────────────────────
    const getRevenueByPeriod = useCallback(async (period: 'day' | 'month' | 'year') => {
        const fmt = period === 'month' ? '%Y-%m' : period === 'year' ? '%Y' : '%Y-%m-%d';
        try {
            await ensureSqlSettings();
            return await db.getAllAsync<{ period: string; amount: number }>(`
                SELECT strftime('${fmt}', createdAt) AS period,
                       SUM(totalAmount) AS amount
                FROM Orders
                GROUP BY period
                ORDER BY period ASC
            `);
        } catch (e) {
            return [];
        }
    }, [db, ensureSqlSettings]);

    const getTopSpenders = useCallback(async () => {
        try {
            await ensureSqlSettings();
            return await db.getAllAsync<{ name: string; email: string; totalSpent: number; orderCount: number }>(`
                SELECT u.fullName AS name, u.email,
                       COALESCE(SUM(o.totalAmount), 0) AS totalSpent,
                       COUNT(o.id) AS orderCount
                FROM Users u
                JOIN Orders o ON u.id = o.userId
                GROUP BY u.id
                ORDER BY totalSpent DESC LIMIT 5
            `);
        } catch (e) {
            return [];
        }
    }, [db, ensureSqlSettings]);

    const getTopProducts = useCallback(async () => {
        try {
            await ensureSqlSettings();
            return await db.getAllAsync<{ name: string; quantity: number }>(`
                SELECT p.name, SUM(oi.quantity) AS quantity
                FROM OrderItems oi
                JOIN Products p ON oi.productId = p.id
                GROUP BY p.id
                ORDER BY quantity DESC LIMIT 5
            `);
        } catch (e) {
            return [];
        }
    }, [db, ensureSqlSettings]);

    const getActiveUsersCount = useCallback(async () => {
        try {
            await ensureSqlSettings();
            const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(DISTINCT userId) AS count FROM Orders');
            return result?.count ?? 0;
        } catch (e) {
            return 0;
        }
    }, [db, ensureSqlSettings]);

    const fetchOrderItems = useCallback(async (orderId: number): Promise<OrderItem[]> => {
        try {
            await ensureSqlSettings();
            return await db.getAllAsync<OrderItem>(`
                SELECT oi.*, p.name AS productName
                FROM OrderItems oi
                JOIN Products p ON oi.productId = p.id
                WHERE oi.orderId = ?
            `, [orderId]);
        } catch (e) {
            return [];
        }
    }, [db, ensureSqlSettings]);

    const fetchLicenses = useCallback(async () => {
        if (!user) return [];
        try {
            await ensureSqlSettings();
            return await db.getAllAsync<any>(`
                SELECT l.*, p.name AS productName, p.image AS productImage
                FROM Licenses l
                JOIN Products p ON l.productId = p.id
                WHERE l.userId = ?
                ORDER BY l.activatedAt DESC
            `, [user.id]);
        } catch (e) {
            return [];
        }
    }, [db, user, ensureSqlSettings]);

    React.useEffect(() => {
        if (user) {
            fetchOrders();
            if (isAdmin) fetchStats('all');
        } else {
            setOrders([]);
            setStats(null);
        }
    }, [user, isAdmin, fetchOrders, fetchStats]);

    return (
        <OrderContext.Provider value={{
            orders, isLoading, stats,
            fetchOrders, fetchStats, checkout,
            getRevenueByPeriod, getTopSpenders, getTopProducts,
            getActiveUsersCount, fetchOrderItems, fetchLicenses,
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
