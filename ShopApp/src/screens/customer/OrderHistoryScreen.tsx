import React, { useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useNavigation } from '@react-navigation/native';

export const OrderHistoryScreen: React.FC = () => {
    const { orders, fetchOrders, isLoading } = useOrder();
    const navigation = useNavigation();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);

    const renderOrder = ({ item, index }: { item: any; index: number }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderIconWrap}>
                    <Ionicons name="receipt-outline" size={20} color="#16869C" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>
                <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>ĐÃ TT</Text>
                </View>
            </View>
            <View style={styles.orderDivider} />
            <View style={styles.orderFooter}>
                <Text style={styles.orderAmountLabel}>Tổng thanh toán</Text>
                <Text style={styles.orderAmount}>${item.totalAmount.toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#0F172A" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Lịch sử mua hàng</Text>
                    <Text style={styles.headerSub}>{orders.length} đơn hàng</Text>
                </View>
            </View>

            {/* Summary bar */}
            <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{orders.length}</Text>
                    <Text style={styles.summaryLabel}>Đơn hàng</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>${totalSpend.toFixed(2)}</Text>
                    <Text style={styles.summaryLabel}>Tổng chi tiêu</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>
                        ${orders.length > 0 ? (totalSpend / orders.length).toFixed(2) : '0.00'}
                    </Text>
                    <Text style={styles.summaryLabel}>Trung bình</Text>
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#16869C" style={{ marginTop: 60 }} />
            ) : orders.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="bag-remove-outline" size={72} color="#E2E8F0" />
                    <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                    <Text style={styles.emptyText}>
                        Hãy khám phá cửa hàng và đặt mua sản phẩm đầu tiên của bạn!
                    </Text>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        padding: 20,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryNum: {
        fontSize: 18, fontWeight: '800', color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    summaryLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
    summaryDivider: { width: 1, backgroundColor: '#F1F5F9' },
    list: { padding: 16, gap: 12 },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    orderIconWrap: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: '#EFF9FB', alignItems: 'center', justifyContent: 'center',
    },
    orderId: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    orderDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    paidBadge: {
        backgroundColor: '#DCFCE7', borderRadius: 6,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    paidText: { fontSize: 10, fontWeight: '800', color: '#16A34A', letterSpacing: 0.5 },
    orderDivider: { height: 1, backgroundColor: '#F8FAFC', marginVertical: 12 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderAmountLabel: { fontSize: 13, color: '#64748B' },
    orderAmount: {
        fontSize: 18, fontWeight: '800', color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },
});
