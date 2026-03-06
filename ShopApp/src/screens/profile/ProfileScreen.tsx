import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    ScrollView, Alert, StatusBar, Platform, Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { useSQLiteContext } from 'expo-sqlite';
import Toast from 'react-native-toast-message';

export const ProfileScreen: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const { orders, stats: systemStats } = useOrder();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const db = useSQLiteContext();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [dbInfo, setDbInfo] = useState({ size: '0 KB', tables: 0 });

    useEffect(() => {
        if (user && isAdmin) {
            loadSystemStats();
        }
    }, [user, isAdmin]);

    const adminOrders = systemStats?.orderCount ?? 0;
    const adminRevenue = systemStats?.totalRevenue ?? 0;

    const userOrders = orders.length;
    const userSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const loadSystemStats = async () => {
        try {
            const tables = await db.getAllAsync<any>("SELECT name FROM sqlite_master WHERE type='table'");
            setDbInfo({ size: '~1.2 MB', tables: tables.length });
        } catch (e) { }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        try {
            await logout();
        } catch (e) {
            console.error('Logout failed:', e);
        }
    };

    const handleUtilityAction = (title: string) => {
        if (title === 'Lịch sử mua hàng') {
            navigation.navigate('OrderHistory');
        } else if (title === 'Quản lý thành viên') {
            navigation.navigate('AdminTabs', { screen: 'Users' });
        } else {

            Toast.show({ type: 'info', text1: 'Tính năng đang phát triển', text2: title });
        }
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    <Text style={styles.chapterMarker}>CHAPTER XII · PORTRAIT</Text>

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

                    <View style={styles.statsRow}>
                        {isAdmin ? (
                            <>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{adminOrders}</Text>
                                    <Text style={styles.statLab}>ĐƠN HÀNG</Text>
                                </View>
                                <View style={styles.statBoxDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>${adminRevenue.toFixed(2)}</Text>
                                    <Text style={styles.statLab}>TỔNG DOANH THU</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>{userOrders}</Text>
                                    <Text style={styles.statLab}>ĐƠN HÀNG</Text>
                                </View>
                                <View style={styles.statBoxDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statVal}>${userSpent.toFixed(2)}</Text>
                                    <Text style={styles.statLab}>TỔNG CHI</Text>
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.menuSection}>
                        <Text style={styles.menuTitle}>TIỆN ÍCH HỆ THỐNG</Text>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleUtilityAction('Quản lý thành viên')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.menuIconBox, { backgroundColor: 'rgba(94, 234, 212, 0.1)' }]}>
                                        <Ionicons name="people-outline" size={20} color={ShopifyTheme.colors.accent} />
                                    </View>
                                    <View>
                                        <Text style={styles.menuItemText}>Quản lý thành viên</Text>
                                        <Text style={styles.menuItemSub}>Phân quyền và bảo mật tài khoản</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleUtilityAction('Lịch sử mua hàng')}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name="receipt-outline" size={20} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={styles.menuItemText}>Lịch sử mua hàng</Text>
                                    <Text style={styles.menuItemSub}>Xem lại các giao dịch AI</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                        </TouchableOpacity>

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleUtilityAction('Cấu trúc dữ liệu')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.menuIconBox}>
                                        <Ionicons name="server-outline" size={20} color="#FFF" />
                                    </View>
                                    <View>
                                        <Text style={styles.menuItemText}>Cấu trúc cơ sở dữ liệu</Text>
                                        <Text style={styles.menuItemSub}>{dbInfo.tables} Tables · SQLite Local</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleUtilityAction('Thiết lập')}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name="options-outline" size={20} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={styles.menuItemText}>Thiết lập hệ thống</Text>
                                    <Text style={styles.menuItemSub}>Tùy chỉnh giao diện và ngôn ngữ</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={ShopifyTheme.colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { marginTop: 24 }]} onPress={handleLogout}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}>
                                    <Ionicons name="log-out-outline" size={20} color="#FF453A" />
                                </View>
                                <Text style={[styles.menuItemText, { color: '#FF453A' }]}>Đăng xuất khỏi hệ thống</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

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

            {/* Logout Confirmation Modal */}
            <Modal visible={showLogoutModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconBox}>
                            <Ionicons name="log-out-outline" size={32} color="#FF453A" />
                        </View>
                        <Text style={styles.modalTitle}>Xác nhận thoát?</Text>
                        <Text style={styles.modalDesc}>
                            Hệ thống sẽ đóng phiên làm việc của bạn. Bạn có chắc chắn muốn đăng xuất không?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                                <Text style={styles.cancelBtnText}>HỦY BỎ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmLogout}>
                                <Text style={styles.confirmBtnText}>ĐĂNG XUẤT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    menuIconBox: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    menuItemText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    menuItemSub: { color: ShopifyTheme.colors.textMuted, fontSize: 12, marginTop: 2 },
    footer: { alignItems: 'center', marginTop: 40, gap: 20 },
    romanGroup: { flexDirection: 'row', gap: 20 },
    roman: { color: 'rgba(255,255,255,0.1)', fontSize: 14, fontWeight: '900', letterSpacing: 4 },
    romanActive: { color: ShopifyTheme.colors.accent, fontSize: 14, fontWeight: '900', letterSpacing: 4 },
    footerBrand: { color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: '900', letterSpacing: 3 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#111827',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalIconBox: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 12,
    },
    modalDesc: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    cancelBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
    confirmBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FF453A',
        alignItems: 'center', justifyContent: 'center',
    },
    confirmBtnText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
});
