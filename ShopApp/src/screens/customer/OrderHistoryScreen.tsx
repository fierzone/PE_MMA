import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, Platform, ActivityIndicator, StatusBar, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useNavigation } from '@react-navigation/native';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { Order, OrderItem } from '../../types';

export const OrderHistoryScreen: React.FC = () => {
    const { orders, fetchOrders, isLoading, fetchOrderItems } = useOrder();
    const navigation = useNavigation();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);

    const handleViewDetail = async (order: Order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        setLoadingItems(true);
        const items = await fetchOrderItems(order.id);
        setOrderItems(items);
        setLoadingItems(false);
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <TouchableOpacity style={styles.orderCard} onPress={() => handleViewDetail(item)}>
            <View style={styles.orderHeader}>
                <View style={styles.orderIconWrap}>
                    <Ionicons name="receipt-outline" size={20} color={ShopifyTheme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.orderId}>MI-26-{item.id.toString().padStart(4, '0')}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
                <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>SUCCESS</Text>
                </View>
            </View>
            <View style={styles.orderFooter}>
                <Text style={styles.orderAmount}>${item.totalAmount.toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.nav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>LỊCH SỬ GIAO DỊCH</Text>
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>TỔNG ĐƠN</Text>
                    <Text style={styles.summaryVal}>{orders.length}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>TỔNG CHI</Text>
                    <Text style={styles.summaryVal}>${totalSpend.toFixed(0)}</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={ShopifyTheme.colors.accent} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="documents-outline" size={60} color="rgba(255,255,255,0.05)" />
                    <Text style={styles.emptyText}>KHÔNG CÓ DỮ LIỆU</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Order Detail Modal */}
            <Modal visible={showDetailModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Chi tiết đơn hàng #{selectedOrder?.id}</Text>
                                <Text style={styles.modalSub}>{new Date(selectedOrder?.createdAt || '').toLocaleString('vi-VN')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.sectionLabel}>SẢN PHẨM ĐÃ MUA</Text>
                            {loadingItems ? (
                                <ActivityIndicator color={ShopifyTheme.colors.accent} style={{ marginVertical: 20 }} />
                            ) : (
                                orderItems.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{item.productName}</Text>
                                            <Text style={styles.itemMeta}>Số lượng: {item.quantity} × ${item.price}</Text>
                                        </View>
                                        <Text style={styles.itemTotal}>${(item.quantity * item.price).toFixed(2)}</Text>
                                    </View>
                                ))
                            )}

                            <View style={styles.totalBlock}>
                                <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                                <Text style={styles.totalValue}>${selectedOrder?.totalAmount.toFixed(2)}</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setShowDetailModal(false)}
                        >
                            <Text style={styles.closeBtnText}>QUAY LẠI</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    nav: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: 24, paddingVertical: 20,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: { padding: 4 },
    navTitle: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    summaryContainer: {
        flexDirection: 'row', padding: 24, gap: 12,
    },
    summaryBox: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20, padding: 20,
    },
    summaryLabel: { color: ShopifyTheme.colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
    summaryVal: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -1 },
    list: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
    orderCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    orderIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(94,234,212,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    orderId: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
    orderDate: { color: ShopifyTheme.colors.textMuted, fontSize: 11, marginTop: 2 },
    paidBadge: {
        backgroundColor: 'rgba(94,234,212,0.08)', borderRadius: 100,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    paidText: { fontSize: 8, fontWeight: '900', color: ShopifyTheme.colors.accent, letterSpacing: 1 },
    orderFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)', paddingTop: 16,
    },
    orderAmount: { color: '#FFF', fontSize: 18, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '900', letterSpacing: 3 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '85%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 32,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    modalSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontWeight: '600',
    },
    modalBody: {
        padding: 32,
    },
    sectionLabel: {
        color: ShopifyTheme.colors.accent,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 24,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    itemName: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemMeta: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    itemTotal: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    totalBlock: {
        marginTop: 32,
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    totalLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    totalValue: {
        color: ShopifyTheme.colors.accent,
        fontSize: 24,
        fontWeight: '900',
    },
    closeBtn: {
        marginHorizontal: 32,
        height: 56,
        backgroundColor: '#FFF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
