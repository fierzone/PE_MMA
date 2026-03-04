import React, { useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerTabs'>;

export const CustomerAccountScreen: React.FC<Props> = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { cartItems, totalPrice } = useCart();
    const { orders, fetchOrders } = useOrder();

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    const firstName = user?.fullName?.split(' ').pop() || 'bạn';

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: logout },
        ]);
    };

    const menuItems = [
        {
            icon: 'receipt-outline',
            label: 'Lịch sử mua hàng',
            sublabel: `${orders.length} đơn hàng`,
            onPress: () => navigation.navigate('OrderHistory' as any),
            color: '#16869C',
            bg: '#EFF9FB',
        },
        {
            icon: 'bag-outline',
            label: 'Giỏ hàng hiện tại',
            sublabel: `${cartItems.length} sản phẩm | $${totalPrice.toFixed(2)}`,
            onPress: () => (navigation as any).navigate('CustomerTabs', { screen: 'Cart' }),
            color: '#F59E0B',
            bg: '#FFFBEB',
        },
        {
            icon: 'storefront-outline',
            label: 'Khám phá cửa hàng',
            sublabel: 'Xem tất cả sản phẩm',
            onPress: () => (navigation as any).navigate('CustomerTabs', { screen: 'Store' }),
            color: '#8B5CF6',
            bg: '#F5F3FF',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={styles.hero}>
                    <View style={styles.heroGradient}>
                        <View style={styles.avatarWrap}>
                            <Text style={styles.avatarText}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={styles.heroGreeting}>{greeting}, {firstName} 👋</Text>
                        <Text style={styles.heroName}>{user?.fullName}</Text>
                        <Text style={styles.heroEmail}>{user?.email}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNum}>{orders.length}</Text>
                                <Text style={styles.statLabel}>Đơn hàng</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNum}>${totalSpend.toFixed(0)}</Text>
                                <Text style={styles.statLabel}>Đã chi tiêu</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNum}>{cartItems.length}</Text>
                                <Text style={styles.statLabel}>Trong giỏ</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('OrderHistory' as any)}>
                            <Text style={styles.seeAll}>Xem tất cả →</Text>
                        </TouchableOpacity>
                    </View>

                    {orders.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Ionicons name="bag-outline" size={36} color="#CBD5E1" />
                            <Text style={styles.emptyOrdersText}>Chưa có đơn hàng nào</Text>
                        </View>
                    ) : (
                        orders.slice(0, 3).map((order) => (
                            <View key={order.id} style={styles.orderRow}>
                                <View style={styles.orderIcon}>
                                    <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.orderTitle}>Đơn hàng #{order.id}</Text>
                                    <Text style={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                                <Text style={styles.orderPrice}>${order.totalAmount.toFixed(2)}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Quick Menu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity key={i} style={styles.menuRow} onPress={item.onPress} activeOpacity={0.7}>
                            <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuSub}>{item.sublabel}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    hero: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
    heroGradient: {
        backgroundColor: '#0F172A',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarWrap: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#16869C', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)',
    },
    avatarText: { fontSize: 30, fontWeight: '800', color: '#FFFFFF' },
    heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
    heroName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 24 },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
        paddingVertical: 16, paddingHorizontal: 8, width: '100%',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: {
        fontSize: 20, fontWeight: '800', color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
    section: {
        backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12,
        borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9',
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    seeAll: { fontSize: 13, color: '#16869C', fontWeight: '600' },
    emptyOrders: { alignItems: 'center', paddingVertical: 20, gap: 8 },
    emptyOrdersText: { fontSize: 14, color: '#94A3B8' },
    orderRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
    },
    orderIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center',
    },
    orderTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    orderDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    orderPrice: {
        fontSize: 15, fontWeight: '700', color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    menuRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
    },
    menuIcon: {
        width: 44, height: 44, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
    menuSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FECACA',
        borderRadius: 12, paddingVertical: 16,
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
