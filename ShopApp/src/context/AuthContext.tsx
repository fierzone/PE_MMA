import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';
import { User, AuthState, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = '@user_session_v2';

export function AuthProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();
    const [authState, setAuthState] = useState<AuthState>({ user: null, isLoading: true });

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        try {
            const session = await AsyncStorage.getItem(SESSION_KEY);
            if (session) {
                const userData = JSON.parse(session) as User;
                // Re-fetch from DB to get latest role
                const fresh = await db.getFirstAsync<User>(
                    'SELECT id, fullName, email, role FROM Users WHERE id = ?',
                    [userData.id]
                );
                setAuthState({ user: fresh || null, isLoading: false });
            } else {
                setAuthState({ user: null, isLoading: false });
            }
        } catch (e) {
            setAuthState({ user: null, isLoading: false });
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const cleanEmail = email.trim().toLowerCase();
            const user = await db.getFirstAsync<User>(
                'SELECT id, fullName, email, role FROM Users WHERE LOWER(email) = ? AND password = ?',
                [cleanEmail, password]
            );

            if (user) {
                await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
                setAuthState({ user, isLoading: false });
                return { success: true };
            }
            return { success: false, error: 'Email hoặc mật khẩu không đúng.' };
        } catch (e) {
            console.error('Login error:', e);
            return { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' };
        }
    };

    const register = async (fullName: string, email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();
        console.log(`[Auth] Registering: ${cleanEmail}`);
        try {
            const existing = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM Users WHERE LOWER(email) = ?',
                [cleanEmail]
            );
            if (existing) {
                return { success: false, error: 'Email này đã được sử dụng cho tài khoản khác.' };
            }

            const result = await db.runAsync(
                "INSERT INTO Users (fullName, email, password, role) VALUES (?, ?, ?, 'customer')",
                [cleanName, cleanEmail, password]
            );

            if (result.changes > 0) {
                return { success: true };
            }
            return { success: false, error: 'Không thể tạo tài khoản. Vui lòng thử lại.' };
        } catch (e: any) {
            console.error('[Auth] Register error:', e);
            if (e.message?.includes('UNIQUE')) {
                return { success: false, error: 'Email này đã được đăng ký rồi.' };
            }
            return { success: false, error: e.message || 'Lỗi hệ thống.' };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(SESSION_KEY);
        setAuthState({ user: null, isLoading: false });
    };

    const isAdmin = authState.user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ ...authState, isAdmin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
