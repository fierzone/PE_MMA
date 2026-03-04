import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    ScrollView, Alert, StatusBar
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { useSQLiteContext } from 'expo-sqlite';

export const ProfileScreen: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigation = useNavigation();
    const db = useSQLiteContext();
    const [stats, setStats] = useState({ orders: 0, spent: 0 });

    useEffect(() => {
        if (user) loadUserStats();
    }, [user]);

    const loadUserStats = async () => {
        if (!user) return;
        try {
            const result = await db.getFirstAsync<{ count: number; total: number }>(
                'SELECT COUNT(*) as count, COALESCE(SUM(totalAmount),0) as total FROM Orders WHERE userId = ?',
                [user.id]
            );
            setStats({ orders: result?.count ?? 0, spent: result?.total ?? 0 });
        } catch (e) {
            console.error('loadUserStats error:', e);
        }
    };

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn thoát?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', onPress: logout, style: 'destructive' }
        ]);
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* Chapter Marker */}
                    <Text style={styles.chapterMarker}>CHAPTER XII · PORTRAIT</Text>

                    {/* Identity */}
                    <View style={styles.identitySection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarInitial}>{user.fullName[0]}</Text>
                            </View>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                            </View>
                        </View>
                        <Text style={styles.name}>{user.fullName}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>{stats.orders}</Text>
                            <Text style={styles.statLab}>ĐƠN HÀNG</Text>
                        </View>
                        <View style={styles.statBoxDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>${stats.spent.toFixed(2)}</Text>
                            <Text style={styles.statLab}>TỔNG CHI</Text>
                        </View>
                    </View>

                    {/* Menu */}
                    <View style={styles.menuSection}>
                        <Text style={styles.menuTitle}>TIỆN ÍCH</Text>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => (navigation as any).navigate('AdminUserList')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.menuIconBox, { backgroundColor: ShopifyTheme.colors.burgundy }]}>
                                        <Ionicons name="people-outline" size={20} color="#FFF" />
                                    </View>
                                    <Text style={styles.menuItemText}>Quản lý thành viên</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name="time-outline" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.menuItemText}>Lịch sử mua hàng</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name="settings-outline" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.menuItemText}>Thiết lập tài khoản</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { marginTop: 24 }]} onPress={handleLogout}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}>
                                    <Ionicons name="log-out-outline" size={20} color="#FF453A" />
                                </View>
                                <Text style={[styles.menuItemText, { color: '#FF453A' }]}>Đăng xuất</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.romanGroup}>
                            {['IX', 'X', 'XI', 'XII'].map((r, i) => (
                                <Text key={r} style={i === 3 ? styles.romanActive : styles.roman}>{r}</Text>
                            ))}
                        </View>
                        <Text style={styles.footerBrand}>MINIMALIST PRIME · EDITION '26</Text>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ShopifyTheme.colors.background },
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: 32,
        paddingTop: 80,
        paddingBottom: 60,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 11, fontWeight: '700', letterSpacing: 2,
        marginBottom: 60, textAlign: 'center',
    },
    identitySection: { alignItems: 'center', marginBottom: 60 },
    avatarContainer: { position: 'relative', marginBottom: 24 },
    avatar: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: '#111827',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { color: '#FFF', fontSize: 48, fontWeight: '900' },
    roleBadge: {
        position: 'absolute', bottom: 0, right: -10,
        backgroundColor: ShopifyTheme.colors.accent,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
        borderWidth: 4, borderColor: '#000',
    },
    roleText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    name: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    email: { color: ShopifyTheme.colors.textMuted, fontSize: 14, marginTop: 4, fontWeight: '500' },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24, padding: 32, marginBottom: 60,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    statBox: { flex: 1, alignItems: 'center' },
    statBoxDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
    statVal: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 4 },
    statLab: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    menuSection: { marginBottom: 60 },
    menuTitle: { color: ShopifyTheme.colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 24 },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuIconBox: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    menuItemText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    footer: { alignItems: 'center', marginTop: 40, gap: 20 },
    romanGroup: { flexDirection: 'row', gap: 20 },
    roman: { color: 'rgba(255,255,255,0.1)', fontSize: 14, fontWeight: '900', letterSpacing: 4 },
    romanActive: { color: ShopifyTheme.colors.accent, fontSize: 14, fontWeight: '900', letterSpacing: 4 },
    footerBrand: { color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: '900', letterSpacing: 3 },
});
