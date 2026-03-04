import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    TouchableOpacity, Modal, Platform
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { CartItem } from '../../components/CartItem';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export const CartScreen: React.FC = () => {
    const { cartItems, totalPrice, fetchCart, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
    const { checkout } = useOrder();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        try {
            const success = await checkout(cartItems, totalPrice);
            if (success) {
                setShowSuccess(true);
            } else {
                Toast.show({ type: 'error', text1: 'Checkout failed', text2: 'Please try again.' });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptyText}>Duyệt qua cửa hàng để thêm các công cụ vào bộ sưu tập của bạn.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Giỏ hàng của bạn</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* List */}
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

            {/* Footer */}
            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tạm tính</Text>
                        <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Thuế</Text>
                        <Text style={styles.summaryTax}>Đã bao gồm trong giá</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.checkoutBtn, loading && { opacity: 0.7 }]}
                        onPress={handleCheckout}
                        disabled={loading}
                    >
                        <Text style={styles.checkoutBtnLeft}>Tiến hành Thanh toán</Text>
                        <Text style={styles.checkoutBtnRight}>${totalPrice.toFixed(2)}</Text>
                    </TouchableOpacity>

                    <Text style={styles.secureText}>MÃ HÓA BẢO MẬT 256-BIT</Text>
                </View>
            )}

            {/* Success Modal */}
            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.successIconWrap}>
                            <Ionicons name="checkmark-circle" size={64} color="#16869C" />
                        </View>
                        <Text style={styles.modalTitle}>Đặt hàng Thành công!</Text>
                        <Text style={styles.modalText}>
                            Công cụ của bạn đã được khởi tạo. Thông tin kích hoạt và bản quyền đã được gửi tới email của bạn.
                        </Text>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => setShowSuccess(false)}>
                            <Text style={styles.doneBtnText}>Hoàn tất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingTop: 24,
        paddingBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.8,
    },
    clearText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    listContent: {
        paddingHorizontal: 28,
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: 240,
    },

    // Footer
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingHorizontal: 28,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 16 : 24,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    summaryTax: {
        fontSize: 13,
        color: '#94A3B8',
        fontStyle: 'italic',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    checkoutBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#16869C',
        borderRadius: 6,
        paddingHorizontal: 20,
        paddingVertical: 18,
        marginTop: 4,
    },
    checkoutBtnLeft: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
    checkoutBtnRight: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    secureText: {
        textAlign: 'center',
        fontSize: 10,
        color: '#CBD5E1',
        letterSpacing: 1.5,
        fontWeight: '600',
    },

    // Success modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
    },
    successIconWrap: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    modalText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    doneBtn: {
        backgroundColor: '#0F172A',
        borderRadius: 6,
        paddingHorizontal: 40,
        paddingVertical: 14,
    },
    doneBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
});
