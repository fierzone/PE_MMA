import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, SafeAreaView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useCart } from '../../context/CartContext';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const TECH_SPECS = [
    { label: 'Cửa sổ ngữ cảnh', value: '200k tokens' },
    { label: 'Tốc độ xử lý', value: '~100 t/s' },
    { label: 'Dữ liệu đến ngày', value: 'Tháng 4, 2024' },
    { label: 'Chi phí (Đầu vào)', value: '$3.00 / MTok' },
    { label: 'Chi phí (Đầu ra)', value: '$15.00 / MTok' },
];

const ENVIRONMENTS = [
    { icon: 'terminal-outline', label: 'Cursor IDE', sub: 'Tích hợp sẵn' },
    { icon: 'code-slash-outline', label: 'VS Code', sub: 'Yêu cầu Extension' },
    { icon: 'search-outline', label: 'Raycast', sub: 'Gói Pro' },
    { icon: 'globe-outline', label: 'REST API', sub: 'Truy cập trực tiếp' },
];

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { product } = route.params;
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = async () => {
        await addToCart(product.id, 1);
        setAdded(true);
        Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ', text2: product.name });
        setTimeout(() => setAdded(false), 2000);
    };

    const tierLabel = product.tier === 'Premium' ? 'Giấy phép Doanh nghiệp'
        : product.tier === 'Pro' ? 'Giấy phép Chuyên nghiệp'
            : 'Giấy phép Cơ bản';

    return (
        <SafeAreaView style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.navLinks}>
                    <Text style={styles.navLink}>Cửa hàng</Text>
                    <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                    <Text style={styles.navLink}>{product.tier}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                    <Text style={[styles.navLink, { color: '#0F172A', fontWeight: '600' }]}>{product.name.toUpperCase()}</Text>
                </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.splitLayout}>
                    {/* LEFT: sticky buy box */}
                    <View style={styles.leftPanel}>
                        {/* Breadcrumb */}
                        <View style={styles.breadcrumb}>
                            <Text style={styles.breadcrumbItem}>CỬA HÀNG</Text>
                            <Text style={styles.breadcrumbSep}>›</Text>
                            <Text style={styles.breadcrumbItem}>{product.tier.toUpperCase()}</Text>
                            <Text style={styles.breadcrumbSep}>›</Text>
                            <Text style={[styles.breadcrumbItem, { color: '#64748B' }]}>{product.name.toUpperCase()}</Text>
                        </View>

                        {/* Thumbnail */}
                        <View style={styles.thumbBox}>
                            <Image source={{ uri: product.image }} style={styles.thumbImage} resizeMode="contain" />
                        </View>

                        {/* Product info */}
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.maker}>{product.description?.split('.')[0] || 'Minimalist Prime'}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                            <Text style={styles.priceUnit}> / month</Text>
                        </View>

                        <Text style={styles.licenseLabel}>{tierLabel}</Text>

                        <TouchableOpacity
                            style={[styles.addBtn, added && styles.addBtnAdded]}
                            onPress={handleAdd}
                        >
                            <Text style={styles.addBtnText}>
                                {added ? '✓ ĐÃ THÊM VÀO GIỎ' : 'MUA GIẤY PHÉP →'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.deliveryNote}>Giao mã API ngay lập tức sau khi xác nhận thanh toán.</Text>
                    </View>

                    {/* RIGHT: description + specs */}
                    <View style={styles.rightPanel}>
                        <Text style={styles.description}>
                            {product.description || 'The most intelligent model to date. Excelling at complex reasoning, nuance, and creative coding tasks.'}
                        </Text>

                        {/* Technical Specifications */}
                        <View style={styles.specSection}>
                            <View style={styles.specHeader}>
                                <Ionicons name="hardware-chip-outline" size={14} color="#16869C" />
                                <Text style={styles.specSectionTitle}>THÔNG SỐ KỸ THUẬT</Text>
                            </View>
                            {TECH_SPECS.map((s, i) => (
                                <View key={i} style={styles.specRow}>
                                    <Text style={styles.specLabel}>{s.label}</Text>
                                    <Text style={styles.specValue}>{s.value}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Benchmark visual placeholder */}
                        <View style={styles.benchmarkBox}>
                            <Ionicons name="stats-chart-outline" size={36} color="#CBD5E1" />
                            <Text style={styles.benchmarkLabel}>Biểu đồ Hiệu năng</Text>
                        </View>

                        {/* Compatible Environments */}
                        <View style={styles.specSection}>
                            <View style={styles.specHeader}>
                                <Ionicons name="diamond-outline" size={14} color="#16869C" />
                                <Text style={styles.specSectionTitle}>MÔI TRƯỜNG TƯƠNG THÍCH</Text>
                            </View>
                            <View style={styles.envGrid}>
                                {ENVIRONMENTS.map((env, i) => (
                                    <View key={i} style={styles.envCard}>
                                        <Ionicons name={env.icon as any} size={22} color="#334155" />
                                        <View>
                                            <Text style={styles.envLabel}>{env.label}</Text>
                                            <Text style={styles.envSub}>{env.sub}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Enterprise CTA */}
                        <View style={styles.enterpriseBox}>
                            <Text style={styles.enterpriseTitle}>Triển khai Doanh nghiệp?</Text>
                            <Text style={styles.enterpriseText}>
                                Đối với các tổ chức yêu cầu tuân thủ SOC2, phiên bản chuyên dụng hoặc tinh chỉnh riêng, vui lòng liên hệ bộ phận bán hàng doanh nghiệp của chúng tôi.
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.enterpriseLink}>Liên hệ Bán hàng ↗</Text>
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
        backgroundColor: '#FFFFFF',
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        padding: 4,
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    navLink: {
        fontSize: 13,
        color: '#94A3B8',
    },
    scroll: {
        flex: 1,
    },
    splitLayout: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        minHeight: 600,
    },

    // Left
    leftPanel: {
        width: Platform.OS === 'web' ? '40%' : '100%',
        padding: 32,
        borderRightWidth: Platform.OS === 'web' ? 1 : 0,
        borderRightColor: '#F1F5F9',
        borderBottomWidth: Platform.OS === 'web' ? 0 : 1,
        borderBottomColor: '#F1F5F9',
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    breadcrumbItem: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    breadcrumbSep: {
        fontSize: 12,
        color: '#CBD5E1',
    },
    thumbBox: {
        width: 100,
        height: 100,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    thumbImage: {
        width: '80%',
        height: '80%',
    },
    productName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
        marginBottom: 4,
    },
    maker: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    price: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    priceUnit: {
        fontSize: 14,
        color: '#64748B',
    },
    licenseLabel: {
        fontSize: 13,
        color: '#16869C',
        fontWeight: '500',
        marginBottom: 24,
    },
    addBtn: {
        backgroundColor: '#16869C',
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    addBtnAdded: {
        backgroundColor: '#059669',
    },
    addBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 1,
    },
    deliveryNote: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 16,
    },

    // Right
    rightPanel: {
        flex: 1,
        padding: 40,
        gap: 40,
    },
    description: {
        fontSize: 22,
        color: '#0F172A',
        lineHeight: 34,
        fontWeight: '400',
        letterSpacing: -0.3,
    },
    specSection: {
        gap: 16,
    },
    specHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    specSectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1.5,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    specLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    specValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    benchmarkBox: {
        height: 180,
        backgroundColor: '#F8FAFC',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    benchmarkLabel: {
        fontSize: 11,
        color: '#CBD5E1',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 1,
    },
    envGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    envCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '47%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 6,
        padding: 14,
    },
    envLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    envSub: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 2,
    },
    enterpriseBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 24,
        gap: 12,
    },
    enterpriseTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    enterpriseText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
    },
    enterpriseLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#16869C',
        textDecorationLine: 'underline',
    },
});
