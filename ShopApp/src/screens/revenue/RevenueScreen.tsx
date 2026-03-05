import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, Alert, Dimensions, StatusBar
} from 'react-native';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const RevenueScreen: React.FC = () => {
    const {
        stats, fetchStats, isLoading, getTopSpenders, getActiveUsersCount, getTopProducts, getRevenueByPeriod
    } = useOrder();

    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('all');
    const [topSpenders, setTopSpenders] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const loadAll = async () => {
            await fetchStats(period);
            await loadExtraData();
        };
        loadAll();
    }, [fetchStats, period]);

    const loadExtraData = async () => {
        const [spenders, products, revenue, count] = await Promise.all([
            getTopSpenders(),
            getTopProducts(),
            getRevenueByPeriod('day'),
            getActiveUsersCount()
        ]);
        setTopSpenders(spenders);
        setTopProducts(products);
        setRevenueHistory(revenue.slice(0, 7).reverse()); // Last 7 periods
        setActiveUsers(count);
    };

    const handlePeriodChange = () => {
        Alert.alert(
            "CHỌN KHOẢNG THỜI GIAN",
            "Dữ liệu thống kê sẽ được cập nhật theo lựa chọn của bạn.",
            [
                { text: "24 GIỜ QUA", onPress: () => setPeriod('24h') },
                { text: "7 NGÀY QUA", onPress: () => setPeriod('7d') },
                { text: "30 NGÀY QUA", onPress: () => setPeriod('30d') },
                { text: "TẤT CẢ", onPress: () => setPeriod('all') },
                { text: "HỦY", style: "cancel" }
            ]
        );
    };

    const totalRevenue = stats?.totalRevenue ?? 0;
    const orderCount = stats?.orderCount ?? 0;

    // Simple Custom Bar Chart Component
    const MiniBarChart = ({ data, color }: { data: any[], color: string }) => {
        const max = Math.max(...data.map(d => d.amount || d.quantity || 1));
        return (
            <View style={styles.chartContainer}>
                {data.map((item, i) => (
                    <View key={i} style={styles.chartColumn}>
                        <View style={[
                            styles.chartBar,
                            {
                                height: `${((item.amount || item.quantity) / max) * 100}%`,
                                backgroundColor: color
                            }
                        ]} />
                        <Text style={styles.chartLabel} numberOfLines={1}>
                            {item.period ? item.period.split('-').pop() : item.name.split(' ')[0]}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    <Text style={styles.chapterMarker}>CHAPTER VIII · ANALYTICS</Text>

                    <View style={styles.heroHeader}>
                        <Text style={styles.heroTitle}>Trung Tâm</Text>
                        <Text style={styles.heroTitleAccent}>Điều Hành.</Text>
                        <Text style={styles.heroDesc}>
                            Phân tích dữ liệu thời gian thực cho thấy sự tăng trưởng của kỷ nguyên AI.
                        </Text>
                    </View>

                    <View style={styles.filterRow}>
                        <TouchableOpacity style={styles.pillBtn} onPress={handlePeriodChange}>
                            <Text style={styles.pillBtnText}>{period.toUpperCase()} PERFORMANCE</Text>
                            <Ionicons name="filter-outline" size={16} color="#000" />
                        </TouchableOpacity>
                        <View style={styles.romanGroup}>
                            <Text style={styles.roman}>I</Text>
                            <Text style={styles.roman}>II</Text>
                            <Text style={styles.romanActive}>III</Text>
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <LinearGradient colors={['#111827', '#0F172A']} style={styles.statsCard}>
                            <Text style={styles.cardTag}>TỔNG DOANH THU</Text>
                            <Text style={styles.megaValue}>${totalRevenue.toLocaleString()}</Text>
                            <View style={styles.trendingRow}>
                                <Ionicons name="trending-up" size={16} color={ShopifyTheme.colors.accent} />
                                <Text style={styles.trendingText}>TĂNG TRƯỞNG ỔN ĐỊNH</Text>
                            </View>
                        </LinearGradient>

                        <LinearGradient colors={['#111827', '#000000']} style={styles.statsCard}>
                            <Text style={styles.cardTag}>SỐ LƯỢNG ĐƠN HÀNG</Text>
                            <Text style={styles.megaValue}>{orderCount}</Text>
                            <Text style={styles.cardDescMini}>Tổng số giao dịch thành công trong hệ thống.</Text>
                        </LinearGradient>
                    </View>

                    {/* Charts Section */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statsCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                            <Text style={styles.cardTag}>XU HƯỚNG DOANH THU (7 NGÀY)</Text>
                            {revenueHistory.length > 0 ? (
                                <MiniBarChart data={revenueHistory} color={ShopifyTheme.colors.accent} />
                            ) : (
                                <Text style={styles.emptyChart}>Đang cập nhật dữ liệu...</Text>
                            )}
                        </View>

                        <View style={[styles.statsCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                            <Text style={styles.cardTag}>GÓI AI BÁN CHẠY NHẤT</Text>
                            {topProducts.length > 0 ? (
                                <MiniBarChart data={topProducts} color="#A78BFA" />
                            ) : (
                                <Text style={styles.emptyChart}>Chưa có dữ liệu bán hàng</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionHeading}>Khách Hàng Hoạt Động</Text>
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHead}>
                                <Text style={styles.th}>DANH TÍNH</Text>
                                <Text style={styles.th}>ĐƠN HÀNG</Text>
                                <Text style={[styles.th, { textAlign: 'right' }]}>TỔNG CHI</Text>
                            </View>
                            {topSpenders.map((s, idx) => (
                                <View key={idx} style={styles.tr}>
                                    <View style={styles.tdIdent}>
                                        <View style={styles.avatarPill}>
                                            <Text style={styles.avatarText}>{s.name[0]}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.tdName}>{s.name}</Text>
                                            <Text style={styles.tdEmail}>{s.email}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.tdCount}>{s.orderCount} đơn</Text>
                                    <Text style={styles.tdAmount}>${s.totalSpent.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>AI SHOP ANALYTICS ENGINE · 2026</Text>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ShopifyTheme.colors.background,
    },
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: 32,
        paddingTop: 80,
        paddingBottom: 60,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 40,
    },
    heroHeader: {
        marginBottom: 60,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 64,
        fontWeight: '900',
        letterSpacing: -2,
    },
    heroTitleAccent: {
        color: ShopifyTheme.colors.accent,
        fontSize: 64,
        fontWeight: '900',
        letterSpacing: -4,
    },
    heroDesc: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 18,
        lineHeight: 28,
        marginTop: 20,
        maxWidth: 500,
        fontWeight: '500',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 24,
    },
    pillBtn: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        gap: 10,
    },
    pillBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    romanGroup: {
        flexDirection: 'row',
        gap: 16,
    },
    roman: {
        color: ShopifyTheme.colors.textMuted,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 2,
    },
    romanActive: {
        color: ShopifyTheme.colors.accent,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 2,
    },
    statsGrid: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 24,
        marginBottom: 80,
    },
    statsCard: {
        flex: 1,
        borderRadius: 32,
        padding: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        marginBottom: 20,
    },
    cardTag: {
        color: ShopifyTheme.colors.accent,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
    megaValue: {
        color: '#FFF',
        fontSize: 56,
        fontWeight: '900',
        letterSpacing: -2,
    },
    trendingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
    },
    trendingText: {
        color: ShopifyTheme.colors.accent,
        fontSize: 12,
        fontWeight: '800',
    },
    cardDescMini: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 14,
        marginTop: 12,
        lineHeight: 20,
    },
    sectionBlock: {
        marginBottom: 80,
    },
    sectionHeading: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 32,
    },
    tableContainer: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tableHead: {
        flexDirection: 'row',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    th: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        flex: 1,
    },
    tr: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    tdIdent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPill: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: ShopifyTheme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 14,
    },
    tdName: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
    },
    tdEmail: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 11,
    },
    tdCount: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
    tdAmount: {
        color: ShopifyTheme.colors.accent,
        fontSize: 16,
        fontWeight: '900',
        textAlign: 'right',
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    },
    footerText: {
        color: 'rgba(255,255,255,0.1)',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 2,
    },
    chartContainer: {
        flexDirection: 'row',
        height: 120,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 24,
        paddingHorizontal: 10,
    },
    chartColumn: {
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    chartBar: {
        width: 12,
        borderRadius: 6,
        minHeight: 4,
    },
    chartLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        fontWeight: '700',
    },
    emptyChart: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 40,
        textAlign: 'center',
    },
});
