import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Platform, Alert, StatusBar, ActivityIndicator, useWindowDimensions
} from 'react-native';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';

export const RevenueScreen: React.FC = () => {
    const {
        stats, fetchStats, isLoading,
        getTopSpenders, getActiveUsersCount, getTopProducts, getRevenueByPeriod
    } = useOrder();

    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('all');
    const [topSpenders, setTopSpenders] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState(0);
    const [extraLoading, setExtraLoading] = useState(false);

    const { width: windowWidth } = useWindowDimensions();
    const isLargeScreen = windowWidth >= 768;

    // ── Load analytics data ──────────────────────────────────────────────────
    const loadExtraData = useCallback(async () => {
        setExtraLoading(true);
        try {
            const [spenders, products, revenue, count] = await Promise.all([
                getTopSpenders(),
                getTopProducts(),
                getRevenueByPeriod('day'),
                getActiveUsersCount(),
            ]);

            // Fill last 7 days với 0 nếu không có data
            const last7Days: { period: string; amount: number }[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const match = revenue.find(r => r.period === dateStr);
                last7Days.push({ period: dateStr, amount: match?.amount ?? 0 });
            }

            setTopSpenders(spenders);
            setTopProducts(products.slice(0, 5));
            setRevenueHistory(last7Days);
            setActiveUsers(count);
        } catch (e) {
            console.error('[Revenue] loadExtraData error:', e);
        } finally {
            setExtraLoading(false);
        }
    }, [getTopSpenders, getTopProducts, getRevenueByPeriod, getActiveUsersCount]);

    // Chạy khi period thay đổi
    useEffect(() => {
        fetchStats(period);
        loadExtraData();
    }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

    // Chạy khi tab được focus (admin quay lại tab)
    useFocusEffect(
        useCallback(() => {
            fetchStats(period);
            loadExtraData();
        }, [period, fetchStats, loadExtraData])
    );

    const handlePeriodChange = () => {
        Alert.alert(
            'CHỌN KHOẢNG THỜI GIAN',
            'Dữ liệu thống kê sẽ được cập nhật theo lựa chọn.',
            [
                { text: '24 GIỜ QUA', onPress: () => setPeriod('24h') },
                { text: '7 NGÀY QUA', onPress: () => setPeriod('7d') },
                { text: '30 NGÀY QUA', onPress: () => setPeriod('30d') },
                { text: 'TẤT CẢ', onPress: () => setPeriod('all') },
                { text: 'HỦY', style: 'cancel' },
            ]
        );
    };

    const totalRevenue = stats?.totalRevenue ?? 0;
    const orderCount = stats?.orderCount ?? 0;

    const periodLabel = { '24h': '24 GIỜ QUA', '7d': '7 NGÀY QUA', '30d': '30 NGÀY QUA', 'all': 'TẤT CẢ' }[period];
    const loadingAny = isLoading || extraLoading;

    const pieData = [
        { name: 'Thành công', population: Math.max(1, Math.round(orderCount * 0.85)), color: '#5EEAD4', legendFontColor: '#FFF', legendFontSize: 11 },
        { name: 'Đang xử lý', population: Math.max(0, Math.round(orderCount * 0.1)), color: '#A78BFA', legendFontColor: '#FFF', legendFontSize: 11 },
        { name: 'Đã hủy', population: Math.max(0, Math.round(orderCount * 0.05)), color: '#FF453A', legendFontColor: '#FFF', legendFontSize: 11 },
    ];

    const barData = {
        labels: revenueHistory.length > 0 ? revenueHistory.map(r => r.period ? r.period.slice(5) : '') : ['No Data'],
        datasets: [{ data: revenueHistory.length > 0 && !revenueHistory.every(d => d.amount === 0) ? revenueHistory.map(r => r.amount) : [0] }]
    };

    const chartConfig = {
        backgroundGradientFrom: '#0D0D0D',
        backgroundGradientTo: '#0D0D0D',
        color: (opacity = 1) => `rgba(94, 234, 212, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        barPercentage: 0.6,
        fillShadowGradient: '#5EEAD4',
        fillShadowGradientOpacity: 1,
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* ── Header ── */}
                <View style={styles.headerSection}>
                    <Text style={styles.chapterTag}>CHAPTER I · COMMAND CENTER</Text>
                    <Text style={styles.pageTitle}>Revenue</Text>
                    <Text style={styles.pageTitleAccent}>Analytics.</Text>
                    <TouchableOpacity style={styles.periodBtn} onPress={handlePeriodChange}>
                        <Ionicons name="options-outline" size={14} color={ShopifyTheme.colors.accent} />
                        <Text style={styles.periodBtnText}>{periodLabel}</Text>
                        <Ionicons name="chevron-down" size={12} color={ShopifyTheme.colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* ── KPI Cards ── */}
                {loadingAny ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color={ShopifyTheme.colors.accent} size="large" />
                        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.kpiRow}>
                            <LinearGradient colors={['#0D2B22', '#000']} style={[styles.kpiCard, styles.kpiCardWide]}>
                                <Text style={styles.kpiLabel}>TỔNG DOANH THU</Text>
                                <Text style={styles.kpiRevenue}>
                                    ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                </Text>
                                <Text style={styles.kpiSub}>{orderCount} giao dịch</Text>
                            </LinearGradient>
                            <View style={styles.kpiSmallCol}>
                                <View style={[styles.kpiCard, styles.kpiCardSmall]}>
                                    <Text style={styles.kpiLabel}>ĐƠN HÀNG</Text>
                                    <Text style={styles.kpiNumLarge}>{orderCount}</Text>
                                </View>
                                <View style={[styles.kpiCard, styles.kpiCardSmall]}>
                                    <Text style={styles.kpiLabel}>NGƯỜI DÙNG</Text>
                                    <Text style={styles.kpiNumLarge}>{activeUsers}</Text>
                                </View>
                            </View>
                        </View>

                        {/* ── Charts Row ── */}
                        <View style={isLargeScreen ? styles.chartRow : styles.chartColumn}>
                            {/* Pie Chart */}
                            <View style={[styles.sectionCard, isLargeScreen && { flex: 1, marginHorizontal: 8, marginLeft: 16 }]}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Phân bổ Trạng thái</Text>
                                    <Ionicons name="pie-chart" size={16} color="#A78BFA" />
                                </View>
                                {orderCount === 0 ? (
                                    <Text style={styles.noDataText}>Chưa có đơn hàng.</Text>
                                ) : (
                                    <PieChart
                                        data={pieData}
                                        width={(isLargeScreen ? (windowWidth / 2) - 60 : windowWidth - 56)}
                                        height={220}
                                        chartConfig={chartConfig}
                                        accessor={"population"}
                                        backgroundColor={"transparent"}
                                        paddingLeft={"15"}
                                        center={[0, 0]}
                                        absolute
                                    />
                                )}
                            </View>

                            {/* Bar Chart */}
                            <View style={[styles.sectionCard, isLargeScreen && { flex: 1, marginHorizontal: 8, marginRight: 16 }]}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Xu hướng Doanh Thu</Text>
                                    <Ionicons name="stats-chart" size={16} color={ShopifyTheme.colors.accent} />
                                </View>
                                {revenueHistory.every(d => d.amount === 0) ? (
                                    <Text style={styles.noDataText}>Chưa có giao dịch trong khoảng thời gian này.</Text>
                                ) : (
                                    <BarChart
                                        data={barData}
                                        width={(isLargeScreen ? (windowWidth / 2) - 60 : windowWidth - 56)}
                                        height={220}
                                        yAxisLabel="$"
                                        yAxisSuffix=""
                                        chartConfig={chartConfig}
                                        verticalLabelRotation={0}
                                        fromZero
                                        showBarTops={false}
                                        style={{ borderRadius: 16 }}
                                    />
                                )}
                            </View>
                        </View>

                        {/* ── Top Products ── */}
                        {topProducts.length > 0 && (
                            <View style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Sản Phẩm Bán Chạy</Text>
                                    <Ionicons name="star-outline" size={16} color="#A78BFA" />
                                </View>
                                {topProducts.map((p, i) => (
                                    <View key={i} style={styles.spenderRow}>
                                        <View style={[styles.spenderRank, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
                                            <Text style={styles.spenderRankText}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.spenderName}>{p.name}</Text>
                                        </View>
                                        <Text style={[styles.spenderAmount, { color: '#A78BFA' }]}>{p.quantity} lượt mua</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* ── Top Spenders ── */}
                        {topSpenders.length > 0 && (
                            <View style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Khách Hàng Top</Text>
                                    <Ionicons name="people-outline" size={16} color="#60A5FA" />
                                </View>
                                {topSpenders.map((s, i) => (
                                    <View key={i} style={styles.spenderRow}>
                                        <View style={styles.spenderRank}>
                                            <Text style={styles.spenderRankText}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.spenderName}>{s.name}</Text>
                                            <Text style={styles.spenderEmail}>{s.email} · {s.orderCount} đơn</Text>
                                        </View>
                                        <Text style={styles.spenderAmount}>${s.totalSpent?.toFixed(0)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* ── Empty state khi chưa có data ── */}
                        {topSpenders.length === 0 && topProducts.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="analytics-outline" size={60} color="rgba(255,255,255,0.05)" />
                                <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
                                <Text style={styles.emptyText}>Dữ liệu sẽ hiện ở đây khi có giao dịch từ khách hàng.</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 60 },

    headerSection: {
        paddingHorizontal: 32,
        paddingTop: 60,
        paddingBottom: 40,
    },
    chapterTag: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10, fontWeight: '900',
        letterSpacing: 2, marginBottom: 16,
    },
    pageTitle: {
        color: '#FFF', fontSize: 52, fontWeight: '900',
        letterSpacing: -2, lineHeight: 52,
    },
    pageTitleAccent: {
        color: ShopifyTheme.colors.accent, fontSize: 52, fontWeight: '900',
        letterSpacing: -3, lineHeight: 52, marginBottom: 32,
    },
    periodBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        alignSelf: 'flex-start',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 100, paddingHorizontal: 20, paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    periodBtnText: {
        color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1,
    },

    loadingBox: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 80, gap: 16,
    },
    loadingText: {
        color: ShopifyTheme.colors.textMuted, fontSize: 13,
    },

    kpiRow: {
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 16, marginBottom: 16,
    },
    kpiCard: {
        backgroundColor: '#0D0D0D',
        borderRadius: 28, padding: 28,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    kpiCardWide: { flex: 1.4 },
    kpiSmallCol: { flex: 1, gap: 12 },
    kpiCardSmall: {
        flex: 1, padding: 20,
        backgroundColor: '#0D0D0D',
        borderRadius: 28, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    kpiLabel: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 8, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8,
    },
    kpiRevenue: {
        color: ShopifyTheme.colors.accent,
        fontSize: 34, fontWeight: '900', letterSpacing: -1,
    },
    kpiSub: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11, marginTop: 4,
    },
    kpiNumLarge: {
        color: '#FFF', fontSize: 28, fontWeight: '900',
    },

    sectionCard: {
        marginHorizontal: 16, marginBottom: 16,
        backgroundColor: '#0D0D0D',
        borderRadius: 28, padding: 28,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
    },
    sectionTitle: {
        color: '#FFF', fontSize: 14, fontWeight: '800',
    },

    chartRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
    },
    chartColumn: {
        flexDirection: 'column',
    },

    noDataText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 13, textAlign: 'center', paddingVertical: 24,
    },

    spenderRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    spenderRank: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center',
    },
    spenderRankText: {
        color: '#FFF', fontSize: 11, fontWeight: '900',
    },
    spenderName: {
        color: '#FFF', fontSize: 13, fontWeight: '700',
    },
    spenderEmail: {
        color: ShopifyTheme.colors.textMuted, fontSize: 11, marginTop: 2,
    },
    spenderAmount: {
        color: ShopifyTheme.colors.accent,
        fontSize: 15, fontWeight: '900',
    },

    emptyState: {
        alignItems: 'center', padding: 48, gap: 12,
    },
    emptyTitle: {
        color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: '800',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.2)', fontSize: 13,
        textAlign: 'center', maxWidth: 260, lineHeight: 20,
    },
});
