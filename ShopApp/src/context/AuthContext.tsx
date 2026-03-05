import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';
import { User, AuthState } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
    register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = '@user_session_v3'; // Incremented version to clear old stale sessions

export function AuthProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();
    const [authState, setAuthState] = useState<AuthState>({ user: null, isLoading: true });

    useEffect(() => {
        const timer = setTimeout(() => {
            loadSession();
        }, 500); // Give DB a moment to be ready
        return () => clearTimeout(timer);
    }, []);

    const loadSession = async () => {
        try {
            const session = await AsyncStorage.getItem(SESSION_KEY);
            if (session) {
                const userData = JSON.parse(session) as User;
                const fresh = await db.getFirstAsync<User>(
                    'SELECT id, fullName, email, role FROM Users WHERE id = ?',
                    [userData.id]
                );
                if (fresh) {
                    setAuthState({ user: fresh, isLoading: false });
                } else {
                    await AsyncStorage.removeItem(SESSION_KEY);
                    setAuthState({ user: null, isLoading: false });
                }
            } else {
                setAuthState({ user: null, isLoading: false });
            }
        } catch (e) {
            setAuthState({ user: null, isLoading: false });
        }
    };

    const login = async (email: string, password: string, remember: boolean) => {
        try {
            const cleanEmail = email.trim().toLowerCase();
            const user = await db.getFirstAsync<User>(
                'SELECT id, fullName, email, role FROM Users WHERE LOWER(email) = ? AND password = ?',
                [cleanEmail, password]
            );

            if (user) {
                if (remember) {
                    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
                }
                setAuthState({ user, isLoading: false });
                return { success: true };
            }
            return { success: false, error: 'Tài khoản hoặc mật khẩu không đúng.' };
        } catch (e) {
            return { success: false, error: 'Lỗi xác thực hệ thống.' };
        }
    };

    const register = async (fullName: string, email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase();
        try {
            const existing = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM Users WHERE LOWER(email) = ?',
                [cleanEmail]
            );
            if (existing) {
                return { success: false, error: 'Email đã tồn tại trên hệ thống.' };
            }

            const result = await db.runAsync(
                "INSERT INTO Users (fullName, email, password, role) VALUES (?, ?, ?, 'customer')",
                [fullName.trim(), cleanEmail, password]
            );

            if (result.changes > 0) {
                return { success: true };
            }
            return { success: false, error: 'Lỗi ghi dữ liệu.' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Lỗi đăng ký.' };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(SESSION_KEY);
            // Also potential other session keys
            await AsyncStorage.multiRemove([SESSION_KEY, '@user_session_v2', '@user_session_v1']);
            setAuthState({ user: null, isLoading: false });
        } catch (e) {
            console.error('Logout error:', e);
            setAuthState({ user: null, isLoading: false });
        }
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
