import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs, ELEVATION, SCREEN } from '../theme/theme';
import { getRevenueStats, getOrders, getOrderItems } from '../database/database';
import { useAuth } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';

const FILTERS = ['toàn bộ', 'ngày', 'tháng', 'năm'];

export default function RevenueScreen({ navigation }) {
    const { user } = useAuth();

    // Trạng thái thu thập dữ liệu
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('toàn bộ');
    const [loading, setLoading] = useState(true);

    // Trạng thái trổ xuống list con bên trong phần lịch sử
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderItemsMap, setOrderItemsMap] = useState({});

    useFocusEffect(useCallback(() => { loadData(); }, []));

    // Tải dữ liệu SQLite (thống kê & lịch sử mua)
    const loadData = async () => {
        setLoading(true);
        const s = await getRevenueStats(user.id);
        const o = await getOrders(user.id);
        setStats(s);
        setOrders(o);
        setLoading(false);
    };

    // Mở rộng Xem chi tiết dòng sản phẩm trong từng ngày giao dịch
    const toggleOrder = async (orderId) => {
        if (expandedOrder === orderId) { setExpandedOrder(null); return; }
        setExpandedOrder(orderId);
        if (!orderItemsMap[orderId]) {
            const items = await getOrderItems(orderId);
            setOrderItemsMap(prev => ({ ...prev, [orderId]: items }));
        }
    };

    const getFilteredData = () => {
        if (!stats) return [];
        if (filter === 'ngày') return stats.daily || [];
        if (filter === 'tháng') return stats.monthly || [];
        if (filter === 'năm') return stats.yearly || [];
        return [];
    };

    const filteredData = getFilteredData();
    const maxRevenue = filteredData.length > 0 ? Math.max(...filteredData.map(d => d.revenue)) : 1;

    // Component UI Phụ (Thẻ hiển thị thông số)
    const StatCard = ({ icon, label, value, color, bg }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: bg || (color + '20') }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    if (loading) return <View style={styles.root}><SafeAreaView style={gs.center}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView></View>;

    return (
        <View style={styles.root}>
            <SafeAreaView style={gs.safe}>

                {/* Header trên cùng */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backBtnBg}>
                            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Phân Tích Thống Kê</Text>
                    <TouchableOpacity onPress={loadData} style={styles.backBtn}>
                        <View style={[styles.backBtnBg, { borderColor: COLORS.primaryGlow }]}>
                            <Ionicons name="refresh" size={20} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* Dashboard Doanh thu khủng */}
                    <LinearGradient colors={COLORS.gradCard} style={styles.heroCard} start={[0, 0]} end={[1, 1]}>
                        <View style={gs.row}>
                            <View style={[styles.heroIconBg, { backgroundColor: COLORS.primaryGlow }]}>
                                <Ionicons name="analytics" size={26} color={COLORS.primaryLight} />
                            </View>
                            <View style={{ marginLeft: 16 }}>
                                <Text style={styles.heroLabel}>Doanh Thu Tổng Quát</Text>
                                <Text style={styles.heroVal}>${(stats?.total || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Các khung chia chi tiết thống kế */}
                    <View style={styles.statsGrid}>
                        <StatCard icon="receipt" label="Đơn bán" value={orders.length.toString()} color={COLORS.accent} bg={COLORS.accentDim} />
                        <StatCard icon="trending-up" label="TB / Đơn" value={orders.length ? `$${(stats.total / orders.length).toFixed(0)}` : '$0'} color={COLORS.rose} bg={COLORS.roseDim} />
                        <StatCard icon="calendar" label="Tháng Này" value={`$${(stats.monthly?.[0]?.revenue || 0).toFixed(0)}`} color={COLORS.amber} bg={COLORS.amberDim} />
                    </View>

                    {/* Tab chọn Lọc Bộ biểu đồ bằng ngày/tháng/năm */}
                    <View style={styles.filterRow}>
                        {FILTERS.map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                                onPress={() => setFilter(f)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Biểu đồ dạng cột (Bar Chart) */}
                    {filter !== 'toàn bộ' && (
                        <View style={styles.chartCard}>
                            <View style={gs.between}>
                                <Text style={styles.chartTitle}>Tiền về ({filter})</Text>
                                <Ionicons name="bar-chart" size={20} color={COLORS.primary} />
                            </View>

                            {filteredData.length === 0 ? (
                                <View style={styles.noDataChar}>
                                    <Text style={styles.noDataText}>Chưa có dữ liệu vẽ biểu đồ</Text>
                                </View>
                            ) : (
                                <View style={styles.chartHWrap}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barChart}>
                                        {filteredData.slice(0, 12).reverse().map((d, i) => (
                                            <View key={i} style={styles.barWrap}>
                                                <Text style={styles.barValue} numberOfLines={1}>${d.revenue > 999 ? (d.revenue / 1000).toFixed(1) + 'k' : d.revenue.toFixed(0)}</Text>
                                                <LinearGradient
                                                    colors={COLORS.gradPrimary}
                                                    style={[styles.bar, { height: Math.max(24, (d.revenue / maxRevenue) * 140) }]}
                                                    start={[0, 0]} end={[0, 1]}
                                                />
                                                <Text style={styles.barLabel} numberOfLines={1}>
                                                    {filter === 'ngày' ? d.date?.slice(5) : filter === 'tháng' ? d.month?.slice(5) : d.year}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Lịch sử đặt hàng / thao tác (History Orders) */}
                    <View style={[gs.between, { marginTop: 12, marginBottom: 16 }]}>
                        <Text style={gs.h3}>Lịch sử Giao Dịch Mới Nhất</Text>
                        <View style={[gs.pill, { backgroundColor: COLORS.surfaceHigh }]}><Text style={styles.pillText}>{orders.length}</Text></View>
                    </View>

                    {orders.length === 0 ? (
                        <View style={styles.noData}>
                            <View style={[styles.heroIconBg, { backgroundColor: COLORS.surface, marginBottom: 12 }]}>
                                <Ionicons name="receipt-outline" size={32} color={COLORS.borderHigh} />
                            </View>
                            <Text style={styles.noDataText}>Chưa hoàn thành đơn nào</Text>
                        </View>
                    ) : (
                        orders.map(order => (
                            <TouchableOpacity
                                key={order.id}
                                style={[styles.orderCard, expandedOrder === order.id && styles.orderCardActive]}
                                onPress={() => toggleOrder(order.id)}
                                activeOpacity={0.8}
                            >
                                <View style={gs.between}>
                                    <View style={gs.row}>
                                        <View style={styles.orderIconBg}>
                                            <Ionicons name="bag-check" size={18} color={COLORS.primary} />
                                        </View>
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={styles.orderId}>Mã số #{order.id}</Text>
                                            <Text style={styles.orderDate}>{new Date(order.orderDate).toLocaleString()}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.orderRight}>
                                        <Text style={styles.orderTotal}>${order.totalAmount.toFixed(2)}</Text>
                                        <Ionicons
                                            name={expandedOrder === order.id ? 'chevron-up' : 'chevron-down'}
                                            size={18} color={COLORS.textMuted} style={{ marginLeft: 6 }}
                                        />
                                    </View>
                                </View>

                                {expandedOrder === order.id && orderItemsMap[order.id] && (
                                    <View style={styles.orderItems}>
                                        <View style={styles.orderDivider} />
                                        {orderItemsMap[order.id].map(item => (
                                            <View key={item.id} style={styles.orderItemRow}>
                                                <Ionicons name="ellipse" size={4} color={COLORS.borderHigh} style={{ marginRight: 10 }} />
                                                <Text style={styles.orderItemName} numberOfLines={1}>{item.productName}</Text>
                                                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                                                <Text style={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZE.pad, paddingTop: 12, paddingBottom: 16,
    },
    backBtn: { alignItems: 'center', justifyContent: 'center' },
    backBtnBg: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.surfaceHigh, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.border,
    },
    topTitle: { fontSize: SIZE.lg, fontWeight: FONT.bold, color: COLORS.text, letterSpacing: 0.5 },
    scroll: { paddingHorizontal: SIZE.pad, paddingBottom: 60 },
    heroCard: {
        borderRadius: SIZE.rLg, padding: SIZE.pad2, marginBottom: 16,
        borderWidth: 1, borderColor: COLORS.border, ...ELEVATION.md,
    },
    heroIconBg: {
        width: 56, height: 56, borderRadius: SIZE.r,
        alignItems: 'center', justifyContent: 'center',
    },
    heroLabel: { fontSize: SIZE.sm, fontWeight: FONT.bold, color: COLORS.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    heroVal: { fontSize: SIZE.xxxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -1 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 10 },
    statCard: {
        flex: 1, backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.r,
        padding: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
        gap: 8, ...ELEVATION.sm,
    },
    statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: SIZE.xl, fontWeight: FONT.black, color: COLORS.text },
    statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: FONT.bold, textTransform: 'uppercase' },
    filterRow: {
        flexDirection: 'row', backgroundColor: COLORS.surfaceHigh,
        borderRadius: SIZE.r, padding: 6, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border,
    },
    filterTab: { flex: 1, paddingVertical: 10, borderRadius: SIZE.rSm, alignItems: 'center' },
    filterTabActive: { backgroundColor: COLORS.bgDeep, ...ELEVATION.sm },
    filterText: { color: COLORS.textMuted, fontSize: SIZE.sm, fontWeight: FONT.bold, letterSpacing: 0.5 },
    filterTextActive: { color: COLORS.text },
    chartCard: {
        backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg, padding: SIZE.pad,
        marginBottom: 32, borderWidth: 1, borderColor: COLORS.border, ...ELEVATION.md,
    },
    chartTitle: { fontSize: SIZE.base, fontWeight: FONT.bold, color: COLORS.text },
    noDataChar: { height: 160, alignItems: 'center', justifyContent: 'center' },
    chartHWrap: { marginTop: 24 },
    barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, paddingBottom: 8 },
    barWrap: { alignItems: 'center', gap: 6, width: 44 },
    barValue: { fontSize: 10, color: COLORS.textSoft, fontWeight: FONT.bold },
    bar: { width: 28, borderRadius: 8, minHeight: 24 },
    barLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONT.semiBold },
    pillText: { fontSize: SIZE.xs, color: COLORS.textSoft, fontWeight: FONT.bold },
    noData: { alignItems: 'center', paddingVertical: 40, backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg, borderWidth: 1, borderColor: COLORS.border },
    noDataText: { fontSize: SIZE.base, color: COLORS.text, fontWeight: FONT.bold, marginBottom: 6 },
    noDataSub: { fontSize: SIZE.sm, color: COLORS.textMuted },
    orderCard: {
        backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.r, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...ELEVATION.sm,
    },
    orderCardActive: { borderColor: COLORS.borderHigh, backgroundColor: COLORS.cardSolid },
    orderIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center' },
    orderRight: { flexDirection: 'row', alignItems: 'center' },
    orderId: { fontSize: SIZE.base, fontWeight: FONT.bold, color: COLORS.text, marginBottom: 4 },
    orderDate: { fontSize: SIZE.xs, color: COLORS.textSoft },
    orderTotal: { fontSize: SIZE.lg, fontWeight: FONT.black, color: COLORS.text },
    orderItems: { marginTop: 16 },
    orderDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
    orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    orderItemName: { flex: 1, fontSize: SIZE.sm, color: COLORS.textSoft, fontWeight: FONT.medium },
    orderItemQty: { fontSize: SIZE.xs, color: COLORS.textMuted, fontWeight: FONT.bold, paddingHorizontal: 12 },
    orderItemPrice: { fontSize: SIZE.sm, fontWeight: FONT.bold, color: COLORS.text },
});
