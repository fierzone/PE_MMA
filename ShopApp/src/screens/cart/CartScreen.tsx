import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, Modal, Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { CartItem } from '../../components/CartItem';
import { Ionicons } from '@expo/vector-icons';
import { ShopifyTheme } from '../../theme/ShopifyTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export const CartScreen: React.FC = () => {
    const { cartItems, totalPrice, fetchCart, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
    const { checkout } = useOrder();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [frozenTotal, setFrozenTotal] = useState(totalPrice);
    const isRealtime = React.useRef(false);

    useEffect(() => {
        if (!isRealtime.current) {
            setFrozenTotal(totalPrice);
        }
    }, [totalPrice]);

    useFocusEffect(
        useCallback(() => {
            isRealtime.current = false;
            fetchCart();
        }, [fetchCart])
    );

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        try {
            const success = await checkout(cartItems, totalPrice);
            if (success) {
                await clearCart();
                setShowSuccess(true);
            }
        } catch (e) {
            console.error('[CartScreen] checkout error:', e);
        } finally {
            setLoading(false);
        }
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.romanGroup}>
                <Text style={styles.roman}>00</Text>
            </View>
            <Text style={styles.emptyTitle}>Lưu Trữ Rỗng.</Text>
            <Text style={styles.emptyText}>Bắt đầu hành trình của bạn bằng cách thêm những công cụ AI tinh túy nhất từ cửa hàng.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER: compact, inline clear button ── */}
            <View style={styles.header}>
                <Text style={styles.chapterMarker}>CHAPTER IV · LOGISTICS</Text>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Giỏ hàng</Text>
                    {cartItems.length > 0 && (
                        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
                            <Ionicons name="trash-outline" size={13} color={ShopifyTheme.colors.textMuted} />
                            <Text style={styles.clearText}>DỌN DẸP</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* Item count badge */}
                {cartItems.length > 0 && (
                    <Text style={styles.itemCount}>{cartItems.length} SẢN PHẨM</Text>
                )}
            </View>

            {/* ── PRODUCT LIST: takes majority of space ── */}
            <FlatList
                data={cartItems}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        onUpdateQuantity={(id, change) => {
                            isRealtime.current = true;
                            updateCartItemQuantity(id, change);
                        }}
                        onRemove={(id) => {
                            isRealtime.current = false;
                            removeFromCart(id);
                        }}
                    />
                )}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* ── FOOTER: compact single bar ── */}
            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    {/* Divider line */}
                    <View style={styles.divider} />

                    {/* Summary row + button in one compact strip */}
                    <View style={styles.footerInner}>
                        {/* Left: price info */}
                        <View style={styles.priceBlock}>
                            <Text style={styles.summaryLabel}>TỔNG DỰ KIẾN</Text>
                            <Text style={styles.summaryValue}>${frozenTotal.toLocaleString()}</Text>
                            <Text style={styles.taxNote}>Thuế & phí đã tối ưu</Text>
                        </View>

                        {/* Right: checkout button */}
                        <TouchableOpacity
                            style={[styles.checkoutBtn, loading && { opacity: 0.7 }]}
                            onPress={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.checkoutBtnText}>XÁC NHẬN</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#000" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ── SUCCESS MODAL ── */}
            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.overlay}>
                    <LinearGradient colors={['#111827', '#000']} style={styles.modalCard}>
                        <Ionicons name="checkmark-circle" size={72} color={ShopifyTheme.colors.accent} />
                        <Text style={styles.modalTitle}>Thành Công.</Text>
                        <Text style={styles.modalText}>
                            Đơn hàng đã được ghi nhận vào hệ thống. Bản quyền AI của bạn đang được khởi tạo.
                        </Text>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => setShowSuccess(false)}>
                            <Text style={styles.doneBtnText}>HOÀN TẤT</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ShopifyTheme.colors.background,
    },

    // ── HEADER ──────────────────────────────────────────
    header: {
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 16,
    },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,           // ↓ reduced from 48 → less vertical space
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1.5,
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    clearText: {
        fontSize: 10,
        color: ShopifyTheme.colors.textMuted,
        fontWeight: '900',
        letterSpacing: 1,
    },
    itemCount: {
        fontSize: 10,
        fontWeight: '700',
        color: ShopifyTheme.colors.textMuted,
        letterSpacing: 1.5,
        marginTop: 6,
    },

    // ── LIST ────────────────────────────────────────────
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    romanGroup: {
        marginBottom: 20,
    },
    roman: {
        color: 'rgba(255,255,255,0.05)',
        fontSize: 80,
        fontWeight: '900',
        letterSpacing: 10,
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: ShopifyTheme.colors.textMuted,
        textAlign: 'center',
        maxWidth: 260,
        lineHeight: 22,
    },

    // ── FOOTER: compact horizontal strip ────────────────
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        backgroundColor: ShopifyTheme.colors.background,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 24,
        marginBottom: 16,
    },
    footerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        gap: 16,
    },
    priceBlock: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: ShopifyTheme.colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 26,           // ↓ reduced from 28, still impactful
        fontWeight: '900',
        color: '#FFF',
        lineHeight: 30,
    },
    taxNote: {
        fontSize: 10,
        color: ShopifyTheme.colors.textMuted,
        marginTop: 2,
        fontStyle: 'italic',
    },
    checkoutBtn: {
        backgroundColor: '#FFF',
        borderRadius: 100,
        height: 56,             // ↓ reduced from 72 → less footer height
        paddingHorizontal: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minWidth: 148,
    },
    checkoutBtnText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },

    // ── MODAL ───────────────────────────────────────────
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    modalCard: {
        width: '100%',
        borderRadius: 40,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 20,
        marginBottom: 12,
        letterSpacing: -1,
    },
    modalText: {
        fontSize: 15,
        color: ShopifyTheme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 36,
    },
    doneBtn: {
        backgroundColor: ShopifyTheme.colors.accent,
        borderRadius: 100,
        paddingHorizontal: 48,
        paddingVertical: 16,
    },
    doneBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 1,
    },
});
