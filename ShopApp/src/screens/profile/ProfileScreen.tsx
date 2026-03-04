import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminTabs'>;

const PLAN_COLORS: Record<string, string> = {
    'Premium': '#16869C',
    'Pro': '#F59E0B',
    'Basic': '#3B82F6',
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { cartItems, totalPrice } = useCart();
    const { orders, fetchOrders } = useOrder();

    React.useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const totalSpend = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    const firstName = user?.fullName?.split(' ')[0] || 'User';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.breadcrumb}>WORKSPACE / DASHBOARD</Text>
                        <Text style={styles.pageTitle}>Command Center</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options-outline" size={16} color="#334155" />
                            <Text style={styles.filterBtnText}>Lọc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.newSubBtn}
                            onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Store' } as any)}
                        >
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                            <Text style={styles.newSubBtnText}>Mua gói mới</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.grid}>
                    {/* Welcome card */}
                    <View style={[styles.card, styles.wideCard]}>
                        <View style={styles.welcomeRow}>
                            <View>
                                <Text style={styles.welcomeTitle}>{greeting}, {firstName}.</Text>
                                <Text style={styles.welcomeSub}>Hệ thống của bạn đang hoạt động ổn định.</Text>
                            </View>
                            <View style={styles.waveEmoji}>
                                <Text style={{ fontSize: 24 }}>👋</Text>
                            </View>
                        </View>

                        <View style={styles.spendRow}>
                            <View>
                                <Text style={styles.spendLabel}>TỔNG CHI TIÊU HÀNG THÁNG</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <Text style={styles.spendAmount}>${totalSpend.toFixed(2)}</Text>
                                    <View style={styles.growthBadge}>
                                        <Text style={styles.growthText}>NEW</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.spendMeta}>Qua {orders.length} đơn hàng</Text>
                        </View>
                    </View>

                    {/* Quick Cart */}
                    <View style={[styles.card, styles.cartCard]}>
                        <View style={styles.cartCardHeader}>
                            <Ionicons name="bag-outline" size={20} color="#334155" />
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                            </View>
                        </View>
                        <Text style={styles.cartLabel}>GIỎ HÀNG NHANH</Text>
                        <Text style={styles.cartTotal}>${totalPrice.toFixed(2)}</Text>
                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Cart' } as any)}
                        >
                            <Text style={styles.checkoutBtnText}>Thanh toán →</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Active Stack */}
                    <View style={[styles.card, styles.wideCard]}>
                        <View style={styles.sectionHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="apps" size={18} color="#6366F1" />
                                <Text style={styles.sectionTitle}>Gói đang hoạt động</Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.viewAll}>LỊCH SỬ</Text>
                            </TouchableOpacity>
                        </View>

                        {orders.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: '#94A3B8', padding: 20 }}>Bạn chưa có công cụ nào. Hãy ghé qua Store nhé!</Text>
                        ) : (
                            orders.map((order: any, i: number) => (
                                <View key={i} style={styles.toolRow}>
                                    <View style={[styles.toolIcon, { backgroundColor: '#0F172A' }]}>
                                        <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.toolContent}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={styles.toolName}>Hóa đơn #{order.id}</Text>
                                            <View style={[styles.planBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                                                <Text style={[styles.planBadgeText, { color: '#1D4ED8' }]}>ĐÃ THANH TOÁN</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <View style={styles.activeDot} />
                                            <Text style={styles.toolMeta}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                        <Text style={styles.toolPrice}>${order.totalAmount.toFixed(2)}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Account */}
                    <View style={[styles.card, styles.halfCard]}>
                        <Text style={styles.sectionTitle}>Tài khoản</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Họ tên</Text>
                            <Text style={styles.infoValue}>{user?.fullName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Vai trò</Text>
                            <Text style={styles.infoValue}>{user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</Text>
                        </View>

                        {user?.role === 'admin' && (
                            <TouchableOpacity
                                style={styles.adminActionBtn}
                                onPress={() => navigation.navigate('AdminUserList' as any)}
                            >
                                <Ionicons name="people-outline" size={16} color="#0F172A" />
                                <Text style={styles.adminActionText}>Quản lý thành viên</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                            <Text style={styles.logoutText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8F8',
    },
    scroll: {
        flex: 1,
    },
    pageHeader: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
        gap: 16,
    },
    breadcrumb: {
        fontSize: 11,
        color: '#94A3B8',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 4,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
    },
    filterBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    newSubBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#0F172A',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    newSubBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    grid: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 16,
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        flexWrap: Platform.OS === 'web' ? 'wrap' : undefined,
        alignItems: Platform.OS === 'web' ? 'flex-start' : 'stretch',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    wideCard: {
        width: Platform.OS === 'web' ? '48%' : '100%',
    },
    halfCard: {
        width: '100%',
    },
    cartCard: {
        width: Platform.OS === 'web' ? '25%' : '100%',
    },

    // Welcome card
    welcomeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    welcomeSub: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    waveEmoji: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    spendLabel: {
        fontSize: 11,
        color: '#94A3B8',
        letterSpacing: 1,
        fontWeight: '600',
    },
    spendAmount: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    growthBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    growthText: {
        fontSize: 12,
        color: '#16A34A',
        fontWeight: '700',
    },
    spendMeta: {
        fontSize: 12,
        color: '#94A3B8',
    },

    // Cart card
    cartCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cartBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    cartLabel: {
        fontSize: 11,
        color: '#94A3B8',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 8,
    },
    cartTotal: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginBottom: 16,
    },
    checkoutBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 6,
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkoutBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },

    // Active stack
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    viewAll: {
        fontSize: 12,
        fontWeight: '700',
        color: '#16869C',
        letterSpacing: 0.5,
    },
    toolRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
        gap: 12,
    },
    toolIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolContent: {
        flex: 1,
        gap: 4,
    },
    toolName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    planBadge: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    planBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22C55E',
    },
    toolMeta: {
        fontSize: 12,
        color: '#94A3B8',
    },
    toolPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    seatBadge: {
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    seatBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },

    // Account
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        marginTop: 8,
    },
    infoLabel: {
        fontSize: 13,
        color: '#94A3B8',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
        maxWidth: '60%',
    },
    adminActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    adminActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 6,
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    },
});
