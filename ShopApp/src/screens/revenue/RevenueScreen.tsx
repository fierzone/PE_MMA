import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, Alert
} from 'react-native';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';

export const RevenueScreen: React.FC = () => {
    const { stats, fetchStats, isLoading } = useOrder();

    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('30d');

    useEffect(() => {
        fetchStats(period);
    }, [fetchStats, period]);

    const handlePeriodChange = () => {
        Alert.alert(
            "Chọn khoảng thời gian",
            "Dữ liệu biểu đồ và KPI sẽ được cập nhật.",
            [
                { text: "24 Giờ Qua", onPress: () => setPeriod('24h') },
                { text: "7 Ngày Qua", onPress: () => setPeriod('7d') },
                { text: "30 Ngày Qua", onPress: () => setPeriod('30d') },
                { text: "Tất Cả", onPress: () => setPeriod('all') },
                { text: "Hủy", style: "cancel" }
            ]
        );
    };

    const periodLabel = period === '24h' ? '24 Giờ Qua' :
        period === '7d' ? '7 Ngày Qua' :
            period === '30d' ? '30 Ngày Qua' : 'Tất Cả';

    const totalRevenue = stats?.totalRevenue ?? 0;
    const orderCount = stats?.orderCount ?? 0;

    // Heat map data (30 days)
    const heatmapData = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            intensity: Math.random(),
        }));
    }, []);

    const getHeatColor = (intensity: number) => {
        if (intensity < 0.1) return '#F0F4F5';
        if (intensity < 0.3) return '#BBF7D0';
        if (intensity < 0.5) return '#4ADE80';
        if (intensity < 0.75) return '#16A34A';
        return '#15803D';
    };

    const TOP_SPENDERS = [
        { name: 'Alex M.', role: 'Engineering Lead', spend: 420, tools: 4, avatar: '👨‍💻' },
        { name: 'Sarah K.', role: 'Data Scientist', spend: 310, tools: 3, avatar: '👩‍🔬' },
        { name: 'Mike R.', role: 'Frontend Dev', spend: 200, tools: 2, avatar: '👨‍💼' },
    ];

    const HEATMAP_TOOLS = ['📺', '🏠', '🔍'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIcon}>
                                <Ionicons name="stats-chart-outline" size={22} color="#334155" />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>Financial Overview</Text>
                                <Text style={styles.headerSub}>Real-time spending analysis</Text>
                            </View>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.datePill} onPress={handlePeriodChange}>
                                <Ionicons name="calendar-outline" size={14} color="#334155" />
                                <Text style={styles.datePillText}>{periodLabel}</Text>
                                <Ionicons name="chevron-down" size={14} color="#334155" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.downloadBtn}>
                                <Ionicons name="download-outline" size={18} color="#334155" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* KPI cards row */}
                    <View style={styles.kpiRow}>
                        {/* Total Spend */}
                        <View style={styles.kpiCard}>
                            <View style={styles.kpiTop}>
                                <Text style={styles.kpiLabel}>TOTAL SPEND</Text>
                                <Ionicons name="card-outline" size={16} color="#94A3B8" />
                            </View>
                            <Text style={styles.kpiValue}>${totalRevenue.toFixed(2)}</Text>
                            <View style={styles.kpiBadge}>
                                <Ionicons name="trending-up" size={12} color="#16A34A" />
                                <Text style={styles.kpiBadgeText}>+12.5% vs last month</Text>
                            </View>
                            {/* Sparkline (mock) */}
                            <View style={styles.sparkline}>
                                {[5, 8, 6, 9, 7, 11, 10, 13, 12].map((h, i) => (
                                    <View key={i} style={[styles.sparkBar, { height: h * 2.5, backgroundColor: '#16A34A' }]} />
                                ))}
                            </View>
                        </View>

                        {/* Active Users */}
                        <View style={styles.kpiCard}>
                            <View style={styles.kpiTop}>
                                <Text style={styles.kpiLabel}>ACTIVE USERS</Text>
                                <Ionicons name="people-outline" size={16} color="#94A3B8" />
                            </View>
                            <Text style={styles.kpiValueLarge}>{orderCount + 10}</Text>
                            <View style={[styles.kpiBadge, { backgroundColor: '#DBEAFE' }]}>
                                <Text style={[styles.kpiBadgeText, { color: '#2563EB' }]}>+2 this week</Text>
                            </View>
                            {/* Mini bar chart */}
                            <View style={styles.miniBarRow}>
                                {[20, 40, 50, 60, 80, 60, 100].map((h, i) => (
                                    <View key={i} style={[styles.miniBar, { height: (h / 100) * 32, backgroundColor: i === 6 ? '#2563EB' : '#E2E8F0' }]} />
                                ))}
                            </View>
                        </View>

                        {/* Unused Seats */}
                        <View style={styles.kpiCard}>
                            <View style={styles.kpiTop}>
                                <Text style={styles.kpiLabel}>UNUSED SEATS</Text>
                                <Ionicons name="warning-outline" size={16} color="#EF4444" />
                            </View>
                            <Text style={styles.kpiValueLarge}>3</Text>
                            <Text style={styles.redLabel}>Opportunity to save</Text>
                            <TouchableOpacity style={styles.kpiLink}>
                                <Text style={styles.kpiLinkText}>Manage Seats →</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Next Invoice */}
                        <View style={styles.kpiCard}>
                            <View style={styles.kpiTop}>
                                <Text style={styles.kpiLabel}>NEXT INVOICE</Text>
                                <Ionicons name="receipt-outline" size={16} color="#94A3B8" />
                            </View>
                            <Text style={styles.kpiDate}>Nov 01</Text>
                            <Text style={styles.kpiEstimate}>Est. $1,240</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '35%' }]} />
                            </View>
                            <Text style={styles.daysLeft}>21 days left</Text>
                        </View>
                    </View>

                    {/* Bottom section */}
                    <View style={styles.bottomRow}>
                        {/* Seat Utilization Heatmap */}
                        <View style={[styles.card, styles.heatmapCard]}>
                            <View style={styles.heatmapHeader}>
                                <Text style={styles.cardTitle}>Seat Utilization Intensity</Text>
                                <View style={styles.legendRow}>
                                    <Text style={styles.legendLabel}>Less</Text>
                                    {['#F0F4F5', '#BBF7D0', '#4ADE80', '#16A34A', '#15803D'].map((c, i) => (
                                        <View key={i} style={[styles.legendBox, { backgroundColor: c }]} />
                                    ))}
                                    <Text style={styles.legendLabel}>More</Text>
                                </View>
                            </View>

                            {/* Day numbers */}
                            <View style={styles.dayHeaders}>
                                {Array.from({ length: 15 }, (_, i) => (
                                    <Text key={i} style={styles.dayNum}>{i * 2 + 1}</Text>
                                ))}
                            </View>

                            {/* Heatmap grid - 3 rows (tools) x 30 cols */}
                            {HEATMAP_TOOLS.map((tool, rowIdx) => (
                                <View key={rowIdx} style={styles.heatmapRow}>
                                    <Text style={styles.heatmapToolIcon}>{tool}</Text>
                                    {heatmapData.map((day, colIdx) => (
                                        <View
                                            key={colIdx}
                                            style={[styles.heatCell, { backgroundColor: getHeatColor(day.intensity) }]}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>

                        {/* Top Spenders */}
                        <View style={[styles.card, styles.spendersCard]}>
                            <Text style={styles.cardTitle}>Top Spenders</Text>
                            {TOP_SPENDERS.map((s, i) => (
                                <View key={i} style={styles.spenderRow}>
                                    <View style={styles.spenderAvatar}>
                                        <Text style={{ fontSize: 20 }}>{s.avatar}</Text>
                                    </View>
                                    <View style={styles.spenderInfo}>
                                        <Text style={styles.spenderName}>{s.name}</Text>
                                        <Text style={styles.spenderRole}>{s.role}</Text>
                                    </View>
                                    <View style={styles.spenderRight}>
                                        <Text style={styles.spenderSpend}>${s.spend}</Text>
                                        <Text style={styles.spenderTools}>{s.tools} TOOLS</Text>
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.viewAllBtn}>
                                <Text style={styles.viewAllBtnText}>View All Members</Text>
                            </TouchableOpacity>
                        </View>
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
    scroll: { flex: 1 },
    content: {
        padding: 24,
        gap: 20,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    headerIcon: {
        width: 44,
        height: 44,
        backgroundColor: '#F8FAFC',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
    },
    datePillText: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '500',
    },
    downloadBtn: {
        width: 38,
        height: 38,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    // KPI Row
    kpiRow: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 16,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 6,
    },
    kpiTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    kpiLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: -0.5,
    },
    kpiValueLarge: {
        fontSize: 36,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
    },
    kpiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    kpiBadgeText: {
        fontSize: 11,
        color: '#16A34A',
        fontWeight: '600',
    },
    sparkline: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 3,
        marginTop: 10,
        height: 36,
    },
    sparkBar: {
        width: 4,
        borderRadius: 2,
    },
    miniBarRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        marginTop: 10,
        height: 36,
    },
    miniBar: {
        flex: 1,
        borderRadius: 2,
    },
    redLabel: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
    },
    kpiLink: {
        marginTop: 8,
    },
    kpiLinkText: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '600',
    },
    kpiDate: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    kpiEstimate: {
        fontSize: 13,
        color: '#64748B',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        marginTop: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0F172A',
        borderRadius: 3,
    },
    daysLeft: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'right',
    },

    // Bottom section
    bottomRow: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 16,
        alignItems: Platform.OS === 'web' ? 'flex-start' : 'stretch',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    heatmapCard: {
        flex: Platform.OS === 'web' ? 2 : undefined,
    },
    spendersCard: {
        flex: Platform.OS === 'web' ? 1 : undefined,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
    },

    // Heatmap
    heatmapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendLabel: {
        fontSize: 11,
        color: '#94A3B8',
    },
    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    dayHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 28,
        marginBottom: 6,
    },
    dayNum: {
        fontSize: 9,
        color: '#94A3B8',
        textAlign: 'center',
        width: 16,
    },
    heatmapRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: 4,
    },
    heatmapToolIcon: {
        fontSize: 14,
        width: 22,
        textAlign: 'center',
    },
    heatCell: {
        width: 16,
        height: 16,
        borderRadius: 3,
    },

    // Top spenders
    spenderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        gap: 12,
    },
    spenderAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spenderInfo: {
        flex: 1,
    },
    spenderName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    spenderRole: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    spenderRight: {
        alignItems: 'flex-end',
    },
    spenderSpend: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    spenderTools: {
        fontSize: 10,
        color: '#94A3B8',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    viewAllBtn: {
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    viewAllBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
});
