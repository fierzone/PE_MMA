import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, ActivityIndicator, StatusBar, Platform,
    Modal, TextInput, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { ShopifyTheme } from '../../theme/ShopifyTheme';

import { Order, OrderItem } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

export const AdminOrderListScreen: React.FC = () => {
    const { orders, fetchOrders, isLoading, fetchOrderItems } = useOrder();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const filteredAndSorted = orders
        .filter(o =>
            o.id.toString().includes(search) ||
            (o.customerName?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (o.customerEmail?.toLowerCase() || '').includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return b.totalAmount - a.totalAmount;
        });

    const handleViewDetail = async (order: Order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        setLoadingItems(true);
        const items = await fetchOrderItems(order.id);
        setOrderItems(items);
        setLoadingItems(false);
    };

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity style={styles.orderRow} onPress={() => handleViewDetail(item)}>
            <View style={styles.orderIconWrap}>
                <Ionicons name="receipt-outline" size={20} color={ShopifyTheme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Bản ghi #{item.id}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>COMPLETED</Text>
                    </View>
                </View>
                <Text style={styles.customerInfo}>{item.customerName || 'Khách vãng lai'}</Text>
                <Text style={styles.orderDate}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.orderAmount}>${item.totalAmount.toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.chapterMarker}>CHAPTER XIII · LOGISTICS</Text>
                <View style={styles.heroRow}>
                    <View>
                        <Text style={styles.title}>Quản trị</Text>
                        <Text style={styles.titleAccent}>Đơn hàng.</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.sortBtn}
                        onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
                    >
                        <Ionicons name="swap-vertical" size={16} color="#000" />
                        <Text style={styles.sortBtnText}>XẾP THEO {sortBy === 'date' ? 'GIÁ TRỊ' : 'THỜI GIAN'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={16} color={ShopifyTheme.colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm ID đơn, tên khách..."
                        placeholderTextColor={ShopifyTheme.colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={ShopifyTheme.colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={filteredAndSorted}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isLoading}
                    onRefresh={fetchOrders}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="document-text-outline" size={48} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>KHÔNG TÌM THẤY GIAO DỊCH</Text>
                        </View>
                    }
                />
            )}

            {/* Order Detail Modal */}
            <Modal visible={showDetailModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Chi tiết đơn hàng #{selectedOrder?.id}</Text>
                                <Text style={styles.modalSub}>{selectedOrder?.customerName} · {selectedOrder?.customerEmail}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.sectionLabel}>DANH SÁCH SẢN PHẨM</Text>
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
                                <Text style={styles.totalLabel}>TỔNG THANH TOÁN</Text>
                                <Text style={styles.totalValue}>${selectedOrder?.totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setShowDetailModal(false)}
                        >
                            <Text style={styles.closeBtnText}>ĐÓNG CHI TIẾT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        paddingHorizontal: 32,
        paddingTop: 40,
        paddingBottom: 32,
    },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10, fontWeight: '900', letterSpacing: 2,
        marginBottom: 16,
    },
    title: { fontSize: 48, fontWeight: '900', color: '#FFF', letterSpacing: -1.5 },
    titleAccent: { fontSize: 48, fontWeight: '900', color: ShopifyTheme.colors.accent, letterSpacing: -3, marginTop: -10 },
    subTitle: { color: ShopifyTheme.colors.textMuted, fontSize: 13, marginTop: 12, fontWeight: '600' },
    heroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        gap: 8,
    },
    sortBtnText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 100,
        paddingHorizontal: 20,
        height: 48,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFF',
        fontSize: 14,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    listContent: { paddingBottom: 40 },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 16,
    },
    orderIconWrap: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    orderId: { color: '#FFF', fontSize: 15, fontWeight: '800' },
    badge: {
        backgroundColor: 'rgba(94,234,212,0.1)',
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    badgeText: { color: ShopifyTheme.colors.accent, fontSize: 8, fontWeight: '900' },
    customerInfo: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
    orderDate: { color: ShopifyTheme.colors.textMuted, fontSize: 11, marginTop: 4 },
    orderAmount: { color: '#FFF', fontSize: 18, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    emptyText: { color: ShopifyTheme.colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 2 },

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
