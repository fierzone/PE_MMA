import React, { useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZE, gs, ELEVATION } from '../theme/theme';
import { useCart, useAuth } from '../context/AppContext';
import { placeOrder } from '../database/database';

export default function CartScreen({ navigation }) {
    const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
    const { user } = useAuth();
    const [checkingOut, setCheckingOut] = useState(false);

    // Nút Thanh toán đơn hàng
    const handleCheckout = () => {
        if (items.length === 0) return;
        Alert.alert(
            '🛍️ Xác Nhận Mua Hàng',
            `Tổng thanh toán là $${totalPrice.toFixed(2)}?`,
            [
                { text: 'Hủy bỏ', style: 'cancel' },
                {
                    text: 'Đặt hàng',
                    onPress: async () => {
                        setCheckingOut(true);
                        try {
                            // Gửi order chi tiết vào SQLite
                            await placeOrder(user.id, items, totalPrice);
                            clearCart();
                            Alert.alert(
                                '🎉 Thành công!',
                                'Đơn hàng của bạn đã được ghi nhận.',
                                [{ text: 'Xem Thống Kê', onPress: () => navigation.navigate('Revenue') },
                                { text: 'Tiếp tục Mua sắm', onPress: () => navigation.goBack() }]
                            );
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể đặt hàng. Mời thử lại sau.');
                        } finally {
                            setCheckingOut(false);
                        }
                    },
                },
            ]
        );
    };

    // Render các Dòng trong Giỏ hàng
    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            {/* Phía trái: Hình Ảnh hiển thị */}
            <View style={styles.itemImageWrap}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.itemImage, styles.imagePlaceholder]}>
                        <Ionicons name="cube-outline" size={28} color={COLORS.borderHigh} />
                    </View>
                )}
            </View>

            {/* Phía phải: Thông tin & số lượng */}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

                <View style={styles.itemBottomRow}>
                    <Text style={styles.itemSubtotal}>Tổng: ${(item.price * item.quantity).toFixed(2)}</Text>

                    <View style={styles.qtyControl}>
                        <TouchableOpacity style={styles.qtyBtnBg} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Ionicons name="remove" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtnBg} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Ionicons name="add" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Nút Xóa mặt hàng này */}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
                <View style={styles.deleteBtnBg}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </View>
            </TouchableOpacity>
        </View>
    );

    // Giao diện khi chưa có hàng gì trong giỏ
    const renderEmpty = () => (
        <View style={styles.empty}>
            <View style={styles.emptyIconBg}>
                <Ionicons name="cart-outline" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng rỗng</Text>
            <Text style={styles.emptySubtitle}>Có vẻ bạn vẫn chưa bỏ bất kỳ sản phẩm nào vào trong này.</Text>

            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={{ marginTop: 24 }}>
                <LinearGradient colors={COLORS.gradPrimary} style={styles.shopBtn} start={[0, 0]} end={[1, 1]}>
                    <Text style={styles.shopBtnText}>Bắt Nhịp Mua Sắm Bắt Buộc</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.root}>
            <SafeAreaView style={gs.safe}>

                {/* Top Navbar Header */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backBtnBg}>
                            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Giỏ Hàng</Text>
                    <View style={styles.badgeWrap}>
                        <Text style={styles.topBadgeText}>{totalItems}</Text>
                    </View>
                </View>

                {/* Thanh Menu Nhanh Để Xóa Toàn Cục */}
                {items.length > 0 && (
                    <View style={styles.headerSection}>
                        <Text style={styles.itemListTitle}>{items.length} Sản Phẩm Khác Nhau</Text>
                        <TouchableOpacity onPress={() => { Alert.alert('Làm Sạch Giỏ', 'Loại bỏ toàn bộ?', [{ text: 'Theo đó', style: 'cancel' }, { text: 'Quét đi', style: 'destructive', onPress: clearCart }]); }}>
                            <Text style={styles.clearText}>Xóa Trống</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Danh sách List renderItem cuộn */}
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={[styles.list, items.length === 0 && { flex: 1, justifyContent: 'center' }]}
                    showsVerticalScrollIndicator={false}
                />

                {/* Khu vực Xác nhận Tổng Kết Thức */}
                {items.length > 0 && (
                    <View style={styles.summaryWrap}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tiền mua</Text>
                            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, { marginTop: 8 }]}>
                            <Text style={styles.summaryLabel}>Phí giao vận (Khuyến mãi)</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.success }]}>MIỄN PHÍ</Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Giá Nhận Cuối</Text>
                            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity onPress={handleCheckout} disabled={checkingOut} activeOpacity={0.85}>
                            <LinearGradient colors={COLORS.gradPrimary} style={styles.checkoutBtn} start={[0, 0]} end={[1, 1]}>
                                {checkingOut ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Ionicons name="card-outline" size={20} color="#fff" />
                                        <Text style={styles.checkoutText}>Thanh Toán Toàn Bộ</Text>
                                        <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" style={{ position: 'absolute', right: 24 }} />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
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
    topTitle: { fontSize: SIZE.lg, fontWeight: FONT.bold, color: COLORS.text },
    badgeWrap: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryGlow,
        alignItems: 'center', justifyContent: 'center',
    },
    topBadgeText: { color: COLORS.primaryLight, fontSize: SIZE.sm, fontWeight: FONT.bold },
    headerSection: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SIZE.pad, marginBottom: 16,
    },
    itemListTitle: { fontSize: SIZE.base, fontWeight: FONT.semiBold, color: COLORS.text },
    clearText: { color: COLORS.error, fontSize: SIZE.sm, fontWeight: FONT.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
    list: { paddingHorizontal: SIZE.pad, paddingBottom: 30 },
    cartItem: {
        flexDirection: 'row', backgroundColor: COLORS.surfaceHigh, borderRadius: SIZE.rLg,
        padding: 12, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
        ...ELEVATION.sm, position: 'relative',
    },
    itemImageWrap: { marginRight: 16 },
    itemImage: { width: 85, height: 85, borderRadius: SIZE.r },
    imagePlaceholder: { backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1, justifyContent: 'center', paddingRight: 36 },
    itemName: { fontSize: SIZE.base, fontWeight: FONT.bold, color: COLORS.text, marginBottom: 4 },
    itemPrice: { fontSize: SIZE.lg, color: COLORS.primary, fontWeight: FONT.black, marginBottom: 10 },
    itemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    itemSubtotal: { fontSize: SIZE.xs, color: COLORS.textMuted, fontWeight: FONT.semiBold },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    qtyBtnBg: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
    },
    qtyText: { fontSize: SIZE.sm, fontWeight: FONT.bold, color: COLORS.text, minWidth: 16, textAlign: 'center' },
    deleteBtn: { position: 'absolute', top: 12, right: 12 },
    deleteBtnBg: {
        width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.roseDim,
        alignItems: 'center', justifyContent: 'center',
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -60 },
    emptyIconBg: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primaryGlow,
        alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    emptyTitle: { fontSize: SIZE.xxl, fontWeight: FONT.bold, color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: SIZE.base, color: COLORS.textSoft, textAlign: 'center', maxWidth: 220 },
    shopBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: SIZE.r, ...ELEVATION.md },
    shopBtnText: { color: '#fff', fontWeight: FONT.bold, fontSize: SIZE.base, letterSpacing: 0.5 },
    summaryWrap: {
        backgroundColor: COLORS.surfaceHigh, paddingHorizontal: SIZE.pad, paddingTop: SIZE.pad, paddingBottom: 34,
        borderTopWidth: 1, borderTopColor: COLORS.border, ...ELEVATION.lg,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: SIZE.sm, color: COLORS.textSoft, fontWeight: FONT.medium },
    summaryValue: { fontSize: SIZE.base, color: COLORS.text, fontWeight: FONT.bold },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 16, paddingTop: 16, marginBottom: 20,
    },
    totalLabel: { fontSize: SIZE.lg, fontWeight: FONT.bold, color: COLORS.text },
    totalValue: { fontSize: SIZE.xxl, fontWeight: FONT.black, color: COLORS.text, letterSpacing: -0.5 },
    checkoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        height: 60, borderRadius: SIZE.rLg,
    },
    checkoutText: { color: '#fff', fontSize: SIZE.lg, fontWeight: FONT.bold, letterSpacing: 0.5 },
});
