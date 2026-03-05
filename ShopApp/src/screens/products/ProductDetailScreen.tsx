import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator, Modal
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
import { FormInput } from '../../components/FormInput';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ENVIRONMENTS = [
    { icon: 'terminal-outline', label: 'Cursor IDE', sub: 'Tích hợp sẵn' },
    { icon: 'code-slash-outline', label: 'VS Code', sub: 'Extension' },
    { icon: 'search-outline', label: 'Raycast', sub: 'Gói Pro' },
    { icon: 'globe-outline', label: 'REST API', sub: 'Trực tiếp' },
];

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    // 1. Lấy dữ liệu từ params truyền sang
    const initialProduct = route.params.product;
    const [product, setProduct] = useState(initialProduct);
    const { addToCart } = useCart();
    const { checkout } = useOrder();
    const { user } = useAuth();
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [purchaseEmail, setPurchaseEmail] = useState(user?.email || '');

    // Debug Data Flow
    React.useEffect(() => {
        console.log('[ProductDetail] Loaded with ID:', product?.id);
        if (!product || !product.id) {
            console.warn('[ProductDetail] DATA DISCONNECT: No valid product ID found!');
        }
    }, [product]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAdd = async () => {
        if (!user) {
            Toast.show({ type: 'error', text1: 'Yêu cầu đăng nhập', text2: 'Vui lòng đăng nhập để sử dụng tính năng này.' });
            return;
        }
        try {
            await addToCart(product.id, 1);
            setAdded(true);
            Toast.show({ type: 'success', text1: '✓ Đã thêm vào giỏ', text2: product.name });

            setTimeout(() => {
                setAdded(false);
                navigation.navigate('CustomerTabs' as any, { screen: 'Cart' });
            }, 800);
        } catch (e: any) {
            console.error('[ProductDetail] handleAdd error:', e);
            // HIỆN LỖI CHI TIẾT ĐỂ DEBUG
            Toast.show({
                type: 'error',
                text1: 'Lỗi thêm giỏ hàng',
                text2: e.message || 'Sự cố không xác định'
            });
        }
    };

    const confirmPurchase = async () => {
        if (!validateEmail(purchaseEmail)) {
            Toast.show({ type: 'error', text1: 'Lỗi Email', text2: 'Vui lòng nhập email hợp lệ để nhận bản quyền.' });
            return;
        }

        setShowEmailModal(false);
        setLoading(true);
        try {
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
                    text1: 'Thanh toán hoàn tất',
                    text2: `Giấy phép đã được gửi tới: ${purchaseEmail}`
                });
                navigation.navigate('OrderHistory' as any);
            } else {
                Toast.show({ type: 'error', text1: 'Giao dịch thất bại', text2: 'Hệ thống từ chối thanh toán. Vui lòng kiểm lại giỏ hàng.' });
            }
        } catch (e: any) {
            console.error('Buy Now error:', e);
            Toast.show({
                type: 'error',
                text1: 'Lỗi hệ thống',
                text2: e.message || 'Không thể kết nối cơ sở dữ liệu.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            navigation.navigate('Auth' as any);
            return;
        }
        setShowEmailModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Image Header */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                    <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.imageGradient} />
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>{product.tier.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.chapterMarker}>CHAPTER III · CAPABILITIES</Text>
                    <Text style={styles.title}>{product.name}</Text>
                    <Text style={styles.price}>${product.price.toLocaleString()}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>MÔ TẢ HỆ THỐNG</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>TƯƠNG THÍCH MÔI TRƯỜNG</Text>
                    <View style={styles.envGrid}>
                        {ENVIRONMENTS.map((env, idx) => (
                            <View key={idx} style={styles.envItem}>
                                <View style={styles.envIconBox}>
                                    <Ionicons name={env.icon as any} size={20} color={ShopifyTheme.colors.accent} />
                                </View>
                                <View>
                                    <Text style={styles.envLabel}>{env.label}</Text>
                                    <Text style={styles.envSub}>{env.sub}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.cartBtn, added && styles.cartBtnAdded]}
                    onPress={handleAdd}
                >
                    <Ionicons
                        name={added ? "checkmark-circle" : "bag-add-outline"}
                        size={22}
                        color={added ? "#000" : "#FFF"}
                    />
                    <Text style={[styles.cartBtnText, added && { color: '#000' }]}>
                        {added ? "ĐÃ THÊM" : "GIỎ HÀNG"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buyBtn, loading && { opacity: 0.7 }]}
                    onPress={handleBuyNow}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.buyBtnText}>MUA NGAY</Text>
                            <Ionicons name="flash" size={18} color="#000" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Email Verification Modal */}
            <Modal visible={showEmailModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconBox}>
                            <Ionicons name="mail-unread-outline" size={32} color={ShopifyTheme.colors.accent} />
                        </View>
                        <Text style={styles.modalTitle}>Xác nhận Email</Text>
                        <Text style={styles.modalDesc}>
                            Bản quyền AI và hướng dẫn kích hoạt sẽ được gửi tới địa chỉ email này.
                        </Text>
                        <FormInput
                            label="GMAIL NHẬN BẢN QUYỀN"
                            value={purchaseEmail}
                            onChangeText={setPurchaseEmail}
                            placeholder="user@gmail.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={{ marginBottom: 20 }}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEmailModal(false)}>
                                <Text style={styles.cancelBtnText}>HỦY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmPurchase}>
                                <Text style={styles.confirmBtnText}>XÁC NHẬN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ShopifyTheme.colors.background },
    scroll: { flex: 1 },
    imageContainer: { height: 400, position: 'relative' },
    image: { width: '100%', height: '100%' },
    imageGradient: { ...StyleSheet.absoluteFillObject },
    backBtn: { position: 'absolute', top: 60, left: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    tierBadge: { position: 'absolute', bottom: 24, right: 24, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: ShopifyTheme.colors.accent },
    tierText: { color: '#000', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
    content: { padding: 32, paddingBottom: 120 },
    chapterMarker: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 24 },
    title: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -1.5, marginBottom: 12 },
    price: { color: ShopifyTheme.colors.accent, fontSize: 24, fontWeight: '900', marginBottom: 32 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 32 },
    sectionTitle: { color: ShopifyTheme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 20 },
    description: { color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 26, fontWeight: '500' },
    envGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
    envItem: { width: '45%', flexDirection: 'row', gap: 12, alignItems: 'center' },
    envIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
    envLabel: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    envSub: { color: ShopifyTheme.colors.textMuted, fontSize: 11 },
    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, flexDirection: 'row', gap: 16, backgroundColor: 'rgba(0,0,0,0.8)' },
    cartBtn: { flex: 1, height: 60, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    cartBtnAdded: { backgroundColor: ShopifyTheme.colors.accent, borderColor: ShopifyTheme.colors.accent },
    cartBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
    buyBtn: { flex: 1.5, height: 60, borderRadius: 30, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    buyBtnText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { width: '100%', backgroundColor: '#111827', borderRadius: 32, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(94,234,212,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'center' },
    modalTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
    modalDesc: { color: ShopifyTheme.colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: '800' },
    confirmBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: ShopifyTheme.colors.accent, alignItems: 'center', justifyContent: 'center' },
    confirmBtnText: { color: '#000', fontWeight: '900' },
});
