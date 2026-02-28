import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, Image,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs, ELEVATION, SCREEN } from '../theme/theme';
import { getProductById, deleteProduct } from '../database/database';
import { useCart } from '../context/AppContext';

export default function ProductDetailScreen({ route, navigation }) {
    const { productId } = route.params;
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    // Tải chi tiết 1 sản phẩm
    useEffect(() => {
        const load = async () => {
            const p = await getProductById(productId);
            setProduct(p);
            setLoading(false);
        };
        load();
    }, [productId]);

    // Hành động bấm nút thêm vào giỏ
    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        // Cho nút đổi thành dấy tích 2 giây
        setTimeout(() => setAdded(false), 2000);
    };

    // Hành động xóa
    const handleDelete = () => {
        Alert.alert('Xóa Sản Phẩm', `Bạn có muốn loại bỏ dòng: "${product.name}"?`, [
            { text: 'Hủy bỏ', style: 'cancel' },
            {
                text: 'Chắc chắn Xóa', style: 'destructive',
                onPress: async () => {
                    await deleteProduct(product.id);
                    navigation.goBack(); // quay về list sau khi xoá xong
                },
            },
        ]);
    };

    if (loading) return <View style={gs.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!product) return <View style={gs.center}><Text style={gs.body}>Sản phẩm không tồn tại</Text></View>;

    return (
        <View style={styles.root}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }} bounces={false}>

                {/* Hình ảnh sản phẩm (Hero Section) */}
                <View style={styles.imageWrap}>
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder]}>
                            <Ionicons name="cube-outline" size={80} color={COLORS.borderHigh} />
                        </View>
                    )}

                    {/* Làm mờ dần phần chuyển tiếp giữa ảnh và thân (Gradient Mask) */}
                    <LinearGradient colors={['rgba(8,8,18,0)', COLORS.bg]} style={styles.imageOverlay} />

                    {/* Các nút trên cùng (Top Nav) */}
                    <SafeAreaView style={styles.topNav} edges={['top']}>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </TouchableOpacity>

                        {/* Phím sửa & xoá */}
                        <View style={gs.row}>
                            <TouchableOpacity
                                style={styles.circleBtn}
                                onPress={() => navigation.navigate('EditProduct', { product })}
                            >
                                <Ionicons name="create-outline" size={20} color={COLORS.sky} />
                            </TouchableOpacity>
                            <View style={{ width: 12 }} />
                            <TouchableOpacity style={styles.circleBtn} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Nội dung chi tiết */}
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{product.name}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceSign}>$</Text>
                        <Text style={styles.priceValue}>{product.price.toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={gs.sectionTitle}>Tổng quan thông tin</Text>
                    <Text style={styles.desc}>{product.description || 'Chưa cung cấp bất kỳ mô tả cho sản phẩm này.'}</Text>

                    {/* Thẻ meta ngày nhập - ID */}
                    <View style={styles.metaGrid}>
                        <View style={styles.metaCard}>
                            <View style={[styles.metaIconBg, { backgroundColor: COLORS.primaryGlow }]}>
                                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                            </View>
                            <Text style={styles.metaLabel}>Nhập ngày</Text>
                            <Text style={styles.metaVal}>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</Text>
                        </View>
                        <View style={styles.metaCard}>
                            <View style={[styles.metaIconBg, { backgroundColor: COLORS.roseDim }]}>
                                <Ionicons name="pricetag-outline" size={18} color={COLORS.rose} />
                            </View>
                            <Text style={styles.metaLabel}>Mã ID</Text>
                            <Text style={styles.metaVal}>#{product.id}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Dải điều hướng cuối cùng dính lề (Floating Footer) */}
            <View style={styles.footerWrap}>
                <LinearGradient colors={['rgba(8,8,18,0)', 'rgba(8,8,18,0.9)', COLORS.bgDeep]} style={styles.footerOverlay} />
                <View style={styles.footer}>

                    <View style={styles.footerPriceCol}>
                        <Text style={styles.footerTotalLabel}>Báo gía gốc</Text>
                        <Text style={styles.footerTotal}>${product.price.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.cartBtnTouch}
                        onPress={handleAddToCart}
                        activeOpacity={0.8}
                        disabled={added}
                    >
                        <LinearGradient
                            colors={added ? [COLORS.success, '#00C3A6'] : COLORS.gradPrimary}
                            style={styles.cartBtnGrad} start={[0, 0]} end={[1, 1]}
                        >
                            <Ionicons name={added ? 'checkmark-circle' : 'cart'} size={22} color="#fff" />
                            <Text style={styles.cartBtnText}>{added ? 'Đã Vào Giỏ!' : 'Cho Vào Giỏ Hàng'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    imageWrap: { position: 'relative', height: SCREEN.height * 0.45, width: '100%', backgroundColor: COLORS.surfaceHigh },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 },
    topNav: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SIZE.pad, paddingTop: 10,
    },
    circleBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', ...ELEVATION.sm,
    },
    content: { paddingHorizontal: SIZE.pad, marginTop: -20 },
    titleRow: { marginBottom: 16 },
    name: { fontSize: SIZE.xxxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -0.5, lineHeight: 42 },
    priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
    priceSign: { fontSize: SIZE.xl, fontWeight: FONT.bold, color: COLORS.primary, marginTop: 4, marginRight: 2 },
    priceValue: { fontSize: SIZE.hero, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -1 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
    desc: { fontSize: SIZE.base, color: COLORS.textSoft, lineHeight: 26, marginTop: 12 },
    metaGrid: { flexDirection: 'row', gap: 16, marginTop: 32 },
    metaCard: {
        flex: 1, backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg, padding: 16,
        borderWidth: 1, borderColor: COLORS.border,
    },
    metaIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    metaLabel: { fontSize: SIZE.xs, color: COLORS.textMuted, fontWeight: FONT.bold, textTransform: 'uppercase', marginBottom: 4 },
    metaVal: { fontSize: SIZE.lg, fontWeight: FONT.bold, color: COLORS.text },
    footerWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 60 },
    footerOverlay: { ...StyleSheet.absoluteFillObject },
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZE.pad, paddingBottom: Platform.OS === 'ios' ? 34 : SIZE.pad, paddingTop: SIZE.pad,
    },
    footerPriceCol: { marginRight: 16 },
    footerTotalLabel: { fontSize: SIZE.xs, color: COLORS.textMuted, fontWeight: FONT.bold, textTransform: 'uppercase' },
    footerTotal: { fontSize: SIZE.xxl, fontWeight: FONT.black, color: COLORS.text },
    cartBtnTouch: { flex: 1, ...ELEVATION.md },
    cartBtnGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        height: 60, borderRadius: SIZE.rLg,
    },
    cartBtnText: { color: '#fff', fontSize: SIZE.base, fontWeight: FONT.bold, letterSpacing: 0.5 },
});
