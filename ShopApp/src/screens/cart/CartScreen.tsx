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

    // Reload giỏ hàng mỗi khi tab được focus
    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [fetchCart])
    );

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        try {
            const success = await checkout(cartItems, totalPrice);
            if (success) {
                // Sync CartContext state: OrderContext đã xóa Cart trong DB
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

            <View style={styles.header}>
                <Text style={styles.chapterMarker}>CHAPTER IV · LOGISTICS</Text>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Giỏ hàng</Text>
                    {cartItems.length > 0 && (
                        <TouchableOpacity onPress={clearCart}>
                            <Text style={styles.clearText}>DỌN DẸP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        onUpdateQuantity={(id, newQty) => {
                            const delta = newQty - item.quantity;
                            updateCartItemQuantity(id, delta);
                        }}
                        onRemove={removeFromCart}
                    />
                )}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>TỔNG DỰ KIẾN</Text>
                            <Text style={styles.summaryValue}>${totalPrice.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.taxNote}>Thuế và phí bản quyền đã được tối ưu.</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.checkoutBtn, loading && { opacity: 0.7 }]}
                        onPress={handleCheckout}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#000" />
                            : <>
                                <Text style={styles.checkoutBtnText}>XÁC NHẬN GIAO DỊCH</Text>
                                <Ionicons name="chevron-forward" size={18} color="#000" />
                            </>
                        }
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.overlay}>
                    <LinearGradient colors={['#111827', '#000']} style={styles.modalCard}>
                        <Ionicons name="checkmark-circle" size={80} color={ShopifyTheme.colors.accent} />
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
    header: {
        paddingHorizontal: 32,
        paddingTop: 40,
        paddingBottom: 24,
    },
    chapterMarker: {
        color: ShopifyTheme.colors.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1.5,
    },
    clearText: {
        fontSize: 11,
        color: ShopifyTheme.colors.textMuted,
        fontWeight: '900',
        letterSpacing: 1,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
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
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: ShopifyTheme.colors.textMuted,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    summaryBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 32,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: ShopifyTheme.colors.textMuted,
        letterSpacing: 1,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
    },
    taxNote: {
        fontSize: 12,
        color: ShopifyTheme.colors.textMuted,
        marginTop: 12,
        fontStyle: 'italic',
    },
    checkoutBtn: {
        backgroundColor: '#FFF',
        borderRadius: 100,
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    checkoutBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
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
        padding: 48,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 24,
        marginBottom: 16,
        letterSpacing: -1,
    },
    modalText: {
        fontSize: 16,
        color: ShopifyTheme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    doneBtn: {
        backgroundColor: ShopifyTheme.colors.accent,
        borderRadius: 100,
        paddingHorizontal: 48,
        paddingVertical: 18,
    },
    doneBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
});
