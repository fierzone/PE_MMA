import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ENVIRONMENTS = [
    { icon: 'terminal-outline', label: 'Cursor IDE', sub: 'Tích hợp sẵn' },
    { icon: 'code-slash-outline', label: 'VS Code', sub: 'Extension' },
    { icon: 'search-outline', label: 'Raycast', sub: 'Gói Pro' },
    { icon: 'globe-outline', label: 'REST API', sub: 'Trực tiếp' },
];

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { product } = route.params;
    const { addToCart } = useCart();
    const { checkout } = useOrder();
    const { user } = useAuth();
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAdd = async () => {
        await addToCart(product.id, 1);
        setAdded(true);
        Toast.show({ type: 'success', text1: '✓ Đã thêm vào giỏ', text2: product.name });
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = async () => {
        if (!user) {
            navigation.navigate('Auth' as any);
            return;
        }

        if (!validateEmail(user.email)) {
            Toast.show({ type: 'error', text1: 'Lỗi xác thực', text2: 'Email của bạn không hợp lệ.' });
            return;
        }

        setLoading(true);
        try {
            // Create a detailed item for checkout
            const items = [{
                id: Date.now(),
                productId: product.id,
                quantity: 1,
                product: product
            }];

            const success = await checkout(items as any, product.price);
            if (success) {
                Toast.show({
                    type: 'success',
                    text1: 'Thanh toán thành công',
                    text2: 'Bản quyền AI đã được kích hoạt và gửi tới email của bạn.'
                });
                navigation.navigate('CustomerTabs', { screen: 'Cart' } as any);
            } else {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thực hiện giao dịch.' });
            }
        } catch (e) {
            console.error('Buy Now error:', e);
            Toast.show({ type: 'error', text1: 'Lỗi hệ thống', text2: 'Vui lòng thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    const tierLabel = product.tier === 'Premium' ? 'DOANH NGHIỆP'
        : product.tier === 'Pro' ? 'CHUYÊN NGHIỆP' : 'CƠ BẢN';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color="#FFF" />
                </TouchableOpacity>
                <div style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.breadcrumbItem}>CỬA HÀNG</Text>
                    <Text style={styles.breadcrumbSep}> › </Text>
                    <Text style={[styles.breadcrumbItem, { color: ShopifyTheme.colors.accent }]}>
                        {product.name.toUpperCase()}
                    </Text>
                </div>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.splitLayout}>

                    {/* LEFT: Buy box */}
                    <View style={styles.leftPanel}>
                        <View style={styles.thumbBox}>
                            <Image source={{ uri: product.image }} style={styles.thumbImage} resizeMode="contain" />
                        </View>

                        <View style={styles.tierRow}>
                            <Text style={styles.tierBadge}>{tierLabel}</Text>
                        </View>

                        <Text style={styles.productName}>{product.name}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                            <Text style={styles.priceUnit}> / tháng</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.addBtn, added && styles.addBtnAdded]}
                            onPress={handleAdd}
                            activeOpacity={0.9}
                            disabled={loading}
                        >
                            <Text style={styles.addBtnText}>
                                {added ? '✓ ĐÃ THÊM VÀO GIỎ' : 'THÊM VÀO GIỎ HÀNG'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buyBtn}
                            onPress={handleBuyNow}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buyBtnText}>MUA NGAY →</Text>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.deliveryNote}>Giao mã API ngay lập tức sau xác nhận</Text>
                    </View>

                    {/* RIGHT: Details */}
                    <View style={styles.rightPanel}>
                        <Text style={styles.description}>
                            {product.description || 'Công cụ AI thế hệ mới. Xuất sắc ở khả năng suy luận phức tạp và viết code.'}
                        </Text>

                        {/* Environments */}
                        <View style={styles.envSection}>
                            <Text style={styles.envTitle}>MÔI TRƯỜNG TƯƠNG THÍCH</Text>
                            <View style={styles.envGrid}>
                                {ENVIRONMENTS.map((env, i) => (
                                    <View key={i} style={styles.envCard}>
                                        <Ionicons name={env.icon as any} size={20} color={ShopifyTheme.colors.accent} />
                                        <View>
                                            <Text style={styles.envLabel}>{env.label}</Text>
                                            <Text style={styles.envSub}>{env.sub}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Enterprise Box */}
                        <LinearGradient colors={['#111827', '#0F172A']} style={styles.enterpriseBox}>
                            <Text style={styles.enterpriseTitle}>Triển khai Doanh nghiệp?</Text>
                            <Text style={styles.enterpriseText}>
                                Yêu cầu tuân thủ SOC2, phiên bản riêng hoặc tinh chỉnh, liên hệ bộ phận bán hàng.
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.enterpriseLink}>Liên hệ Bán hàng ↗</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navbar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 16,
    },
    backBtn: { padding: 4 },
    breadcrumbItem: { fontSize: 11, fontWeight: '800', color: ShopifyTheme.colors.textMuted, letterSpacing: 1 },
    breadcrumbSep: { fontSize: 12, color: 'rgba(255,255,255,0.2)' },
    scroll: { flex: 1 },
    splitLayout: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    },
    leftPanel: {
        width: Platform.OS === 'web' ? '40%' : '100%',
        padding: 32,
        borderRightWidth: Platform.OS === 'web' ? 1 : 0,
        borderRightColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: Platform.OS === 'web' ? 0 : 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    thumbBox: {
        width: 120, height: 120,
        backgroundColor: '#111827',
        borderRadius: 24, marginBottom: 24,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    thumbImage: { width: '70%', height: '70%' },
    tierRow: { marginBottom: 12 },
    tierBadge: {
        color: ShopifyTheme.colors.accent,
        fontSize: 11, fontWeight: '900', letterSpacing: 2,
    },
    productName: {
        color: '#FFF', fontSize: 32, fontWeight: '900',
        letterSpacing: -1, marginBottom: 16,
    },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 32 },
    price: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
    priceUnit: { color: ShopifyTheme.colors.textMuted, fontSize: 16 },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100,
        paddingVertical: 18, alignItems: 'center', marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    addBtnAdded: { backgroundColor: ShopifyTheme.colors.accent, borderColor: ShopifyTheme.colors.accent },
    addBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
    buyBtn: {
        backgroundColor: '#FFF', borderRadius: 100,
        paddingVertical: 18, alignItems: 'center', marginBottom: 16,
    },
    buyBtnText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
    deliveryNote: { color: ShopifyTheme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },

    rightPanel: { flex: 1, padding: 40, gap: 48 },
    description: {
        color: 'rgba(255,255,255,0.8)', fontSize: 20,
        lineHeight: 32, fontWeight: '400', letterSpacing: -0.3,
    },
    envSection: { gap: 20 },
    envTitle: {
        color: ShopifyTheme.colors.textMuted, fontSize: 11,
        fontWeight: '900', letterSpacing: 2, marginBottom: 8,
    },
    envGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    envCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        width: Platform.OS === 'web' ? '47%' : '100%',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    envLabel: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    envSub: { color: ShopifyTheme.colors.textMuted, fontSize: 11, marginTop: 2 },
    enterpriseBox: {
        borderRadius: 24, padding: 32, gap: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    enterpriseTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    enterpriseText: { color: ShopifyTheme.colors.textMuted, fontSize: 14, lineHeight: 22 },
    enterpriseLink: {
        color: ShopifyTheme.colors.accent, fontSize: 14,
        fontWeight: '800', textDecorationLine: 'underline',
    },
});
