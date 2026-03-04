import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { User } from '../types';

interface UserContextType {
    users: User[];
    isLoading: boolean;
    fetchUsers: () => Promise<void>;
    deleteUser: (id: number) => Promise<boolean>;
    resetPassword: (id: number, newPassword: string) => Promise<boolean>;
    changeRole: (id: number, role: 'admin' | 'user') => Promise<boolean>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const db = useSQLiteContext();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const rows = await db.getAllAsync<User>(
                'SELECT id, fullName, email FROM Users ORDER BY id ASC'
            );
            setUsers(rows);
        } catch (e) {
            console.error('Fetch users error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    const deleteUser = async (id: number) => {
        try {
            await db.runAsync('DELETE FROM Users WHERE id = ?', [id]);
            setUsers(prev => prev.filter(u => u.id !== id));
            return true;
        } catch (e) {
            console.error('Delete user error:', e);
            return false;
        }
    };

    const resetPassword = async (id: number, newPassword: string) => {
        try {
            const result = await db.runAsync(
                'UPDATE Users SET password = ? WHERE id = ?',
                [newPassword, id]
            );
            return result.changes > 0;
        } catch (e) {
            console.error('Reset password error:', e);
            return false;
        }
    };

    const changeRole = async (id: number, role: 'admin' | 'user') => {
        // Role is stored in memory / future: add role column to DB
        return true;
    };

    return (
        <UserContext.Provider value={{ users, isLoading, fetchUsers, deleteUser, resetPassword, changeRole }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUsers() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUsers must be used within UserProvider');
    return ctx;
}
