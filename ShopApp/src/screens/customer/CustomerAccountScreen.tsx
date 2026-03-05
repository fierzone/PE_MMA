import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Alert, StatusBar, Platform, Modal, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerTabs'>;

export const CustomerAccountScreen: React.FC<Props> = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { cartItems, totalPrice } = useCart();
    const { orders, fetchOrders, fetchLicenses } = useOrder();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loadingLicenses, setLoadingLicenses] = useState(false);

    useEffect(() => {
        fetchOrders();
        loadLicenses();
    }, [fetchOrders]);

    const loadLicenses = async () => {
        setLoadingLicenses(true);
        const data = await fetchLicenses();
        setLicenses(data);
        setLoadingLicenses(false);
    };

    const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buổi Sáng' : hour < 18 ? 'Buổi Chiều' : 'Buổi Tối';

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Chapter marker */}
                <View style={styles.topPad}>
                    <Text style={styles.chapterMarker}>CHAPTER XII · PORTRAIT</Text>
                </View>

                {/* Hero Identity Card */}
                <LinearGradient colors={['#111827', '#000']} style={styles.heroCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={styles.heroGreeting}>CHÀO {greeting.toUpperCase()}</Text>
                    <Text style={styles.heroName}>{user?.fullName}</Text>
                    <Text style={styles.heroEmail}>{user?.email}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{orders.length}</Text>
                            <Text style={styles.statLabel}>ĐƠN HÀNG</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>${totalSpend.toFixed(0)}</Text>
                            <Text style={styles.statLabel}>ĐÃ CHI</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{cartItems.length}</Text>
                            <Text style={styles.statLabel}>TRONG GIỎ</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* AI Licenses Section (Auto-activated Packages) */}
                <View style={[styles.section, { backgroundColor: 'rgba(94,234,212,0.02)', borderColor: 'rgba(94,234,212,0.1)' }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: ShopifyTheme.colors.accent }]}>LIÊN MINH AI CỦA BẠN</Text>
                        <Ionicons name="flash" size={14} color={ShopifyTheme.colors.accent} />
                    </View>

                    {licenses.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Text style={styles.emptyOrdersText}>CHƯA CÓ BẢN QUYỀN KÍCH HOẠT</Text>
                        </View>
                    ) : (
                        licenses.map((lic) => (
                            <View key={lic.id} style={styles.licenseCard}>
                                <Image source={{ uri: lic.productImage }} style={styles.licImage} resizeMode="contain" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.licName}>{lic.productName}</Text>
                                    <View style={styles.keyRow}>
                                        <Text style={styles.licKey}>{lic.licenseKey}</Text>
                                        <TouchableOpacity onPress={() => Alert.alert('Đã chép mã', lic.licenseKey)}>
                                            <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.3)" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.licDate}>Kích hoạt: {new Date(lic.activatedAt).toLocaleDateString('vi-VN')}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>ACTIVE</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ĐƠN HÀNG GẦN ĐÂY</Text>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('OrderHistory')}>
                            <Text style={styles.seeAll}>XEM TẤT CẢ →</Text>
                        </TouchableOpacity>
                    </View>

                    {orders.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Text style={styles.emptyOrdersText}>CHƯA CÓ ĐƠN HÀNG</Text>
                        </View>
                    ) : (
                        orders.slice(0, 3).map((order) => (
                            <View key={order.id} style={styles.orderRow}>
                                <View style={styles.orderIcon}>
                                    <Ionicons name="checkmark" size={16} color={ShopifyTheme.colors.accent} />
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
                    <Text style={styles.sectionTitle}>TRUY CẬP NHANH</Text>

                    {[
                        {
                            icon: 'receipt-outline',
                            label: 'Lịch sử mua hàng',
                            sub: `${orders.length} đơn hàng`,
                            onPress: () => (navigation as any).navigate('OrderHistory'),
                        },
                        {
                            icon: 'bag-outline',
                            label: 'Giỏ hàng hiện tại',
                            sub: `${cartItems.length} sản phẩm · $${totalPrice.toFixed(2)}`,
                            onPress: () => (navigation as any).navigate('CustomerTabs', { screen: 'Cart' }),
                        },
                        {
                            icon: 'storefront-outline',
                            label: 'Khám phá cửa hàng',
                            sub: 'Xem tất cả sản phẩm',
                            onPress: () => (navigation as any).navigate('CustomerTabs', { screen: 'Store' }),
                        },
                    ].map((item, i) => (
                        <TouchableOpacity key={i} style={styles.menuRow} onPress={item.onPress}>
                            <View style={styles.menuIcon}>
                                <Ionicons name={item.icon as any} size={20} color={ShopifyTheme.colors.accent} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuSub}>{item.sub}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 60 }}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color="#FF453A" />
                        <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
                    </TouchableOpacity>
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
                            Phiên làm việc của bạn sẽ kết thúc. Cảm ơn bạn đã đồng hành cùng chúng tôi.
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
    container: { flex: 1, backgroundColor: '#000' },
    topPad: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10, fontWeight: '900', letterSpacing: 2,
        textAlign: 'center',
    },
    heroCard: {
        marginHorizontal: 16, borderRadius: 32,
        padding: 32, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        marginBottom: 24,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: ShopifyTheme.colors.accent,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: { fontSize: 34, fontWeight: '900', color: '#000' },
    heroGreeting: { color: ShopifyTheme.colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
    heroName: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4, marginBottom: 24 },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20, paddingVertical: 20, paddingHorizontal: 8, width: '100%',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 9, color: ShopifyTheme.colors.textMuted, marginTop: 4, fontWeight: '900', letterSpacing: 1 },
    statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)' },

    section: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        marginHorizontal: 16, marginBottom: 16,
        borderRadius: 24, padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { color: ShopifyTheme.colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    seeAll: { color: ShopifyTheme.colors.accent, fontSize: 11, fontWeight: '900' },

    emptyOrders: { alignItems: 'center', paddingVertical: 20 },
    emptyOrdersText: { color: 'rgba(255,255,255,0.15)', fontSize: 11, fontWeight: '900', letterSpacing: 2 },

    orderRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    orderIcon: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: 'rgba(94,234,212,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    orderTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    orderDate: { color: ShopifyTheme.colors.textMuted, fontSize: 12, marginTop: 2 },
    orderPrice: { color: ShopifyTheme.colors.accent, fontSize: 15, fontWeight: '900' },

    licenseCard: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        padding: 16, backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    licImage: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#000' },
    licName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    keyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    licKey: { color: ShopifyTheme.colors.accent, fontSize: 11, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    licDate: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 6 },
    statusBadge: {
        backgroundColor: 'rgba(94,234,212,0.1)',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100,
    },
    statusText: { color: ShopifyTheme.colors.accent, fontSize: 8, fontWeight: '900' },

    menuRow: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingVertical: 20,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    menuIcon: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(94,234,212,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    menuSub: { color: ShopifyTheme.colors.textMuted, fontSize: 12, marginTop: 2 },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        backgroundColor: 'rgba(255, 69, 58, 0.08)',
        borderWidth: 1, borderColor: 'rgba(255, 69, 58, 0.2)',
        borderRadius: 100, paddingVertical: 20,
    },
    logoutText: { fontSize: 13, fontWeight: '900', color: '#FF453A', letterSpacing: 1 },

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
